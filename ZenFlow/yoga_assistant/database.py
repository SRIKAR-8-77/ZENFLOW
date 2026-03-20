from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os

# --- Database Setup ---
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./yoga_app.db")

# For SQLite, we might need connect_args={"check_same_thread": False}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Models ---

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class YogaSession(Base):
    __tablename__ = "yoga_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    pose_name = Column(String)
    confidence_score = Column(Float)
    accuracy_score = Column(Float)
    feedback_text = Column(Text)
    feedback_notes = Column(Text)  # For manual user feedback
    feedback_analysis = Column(Text) # For AI analysis of feedback
    duration = Column(Integer, default=0) # Duration in seconds
    date = Column(DateTime, default=datetime.datetime.utcnow)

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    entry_text = Column(Text)
    date = Column(DateTime, default=datetime.datetime.utcnow)

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user_query = Column(Text)
    bot_response = Column(Text)
    created_date = Column(DateTime, default=datetime.datetime.utcnow)

class CalendarPlan(Base):
    __tablename__ = "calendar_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(Text)
    planned_date = Column(DateTime)
    status = Column(String, default="planned") # planned, completed, skipped
    session_id = Column(Integer, ForeignKey("yoga_sessions.id"), nullable=True)
    created_date = Column(DateTime, default=datetime.datetime.utcnow)
