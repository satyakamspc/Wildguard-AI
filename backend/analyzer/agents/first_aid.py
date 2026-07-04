import os
import json
import logging
from pydantic import BaseModel, Field
from typing import List
from google.genai import types

from .client import get_client

logger = logging.getLogger(__name__)

class FirstAidResult(BaseModel):
    disclaimer: str = Field(description="Medical liability disclaimer")
    immediate_steps: List[str] = Field(description="List of ordered first aid instructions with active verbs (e.g. Wash, Keep still)")
    critical_warnings: List[str] = Field(description="List of critical warnings of what NOT to do (CRITICAL DON'Ts)")
    paramedic_checklist: List[str] = Field(description="List of observations/notes to record for paramedics")

class FirstAidAgent:
    """
    Selects emergency first-aid protocols matching the hazard.
    If the creature is not in the local mock JSON database, queries Gemini API.
    Enforces constraints:
    - Clear, numbered list with active verbs.
    - Explicit list of critical warnings (DON'Ts).
    - The first step must ALWAYS be calling 911/112 immediately.
    """
    def __init__(self, first_aid_db_path: str = None):
        if first_aid_db_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            first_aid_db_path = os.path.join(base_dir, "mock_data", "first_aid_db.json")
        self.first_aid_db_path = first_aid_db_path
        self.first_aid_db = {}
        try:
            with open(self.first_aid_db_path, "r") as f:
                self.first_aid_db = json.load(f)
        except Exception:
            pass

    def get_first_aid(self, verified_species: dict, primary_hazard: str = "") -> dict:
        common_name = verified_species.get("common_name", "")
        scientific_name = verified_species.get("scientific_name", "")

        # Default fallback procedure if everything else fails
        default_aid = {
            "disclaimer": "This is a general first-aid guide. Seek professional medical assistance immediately.",
            "immediate_steps": [
                "CALL EMERGENCY SERVICES (e.g., 911/112) IMMEDIATELY.",
                "Move to a safe distance from the creature to prevent further injury.",
                "Wash any cuts, bites, or scratches gently with clean water and mild soap.",
                "Keep the affected area clean and dry, and avoid excessive physical exertion."
            ],
            "critical_warnings": [
                "DO NOT attempt to capture or kill the creature.",
                "DO NOT apply ice or tight restrictive bands directly to the wound unless medically instructed."
            ],
            "paramedic_checklist": [
                "Note the exact time of the encounter.",
                "Observe the patient for any rapid breathing, hives, or swelling."
            ]
        }

        # 1. Attempt to resolve from database
        profile = None
        if scientific_name in self.first_aid_db:
            profile = self.first_aid_db[scientific_name]
        elif common_name in ["Unidentified Animal", "Unknown"] or scientific_name in ["Unknown", ""]:
            # Optimize latency: Avoid calling Gemini for generic unknown fallback profiles
            profile = default_aid
        
        # 2. If not found in database, call Gemini API
        if profile is None:
            try:
                client = get_client()
                prompt = (
                    f"Provide medical first-aid steps for a human injured by a: {common_name} ({scientific_name}).\n"
                    f"The primary hazard is classified as: '{primary_hazard}'.\n"
                    "Compile a medical disclaimer, clear ordered immediate steps using active verbs, a list of critical warnings (cautions/DON'Ts), "
                    "and a paramedic observation checklist."
                )
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=FirstAidResult,
                        temperature=0.2,
                    ),
                )
                profile = json.loads(response.text)
            except Exception as e:
                logger.error(f"Gemini API First Aid lookup failed for {common_name}: {str(e)}. Using default fallback.")
                profile = default_aid

        # Enforce constraint: First step must always be call emergency services
        steps = list(profile.get("immediate_steps", default_aid["immediate_steps"]))
        emergency_call_text = "CALL EMERGENCY SERVICES (e.g., 911/112) IMMEDIATELY."
        
        if not steps:
            steps = [emergency_call_text]
        elif not steps[0].startswith("CALL EMERGENCY SERVICES"):
            steps.insert(0, emergency_call_text)
        else:
            # Override to make sure it matches the exact required phrasing
            steps[0] = emergency_call_text

        return {
            "disclaimer": profile.get("disclaimer", default_aid["disclaimer"]),
            "immediate_steps": steps,
            "critical_warnings": profile.get("critical_warnings", default_aid["critical_warnings"]),
            "paramedic_checklist": profile.get("paramedic_checklist", default_aid["paramedic_checklist"])
        }
