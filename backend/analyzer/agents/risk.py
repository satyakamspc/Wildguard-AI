import logging
from pydantic import BaseModel, Field
from typing import List
from google.genai import types

from .client import get_client

logger = logging.getLogger(__name__)

class RiskResult(BaseModel):
    risk_rating: str = Field(description="Risk level of the creature. Must be one of: Critical, High, Medium, Low")
    primary_hazard: str = Field(description="Primary threat type, e.g. Venomous bite, Neurotoxic sting, Territorial charge")
    proactive_precautions: List[str] = Field(description="Proactive rules/precautions for encountering the animal (2-4 items)")

class RiskAgent:
    """
    Evaluates creature hazard levels (Critical, High, Medium, Low) and suggests precautions.
    If the creature is not in the local mock profiles database, queries Gemini API.
    Enforces a safety-first fallback for low-confidence ("High Uncertainty") identifications.
    """
    def assess_danger(self, verified_species: dict, verified_confidence: float = 1.0) -> dict:
        common_name = verified_species.get("common_name", "")
        scientific_name = verified_species.get("scientific_name", "")
        c_name_lower = common_name.lower()

        # Standard profiles for known species
        profiles = {
            "Apis mellifera": {
                "risk_rating": "Low",
                "primary_hazard": "Venomous sting",
                "proactive_precautions": [
                    "Avoid swatting or making sudden movements near the bee.",
                    "Slowly walk away from areas with dense bee activity.",
                    "Do not disturb hives or nesting sites."
                ]
            },
            "Crotalus oreganus": {
                "risk_rating": "Critical",
                "primary_hazard": "Venomous bite",
                "proactive_precautions": [
                    "Back away slowly and do not make sudden movements.",
                    "Maintain a distance of at least 15 feet.",
                    "Do not corner, attempt to touch, or capture the snake.",
                    "Avoid high grass and keep to clear paths."
                ]
            },
            "Latrodectus mactans": {
                "risk_rating": "High",
                "primary_hazard": "Neurotoxic bite",
                "proactive_precautions": [
                    "Do not touch the spider or its web.",
                    "Inspect logs, rocks, and dark corners before reaching into them.",
                    "Shake out camping gear and shoes before use."
                ]
            },
            "Ursus arctos horribilis": {
                "risk_rating": "Critical",
                "primary_hazard": "Territorial attack / Crushing force",
                "proactive_precautions": [
                    "Carry bear spray and know how to use it.",
                    "Do not run; stand your ground if the bear approaches.",
                    "Avoid entering dense thickets without making noise.",
                    "Secure all food items and scented waste."
                ]
            }
        }

        # Check for High Uncertainty (low confidence or unknown species)
        is_uncertain = verified_confidence < 0.50 or scientific_name == "Unknown" or "unknown" in c_name_lower

        if is_uncertain:
            if "snake" in c_name_lower or "serpentes" in c_name_lower or "reptile" in c_name_lower:
                return {
                    "risk_rating": "High",
                    "primary_hazard": "Possible venomous snakebite (Uncertain)",
                    "proactive_precautions": [
                        "Treat as venomous out of caution.",
                        "Keep a safe distance of at least 15 feet.",
                        "Do not throw rocks or provoke the creature."
                    ]
                }
            elif "spider" in c_name_lower or "arachnid" in c_name_lower or "insect" in c_name_lower or "bug" in c_name_lower:
                return {
                    "risk_rating": "Medium",
                    "primary_hazard": "Possible venomous bite/sting (Uncertain)",
                    "proactive_precautions": [
                        "Do not touch or attempt to handle the insect/arachnid.",
                        "Inspect clothing and gear closely before setting up camp."
                    ]
                }
            elif "bear" in c_name_lower:
                return {
                    "risk_rating": "High",
                    "primary_hazard": "Wild animal attack (Uncertain)",
                    "proactive_precautions": [
                        "Back away slowly without running.",
                        "Do not make direct eye contact or wave arms aggressively."
                    ]
                }
            else:
                return {
                    "risk_rating": "Medium",
                    "primary_hazard": "Unidentified animal defense (Uncertain)",
                    "proactive_precautions": [
                        "Maintain a safe distance.",
                        "Do not attempt to touch or feed the creature.",
                        "Move along your trail calmly."
                    ]
                }

        # If it is a known profile locally, return it immediately to save latency
        if scientific_name in profiles:
            return profiles[scientific_name]

        # Call Gemini for dynamic lookup of other/unknown creatures
        try:
            client = get_client()
            prompt = (
                f"Assess the hazard level and safety precautions for the creature: {common_name} ({scientific_name}).\n"
                "Determine if the threat rating is Critical, High, Medium, or Low, specify the primary hazard, and provide 2-4 proactive rules or precautions."
            )
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=RiskResult,
                    temperature=0.2,
                ),
            )
            import json
            return json.loads(response.text)

        except Exception as e:
            logger.error(f"Gemini API Risk assessment failed for {scientific_name}: {str(e)}. Using default fallback.")
            return {
                "risk_rating": "Medium",
                "primary_hazard": "General physical defense",
                "proactive_precautions": [
                    "Observe from a distance.",
                    "Do not feed, touch, or corner the animal."
                ]
            }
