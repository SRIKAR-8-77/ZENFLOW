import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import joblib
import tempfile
import os
import datetime
from tensorflow.keras.models import load_model
from sklearn.preprocessing import LabelEncoder, StandardScaler
from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json
from dotenv import load_dotenv

# --- Local Modules ---
import database
import auth
from database import User, YogaSession, JournalEntry, ChatHistory, CalendarPlan
from accuracy_calculator import calculate_pose_accuracy
from nlp_processor import analyze_feedback_text
from yoga_assistant import crew

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# --- Initialize DB ---
database.Base.metadata.create_all(bind=database.engine)

# --- Authentication Dependency ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")
        if username is None or user_id is None:
            raise credentials_exception
        token_data = auth.TokenData(username=username, user_id=user_id)
    except auth.JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception
    return user

# --- Fast API Initialization ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static images
if os.path.exists('reference_images'):
    app.mount("/images", StaticFiles(directory="reference_images"), name="images")

# --- Global Model & Artifact Loading ---
print("--- STARTING MODEL LOADING ---")
try:
    print("Loading Keras model...")
    model = load_model(os.path.join('YOGA_NOTEBOOK', 'best_yoga_model.keras'))
    print("Loading Label Encoder...")
    le = joblib.load(os.path.join('YOGA_NOTEBOOK', 'label_encoder.pkl'))
    print("Loading Scaler...")
    scaler = joblib.load(os.path.join('YOGA_NOTEBOOK', 'scaler.pkl'))
    print("Loading Imputer...")
    imputer = joblib.load(os.path.join('YOGA_NOTEBOOK', 'col_means.pkl'))
    
    # --- Patch for scikit-learn version compatibility ---
    # Newer versions of scikit-learn expect _fill_dtype on SimpleImputer
    if not hasattr(imputer, '_fill_dtype'):
        imputer._fill_dtype = np.float64
    
    print("Setting up MediaPipe landmarker...")
    model_path = os.path.join('YOGA_NOTEBOOK', 'pose_landmarker_heavy.task')
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"MediaPipe task file '{model_path}' not found.")

    BaseOptions = mp.tasks.BaseOptions
    PoseLandmarker = mp.tasks.vision.PoseLandmarker
    PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
    VisionRunningMode = mp.tasks.vision.RunningMode

    options = PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=model_path),
        running_mode=VisionRunningMode.IMAGE,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5
    )
    landmarker = PoseLandmarker.create_from_options(options)
    print("Models and artifacts loaded successfully.")
except Exception as e:
    print(f"CRITICAL ERROR: Failed to load models/artifacts: {e}")
    model, le, scaler, imputer, landmarker = None, None, None, None, None

import collections

# --- Helper Functions ---
def calculate_angle(a, b, c):
    """Calculates the angle at point b given points a, b, and c."""
    a, b, c = np.array(a), np.array(b), np.array(c)
    ba, bc = a - b, c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    return np.degrees(np.arccos(cosine_angle))

