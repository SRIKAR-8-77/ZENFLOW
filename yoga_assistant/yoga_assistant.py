import os
import json
from datetime import datetime, timedelta
from crewai import Agent, Task, Crew, LLM
from crewai.tools import BaseTool
from dotenv import load_dotenv
from sqlalchemy.orm import Session

# --- Local Modules ---
import database
from database import User, YogaSession, JournalEntry, ChatHistory, CalendarPlan

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# ----------------------------
# Custom Tool for SQL Data Access
# ----------------------------
class SQLYogaTool(BaseTool):
    """A tool to fetch a user's yoga session history, journal entries, and chat history from the local SQL database."""
    name: str = "SQL Yoga Data Fetcher"
    description: str = "Retrieves user history (yoga sessions, journals, past chats) from the database to provide context for coaching."

    def _run(self, user_id: int = None) -> str:
        if user_id is None:
            return "Error: user_id is required."

        try:
            # Create a new session for this tool execution
            db: Session = database.SessionLocal()
            
            user_data = {}
            
            # 1. Fetch User Info
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                db.close()
                return "Error: User not found."
            
            user_data['username'] = user.username

            # 2. Fetch Last 10 Sessions
            sessions = db.query(YogaSession).filter(YogaSession.user_id == user_id).order_by(YogaSession.date.desc()).limit(10).all()
            user_data['recent_sessions'] = [
                {
                    "pose": s.pose_name,
                    "accuracy": s.accuracy_score,
                    "feedback": s.feedback_text,
                    "notes": s.feedback_notes,
                    "duration": s.duration,
                    "date": s.date.isoformat()
                } for s in sessions
            ]

            # 3. Fetch Last 5 Journal Entries
            journals = db.query(JournalEntry).filter(JournalEntry.user_id == user_id).order_by(JournalEntry.date.desc()).limit(5).all()
            user_data['journal_entries'] = [
                {
                    "entry": j.entry_text,
                    "date": j.date.isoformat()
                } for j in journals
            ]

            # 4. Fetch Last 5 Chat Interactions
            chats = db.query(ChatHistory).filter(ChatHistory.user_id == user_id).order_by(ChatHistory.created_date.desc()).limit(5).all()
            user_data['recent_chats'] = [
                {
                    "user_query": c.user_query,
                    "bot_response": c.bot_response[:100] + "...", # Truncate response to save tokens
                    "date": c.created_date.isoformat()
                } for c in chats
            ]

            # 5. Fetch Calendar Plans
            plans = db.query(CalendarPlan).filter(CalendarPlan.user_id == user_id).order_by(CalendarPlan.planned_date.asc()).limit(10).all()
            user_data['upcoming_plans'] = [
                {
                    "title": p.title,
                    "description": p.description,
                    "date": p.planned_date.isoformat(),
                    "status": p.status
                } for p in plans
            ]

            db.close()
            return json.dumps(user_data, indent=2)

        except Exception as e:
            return f"Database Error: {e}"

# ----------------------------
# Agent and Task Definitions
# ----------------------------
llm = LLM(
    model="gemini/gemini-2.5-flash",
    api_key=GEMINI_API_KEY
)

# Instantiate the custom SQL tool
sql_tool = SQLYogaTool()

# Define the Yoga Assistant Agent
yoga_assistant_agent = Agent(
    role="Personal Yoga & Wellness Mentor",
    goal="Guide the user through their yoga journey with empathy, wisdom, and data-backed insights.",
    backstory=(
        "You are a wise and empathetic Yoga Mentor. "
        "You have access to the user's data (sessions, journals, chats) which provides you with deep context. "
        "However, you ARE NOT a data reporter. You use this data naturally, like a human coach. "
        "For simple greetings (hi, hello), respond warmly and concisely. You might briefly acknowledge their mood or a recent streak, but DO NOT provide a full data audit unless it's relevant. "
        "When giving advice, connect their recent physical accuracy scores with their mental reflections. "
        "If a user asks for a plan, provide it in the following JSON format inside a code block with the 'plan-json' tag:\n"
        "```plan-json\n"
        "[\n"
        "  {\"title\": \"Morning Flow\", \"description\": \"Focus on breathing\", \"planned_date\": \"2025-12-30T08:00:00Z\"},\n"
        "  ...\n"
        "]\n"
        "```\n"
        "Always recommend poses that align with their current form and emotional well-being."
    ),
    llm=llm,
    verbose=True,
    tools=[sql_tool]
)

def crew(user_query: str, user_id: int) -> str:
    """
    Orchestrates the CrewAI process to answer a user query with personalization.
    """
    
    yoga_analysis_task = Task(
        description=(
            f"Connect with user history for user_id={user_id}. "
            f"Respond to the user's query: '{user_query}' "
            "Use recent session data and journal moods ONLY if it adds value or depth to your answer. "
            "Be conversational. If the query is just a greeting, be warm and inviting. "
            "If they ask for advice or show pain, delve deep into their history to find the 'why'. "
            "Never sound like a robot reading a spreadsheet. Be their Mentor."
        ),
        agent=yoga_assistant_agent,
        expected_output="A conversational, personalized response that intelligently leverages history without repetitive data dumping.",
    )

    my_crew = Crew(
        agents=[yoga_assistant_agent],
        tasks=[yoga_analysis_task],
        verbose=True
    )

    result = my_crew.kickoff()
    return result