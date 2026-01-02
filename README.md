# ZenFlow: The Digital Sanctuary 🧘‍♂️✨

**ZenFlow** is a premium, AI-powered yoga and wellness sanctuary designed to bridge the gap between physical practice and mental presence. It leverages state-of-the-art Computer Vision and Agentic AI to provide a deeply personalized, professional-grade yoga experience.

![ZenFlow Banner](https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200)

---

## 🌟 The Core Experience

### 🔭 Vision Lab (Practice)
Our core engine for specialized video analysis. Unlike generic fitness trackers, ZenFlow's Vision Lab uses **Ultra-Res 4FPS Sampling** to analyze your flow with surgical precision.
- **Multi-Pose Detection**: Automatically identifies every distinct pose in a single video session.
- **Micro-Metrics**: Tracks individual duration, accuracy, and form consistency for every asana.
- **10-Second Quality Gate**: Filters out transitions and transient movements, ensuring your vault only contains meaningful practice data.

### 🤖 AI Mentor (Coach)
A data-driven, empathetic guide powered by **Gemini** and **CrewAI**.
- **Personalized Context**: The mentor has access to your full history, including session durations, accuracy trends, and recent journal entries.
- **Biomechanical Feedback**: Receives deep insights from the Vision Lab to suggest regressions or modifications tailored to your current form.

### 📓 Wellness Reflection (Journal)
Integrate your mental state with your physical practice. The AI Mentor analyzes your reflections to adjust coaching advice based on your mood and recovery status.

### 🏛️ The Vault (Library)
A comprehensive guide to asanas, featuring detailed technical breakdowns and reference imagery.

---

## 🏗️ Technical Architecture

| Layer | System | Technology |
| :--- | :--- | :--- |
| **Frontend** | **Zen UI** | React 18, Vite, Tailwind CSS, Framer Motion (Glassmorphic Design) |
| **Backend** | **Flow API** | FastAPI, Python (Uvicorn) |
| **Vision** | **Vision Engine** | MediaPipe (Pose Landmarker), TensorFlow/Keras (.keras classification) |
| **Intelligence**| **Agentic Core** | CrewAI, Gemini 2.0 Flash (Context-Aware Reasoning) |
| **Storage** | **Secure Ledger** | SQLite + SQLAlchemy |

---

## 🚀 Installation & Setup

### 1. Prerequisites
- **Python 3.10+** (Recommend using `uv` for dependency management)
- **Node.js 18+**
- **Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/app/apikey))

### 2. Backend Setup
```bash
cd yoga_assistant
# Create .env and add GEMINI_API_KEY=your_key_here
uv run python -m uvicorn backend:app --host 0.0.0.0 --port 8001
```

### 3. Frontend Setup
```bash
cd zenflow_frontend
npm install
npm run dev
```

---

## 🏛️ Project Structure
```text
ZenFlow/
├── yoga_assistant/          # FastAPI Backend & ML Orchestration
│   ├── YOGA_NOTEBOOK/       # Pre-trained ML Artifacts (.keras, .task, .pkl)
│   ├── backend.py           # Core System API
│   └── yoga_assistant.py    # AI Mentor (CrewAI Logic)
├── zenflow_frontend/        # React + Vite Sanctuary UI
│   ├── src/components/      # Vision Lab, Coach, Sanctuary, etc.
│   └── src/index.css        # Glassmorphic Design System
└── yoga_app.db              # Local Presence Database
```

---

*“Find your center, the rest will follow.”*  
**Made with 🧘‍♂️ by the ZenFlow Team.**