def extract_features_from_image_robust(image_path, landmarker, visibility_threshold=0.5):
    try:
        image = cv2.imread(image_path)
        if image is None: return None
        
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)
        detection_result = landmarker.detect(mp_image)

        if not detection_result.pose_landmarks: return None
        landmarks = detection_result.pose_landmarks[0]
        features = {}

        for i, lm in enumerate(landmarks):
            features[f'landmark_{i}_x'] = lm.x
            features[f'landmark_{i}_y'] = lm.y
            features[f'landmark_{i}_z'] = lm.z
            features[f'landmark_{i}_v'] = lm.visibility

        IDX = {
            'right_shoulder': 12, 'right_elbow': 14, 'right_wrist': 16,
            'right_hip': 24,      'right_knee': 26,  'right_ankle': 28,
            'left_shoulder': 11,  'left_elbow': 13,  'left_wrist': 15,
            'left_hip': 23,       'left_knee': 25,   'left_ankle': 27
        }
        
        def get_coords(index):
            lm = landmarks[index]
            return [lm.x, lm.y, lm.z] if lm.visibility > visibility_threshold else None

        joints = {name: get_coords(idx) for name, idx in IDX.items()}
        angle_defs = {
            'angle_right_elbow': ('right_shoulder', 'right_elbow', 'right_wrist'),
            'angle_left_elbow': ('left_shoulder', 'left_elbow', 'left_wrist'),
            'angle_right_shoulder': ('right_hip', 'right_shoulder', 'right_elbow'),
            'angle_left_shoulder': ('left_hip', 'left_shoulder', 'left_elbow'),
            'angle_right_hip': ('right_shoulder', 'right_hip', 'right_knee'),
            'angle_left_hip': ('left_shoulder', 'left_hip', 'left_knee'),
            'angle_right_knee': ('right_hip', 'right_knee', 'right_ankle'),
            'angle_left_knee': ('left_hip', 'left_knee', 'left_ankle')
        }

        for angle_name, (a, b, c) in angle_defs.items():
            if joints[a] and joints[b] and joints[c]:
                features[angle_name] = calculate_angle(joints[a], joints[b], joints[c])
            else:
                features[angle_name] = np.nan
        return features
    except Exception as e:
        print(f"Extraction Error: {e}")
        return None

# --- Pydantic Models for Requests ---
class UserRegister(BaseModel):
    username: str
    password: str
    email: str

class FeedbackRequest(BaseModel):
    sessionId: int # Changed from str to int for SQL ID
    feedback: str

class JournalEntryRequest(BaseModel):
    entry: str

class QueryModel(BaseModel):
    query: str

class PlanItem(BaseModel):
    title: str
    description: str
    planned_date: str # ISO format date string

class ApprovePlanRequest(BaseModel):
    plans: list[PlanItem]

# --- AUTH ENDPOINTS ---

