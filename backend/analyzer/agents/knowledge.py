import os
import json
import logging
from pydantic import BaseModel, Field
from google.genai import types

from .client import get_client

logger = logging.getLogger(__name__)

class KnowledgeResult(BaseModel):
    habitat: str = Field(description="Typical habitat description of the species (e.g. Dense forests, rocky terrain)")
    activity_pattern: str = Field(description="Must be one of: Nocturnal, Diurnal, Crepuscular")
    general_behavior: str = Field(description="Behavior description, e.g. shy and reclusive unless cornered")
    fun_fact: str = Field(description="An interesting, engaging trivia or fun fact about this species")

class KnowledgeAgent:
    """
    Lookups ecological profile cards for verified species.
    If the species is not in the local JSON database, queries Gemini API.
    Enforces a strict 250 characters limit per field for neat UI cards rendering.
    """
    def __init__(self, species_db_path: str = None):
        if species_db_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            species_db_path = os.path.join(base_dir, "mock_data", "species_db.json")
        self.species_db_path = species_db_path
        self.species_db = {}
        try:
            with open(self.species_db_path, "r") as f:
                self.species_db = json.load(f)
        except Exception:
            pass

    def get_profile(self, verified_species: dict) -> dict:
        scientific_name = verified_species.get("scientific_name", "")
        common_name = verified_species.get("common_name", "")

        # Default fallback card content
        fallback_profile = {
            "habitat": "Varied natural habitats, including woodlands, grasslands, and rural regions.",
            "activity_pattern": "Diurnal",
            "general_behavior": "Generally seeks to avoid contact with humans and behaves defensively only if threatened or cornered.",
            "fun_fact": "Every creature plays an essential role in maintaining biodiversity and the balance of its ecosystem."
        }

        # 1. Attempt lookup from database
        profile = None
        if scientific_name in self.species_db:
            profile = self.species_db[scientific_name]
        elif scientific_name in ["Unknown", ""] or common_name in ["Unidentified Animal", "Unknown"]:
            # Optimize latency: Avoid calling Gemini for generic unknown fallback profiles
            profile = fallback_profile

        # 2. If not found in database, call Gemini API
        if profile is None:
            try:
                client = get_client()
                prompt = (
                    f"Provide ecological profile details for: {common_name} ({scientific_name}).\n"
                    "Provide typical habitat, activity pattern (Nocturnal, Diurnal, or Crepuscular), general behavior, and one fun fact."
                )
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=KnowledgeResult,
                        temperature=0.3,
                    ),
                )
                profile = json.loads(response.text)
            except Exception as e:
                logger.error(f"Gemini API Knowledge lookup failed for {scientific_name}: {str(e)}. Using default fallback.")
                profile = fallback_profile

        # Truncation function to strictly enforce the under-250-character constraint
        def clean_and_truncate(text: str, max_len: int = 250) -> str:
            if not text:
                return ""
            if len(text) > max_len:
                return text[:max_len - 3] + "..."
            return text

        return {
            "habitat": clean_and_truncate(profile.get("habitat", fallback_profile["habitat"])),
            "activity_pattern": profile.get("activity_pattern", fallback_profile["activity_pattern"]),
            "general_behavior": clean_and_truncate(profile.get("general_behavior", fallback_profile["general_behavior"])),
            "fun_fact": clean_and_truncate(profile.get("fun_fact", fallback_profile["fun_fact"]))
        }
