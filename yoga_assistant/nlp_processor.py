import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

def analyze_feedback_text(text: str) -> dict:
    """Analyzes user feedback using the Gemini API for sentiment."""
    
    if not model:
        return {
            "sentiment": "unknown",
            "sentiment_score": 0.0,
            "error": "Gemini API not configured"
        }

    try:
        prompt = (
            f"Analyze the sentiment of this yoga feedback: '{text}'. "
            "Respond ONLY with a JSON object in this exact format: "
            "{\"sentiment\": \"POSITIVE/NEGATIVE/NEUTRAL\", \"sentiment_score\": 0.0-1.0}"
        )
        
        response = model.generate_content(prompt)
        # Simple extraction of JSON from response text
        result_text = response.text.strip()
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()
            
        import json
        analysis = json.loads(result_text)
        
        return {
            "sentiment": analysis.get('sentiment', 'NEUTRAL'),
            "sentiment_score": analysis.get('sentiment_score', 0.5)
        }
        
    except Exception as e:
        print(f"Error during Gemini sentiment analysis: {e}")
        return {
            "sentiment": "error",
            "sentiment_score": 0.0
        }