@app.post("/auth/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_pwd = auth.get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "user_id": new_user.id}

@app.post("/auth/token", response_model=auth.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = datetime.timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username, "id": user.id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- APP ENDPOINTS ---

@app.post("/upload-image/")
async def upload_image(
        file: UploadFile = File(...),
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    try:
        if model is None or landmarker is None:
             raise HTTPException(status_code=500, detail="Server models not initialized correctly.")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name

        features_dict = extract_features_from_image_robust(tmp_path, landmarker)
        
        if features_dict is None:
            os.unlink(tmp_path)
            raise HTTPException(status_code=400, detail="No pose detected in the image.")

        # Predict
        features_list = list(features_dict.values())
        features_array = np.array([features_list])
        features_imputed = imputer.transform(features_array)
        features_scaled = scaler.transform(features_imputed)
        prediction = model.predict(features_scaled)
        predicted_class_index = np.argmax(prediction)
        predicted_pose_name = le.inverse_transform([predicted_class_index])[0]
        confidence = float(np.max(prediction))

        # Accuracy
        pose_accuracy_data = calculate_pose_accuracy(
            user_features=features_dict,
            detected_pose_name=predicted_pose_name
        )

        # Save to SQLite
        new_session = YogaSession(
            user_id=current_user.id,
            pose_name=predicted_pose_name,
            confidence_score=confidence,
            accuracy_score=pose_accuracy_data.get("accuracy"),
            feedback_text=pose_accuracy_data.get("feedback"),
            date=datetime.datetime.utcnow()
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)

        os.unlink(tmp_path)
        
        return {
            "pose": predicted_pose_name,
            "confidence_score": confidence,
            "accuracy": pose_accuracy_data.get("accuracy"),
            "feedback": pose_accuracy_data.get("feedback"),
            "details": pose_accuracy_data.get("details"),
            "sessionId": new_session.id
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-session/")
async def analyze_session(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyzes a video clip, detects all poses, and calculates held duration for each."""
    try:
        if model is None or landmarker is None:
            raise HTTPException(status_code=500, detail="Server models not initialized.")

        # Save uploaded video to temp
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            contents = await file.read()
            tmp.write(contents)
            video_path = tmp.name

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            os.unlink(video_path)
            raise HTTPException(status_code=400, detail="Invalid video file.")

        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration_sec = total_frames / fps if fps > 0 else 0
        
        # Sample FOUR frames per second for ultra-precision
        sample_interval = max(int(fps / 4), 1)
        
        # Track statistics for ALL poses detected
        pose_data = collections.defaultdict(lambda: {"count": 0, "accuracies": [], "feedbacks": []})
        
        print(f"--- Starting Analysis (Ultra-Res 4fps) for {total_frames} frames ({duration_sec:.1f}s) ---")
        frame_idx = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_idx % sample_interval == 0:
                with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as img_tmp:
                    cv2.imwrite(img_tmp.name, frame)
                    img_path = img_tmp.name
                
                features_dict = extract_features_from_image_robust(img_path, landmarker)
                os.unlink(img_path)
                
                if features_dict:
                    features_list = list(features_dict.values())
                    features_array = np.array([features_list])
                    features_imputed = imputer.transform(features_array)
                    features_scaled = scaler.transform(features_imputed)
                    prediction = model.predict(features_scaled)
                    
                    idx = np.argmax(prediction)
                    conf = float(np.max(prediction))
                    pose_name = le.inverse_transform([idx])[0]
                    
                    if conf > 0.45: # Lowered threshold to be more inclusive
                        pose_data[pose_name]["count"] += 1
                        pose_acc_data = calculate_pose_accuracy(features_dict, pose_name)
                        pose_data[pose_name]["accuracies"].append(pose_acc_data.get("accuracy", 0))
                        pose_data[pose_name]["feedbacks"].append(pose_acc_data.get("feedback", ""))
                
            frame_idx += 1
        
        cap.release()
        os.unlink(video_path)
        
        if not pose_data:
            raise HTTPException(status_code=400, detail="No recognizable yoga poses detected in the clip.")
        
        results = []
        for pose_name, data in pose_data.items():
            duration = round(data["count"] * 0.25, 2) # Multiplied by 0.25 because we sample 4 frames/sec
            if duration < 10.0: # Minimum threshold of 10 seconds to filter out noise
                print(f"Skipping {pose_name}: Duration {duration}s < 10s threshold")
                continue
                
            avg_accuracy = sum(data["accuracies"]) / len(data["accuracies"])
            best_feedback = data["feedbacks"][-1] if data["feedbacks"] else "Presence detected."
            
            print(f"Aggregating: {pose_name} | Duration: {duration}s | Acc: {avg_accuracy:.1f}%")
            
            # Save to DB
            duration_int = int(round(duration))
            new_session = YogaSession(
                user_id=current_user.id,
                pose_name=pose_name,
                confidence_score=0.0,
                accuracy_score=round(avg_accuracy),
                feedback_text=f"Held for {duration_int} seconds. {best_feedback}",
                duration=duration_int,
                date=datetime.datetime.utcnow()
            )
            db.add(new_session)
            results.append({
                "pose": pose_name,
                "accuracy": round(avg_accuracy),
                "duration": duration_int,
                "feedback": f"You held {pose_name} for {duration_int} seconds.",
                "details": f"Form accuracy: {round(avg_accuracy)}%. {best_feedback}",
                "sessionId": None
            })

        db.commit()
        
        return {
            "total_duration": round(duration_sec),
            "poses_detected": len(results),
            "results": results
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Video Analysis Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/submit-feedback/")
async def submit_feedback(
        feedback_req: FeedbackRequest,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    try:
        analysis = analyze_feedback_text(feedback_req.feedback)
        
        session = db.query(YogaSession).filter(YogaSession.id == feedback_req.sessionId, YogaSession.user_id == current_user.id).first()
        if not session:
             raise HTTPException(status_code=404, detail="Session not found")
        
        session.feedback_notes = feedback_req.feedback
        session.feedback_analysis = analysis
        db.commit()
        
        return {"message": "Feedback submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing feedback: {e}")


@app.post("/add-journal-entry/")
async def add_journal_entry(
        entry_req: JournalEntryRequest,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    try:
        new_entry = JournalEntry(
            user_id=current_user.id,
            entry_text=entry_req.entry,
            date=datetime.datetime.utcnow()
        )
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
        return {"message": "Notes added successfully", "id": new_entry.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding journal entry: {e}")


@app.get("/get-sessions/")
async def get_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(YogaSession).filter(YogaSession.user_id == current_user.id).order_by(YogaSession.date.desc()).all()
    return sessions


@app.get("/get-journal-entries/")
async def get_journal_entries(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entries = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).order_by(JournalEntry.date.desc()).all()
    return entries

@app.get("/get-coach-history/")
async def get_coach_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Assuming coach history is stored in ChatHistory table now
    history = db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).order_by(ChatHistory.created_date.desc()).all()
    return history

@app.post("/ask-gemini/")
async def ask_gemini(data: QueryModel, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_query = data.query
    if not user_query:
        raise HTTPException(status_code=422, detail="Query cannot be empty")

    try:
        # Pass user_id (int) to the crew function
        result = crew(user_query, current_user.id)

        # result is a CrewOutput object, convert to string for DB
        bot_response_text = str(result)

        # Save to ChatHistory
        new_chat = ChatHistory(
            user_id=current_user.id,
            user_query=user_query,
            bot_response=bot_response_text,
            created_date=datetime.datetime.utcnow()
        )
        db.add(new_chat)
        db.commit()

        return {"response": bot_response_text}

    except Exception as e:
        print(f"Error in ask-gemini endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/get-calendar/")
async def get_calendar(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        sessions = db.query(YogaSession).filter(YogaSession.user_id == current_user.id).all()
        plans = db.query(CalendarPlan).filter(CalendarPlan.user_id == current_user.id).all()
        return {"sessions": sessions, "plans": plans}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/approve-plan/")
async def approve_plan(req: ApprovePlanRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        for item in req.plans:
            new_plan = CalendarPlan(
                user_id=current_user.id,
                title=item.title,
                description=item.description,
                planned_date=datetime.datetime.fromisoformat(item.planned_date.replace('Z', '')),
                status="planned"
            )
            db.add(new_plan)
        db.commit()
        return {"message": "Plans added to calendar successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-streak/")
async def get_streak(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        session_dates = db.query(YogaSession.date).filter(YogaSession.user_id == current_user.id).order_by(YogaSession.date.desc()).all()
        if not session_dates:
            return {"streak": 0}
        unique_dates = sorted(list(set([d[0].date() for d in session_dates])), reverse=True)
        today = datetime.date.today()
        yesterday = today - datetime.timedelta(days=1)
        if unique_dates[0] not in [today, yesterday]:
            return {"streak": 0}
        streak = 0
        current_check = unique_dates[0]
        for date in unique_dates:
            if date == current_check:
                streak += 1
                current_check -= datetime.timedelta(days=1)
            else:
                break
        return {"streak": streak}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-exercises/")
async def get_exercises():
    try:
        import json
        with open('pose_templates.json', 'r') as f:
            templates = json.load(f)
        
        # Helper to find matching image
        images = os.listdir('reference_images') if os.path.exists('reference_images') else []
        
        exercises = []
        for key, data in templates.items():
            if key == "alanasana":
                continue
            
            # Match key to image filename
            # e.g. adho_mukha_svanasana -> Adho Mukha Svanasana.jpeg/jpg
            display_name = key.replace("_", " ").title()
            thumbnail = ""
            for img in images:
                if img.lower().startswith(display_name.lower()):
                    thumbnail = f"images/{img}"
                    break
            
            exercises.append({
                "id": key,
                "name": display_name,
                "description": data.get("description", ""),
                "thumbnail": thumbnail,
                "category": "Balance" if "vrksasana" in key or "chandrasana" in key else "Strength" if "virabhadrasana" in key or "phalakasana" in key else "Flexibility",
                "angles": data.get("angles", {})
            })
        return exercises
    except Exception as e:
        print(f"Error fetching exercises: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")