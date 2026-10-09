import json
import logging
from typing import Optional, Dict, Any, List
from ..config import GEMINI_API_KEY, GEMINI_MODEL, is_gemini_configured

logger = logging.getLogger(__name__)

MODELS_PRIORITY: List[str] = [
    GEMINI_MODEL,
    "gemini-flash-latest",
    "gemini-2.5-flash",
    "gemini-2.5-pro"
]

class GeminiService:
    def __init__(self):
        self.client = None
        if is_gemini_configured():
            try:
                from google import genai
                self.client = genai.Client(api_key=GEMINI_API_KEY)
                logger.info("Initialized Google GenAI client successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini Client: {e}")
                self.client = None

    def generate_json(self, prompt: str, schema_description: str) -> Optional[Dict[str, Any]]:
        if not self.client:
            return None
        
        full_prompt = f"""
You are EcoTwin's Planetary AI engine. Return ONLY valid JSON adhering strictly to this schema:
{schema_description}

User Request:
{prompt}
"""
        for model_name in MODELS_PRIORITY:
            try:
                response = self.client.models.generate_content(
                    model=model_name,
                    contents=full_prompt,
                    config={"response_mime_type": "application/json"}
                )
                if response and response.text:
                    return json.loads(response.text)
            except Exception as e:
                logger.warning(f"Gemini generate_json with {model_name} failed: {e}. Trying next model...")
                continue
        return None

    def analyze_image_or_text(
        self, 
        text_prompt: str, 
        image_bytes: Optional[bytes] = None, 
        mime_type: str = "image/jpeg"
    ) -> Optional[Dict[str, Any]]:
        if not self.client:
            return None

        from google.genai import types
        contents = [text_prompt]
        if image_bytes:
            contents.append(types.Part.from_bytes(data=image_bytes, mime_type=mime_type))

        for model_name in MODELS_PRIORITY:
            try:
                response = self.client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config={"response_mime_type": "application/json"}
                )
                if response and response.text:
                    return json.loads(response.text)
            except Exception as e:
                logger.warning(f"Gemini analyze with {model_name} failed: {e}. Trying next model...")
                continue

        return None

gemini_service = GeminiService()
