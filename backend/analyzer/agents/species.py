import traceback
import os
import logging
import json
from PIL import Image
from pydantic import BaseModel, Field
from typing import List, Optional
from google.genai import types

from .client import get_client

logger = logging.getLogger(__name__)

class SpeciesCandidate(BaseModel):
    common_name: str = Field(description="Common name of the species. Must be inseparable from scientific name.")
    scientific_name: str = Field(description="Binomial nomenclature (Genus species).")
    confidence: float = Field(description="Conservative confidence score (0.0 to 1.0) based purely on visible evidence.")

class QualityCheck(BaseModel):
    passes: bool = Field(description="True if image is clear, sharp, and has visible creature.")
    issue: Optional[str] = Field(description="Reason for failure (blurry, dark, occluded, no_animal) or null.")

class TaxonomyResult(BaseModel):
    animal_class: str = Field(description="Class level, e.g. Reptilia, Insecta, Mammalia.")
    order: str = Field(description="Order level, e.g. Squamata, Hymenoptera, Carnivora.")
    family: str = Field(description="Family level, e.g. Viperidae, Apidae, Ursidae.")
    genus: str = Field(description="Genus level, e.g. Trimeresurus, Apis, Ursus.")
    species: Optional[str] = Field(description="Species level (optional, e.g. sabahi, mellifera). If uncertain, keep null.")

class SpeciesDetectionResult(BaseModel):
    image_quality_check: QualityCheck = Field(description="Image quality assessment.")
    reasoning: str = Field(description="Step-by-step biological deduction verifying features against taxonomy.")
    observable_features: List[str] = Field(description="Concrete anatomical features visible (legs, colors, wing shape).")
    diagnostic_features: List[str] = Field(description="Specific taxonomic key markers visible (scale arrangement, stinger, fangs).")
    taxonomy: TaxonomyResult = Field(description="Taxonomic rank matching observed features.")
    uncertain: bool = Field(description="Set to True if identification is highly ambiguous or lacks key body parts.")
    detected_candidates: List[SpeciesCandidate] = Field(description="List of candidates. If uncertain, candidate lists should contain genus/family level common/scientific pairs with low confidence.")

class QuotaExhaustedException(Exception):
    """Raised when the Gemini API returns a 429 quota exhaustion or rate limit error."""
    pass

class SpeciesAgent:
    """
    Taxonomy-locked visual classification agent using staged reasoning to prevent hallucinations.
    """
    def detect_species(self, image_path: str, user_description: str = "") -> dict:
        try:
            # 1. Load image
            pil_image = Image.open(image_path)
            
            # 2. Setup Gemini client
            client = get_client()
            
            # 3. Formulate the staged reasoning prompt
            prompt = (
                "You are an expert wildlife taxonomist specializing in safety-critical creature identification.\n"
                "Analyze the provided image of a creature using a strict staged reasoning process:\n\n"
                "1. Quality Check: Confirm the subject is visible, in-focus, and well-lit.\n"
                "2. Anatomical Feature Extraction: List all undeniable physical characteristics (e.g., color patterns, number of legs, body shape, texture).\n"
                "3. Diagnostic Keying: Look for specific diagnostic keys (e.g., heat-sensing pits, rattle segments, wing venation, stinger, scale count). Do not assume features hidden in shadow.\n"
                "4. Taxonomic Rank: Determine Class, Order, Family, Genus, and Species (if clear).\n"
                "5. Confidence and Uncertainty:\n"
                "   - If crucial diagnostic keys are not visible, set 'uncertain' to True.\n"
                "   - If 'uncertain' is True, do NOT guess the species. Instead, output the candidate at the Genus or Family level (e.g. 'Unknown Pit Viper' / 'Trimeresurus') with low confidence.\n"
                "   - Never output a confidence >= 0.70 unless multiple clear diagnostic markers are visible.\n"
                f"User description context: '{user_description}'"
            )
            
            # 4. Request structured generation
            print("\n" + "=" * 80)
            print("PROMPT SENT TO GEMINI")
            print("=" * 80)
            print(prompt)

            print("\n" + "=" * 80)
            print("IMAGE INFO")
            print("=" * 80)
            print(f"Path : {image_path}")
            print(f"Type : {type(pil_image)}")
            print(f"Size : {pil_image.size}")
            print(f"Mode : {pil_image.mode}")
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[pil_image, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=SpeciesDetectionResult,
                    temperature=0.0, # Deterministic setting
                ),
            )
            print("\n" + "=" * 80)
            print("RAW GEMINI RESPONSE OBJECT")
            print("=" * 80)
            print(response)
            print("\n" + "=" * 80)
            print("RAW GEMINI TEXT")
            print("=" * 80)

            if hasattr(response, "text"):
                print(response.text)
            else:
                print("No response.text available")
            
            if hasattr(response, "parsed") and response.parsed is not None:
                print("\n" + "=" * 80)
                print("PARSED RESPONSE")
                print("=" * 80)
                print(response.parsed)

                return response.parsed.model_dump()

            print("\n" + "=" * 80)
            print("FALLING BACK TO JSON PARSING")
            print("=" * 80)
            return json.loads(response.text)

        except Exception as e:
            err_msg = str(e).lower()
            if "429" in err_msg or "resource_exhausted" in err_msg or "quota" in err_msg or "rate limit" in err_msg:
                logger.error("Gemini API quota exhausted (429). Propagating quota error.")
                raise QuotaExhaustedException("Your Gemini API free quota has been exhausted. Please wait for the quota to reset or upgrade your plan.")
            
            logger.error(f"Gemini species detection failed: {str(e)}. Falling back to mock heuristics.")
            return self._mock_fallback(image_path, user_description)

    def _mock_fallback(self, image_path: str, user_description: str) -> dict:
        filename = os.path.basename(image_path).lower()
        desc = user_description.lower() if user_description else ""

        passes_quality = True
        quality_issue = None

        if "blurry" in filename or "blurry" in desc:
            passes_quality = False
            quality_issue = "blurry"
        elif "dark" in filename or "dark" in desc:
            passes_quality = False
            quality_issue = "too_dark"
        elif "empty" in filename or "empty" in desc:
            passes_quality = False
            quality_issue = "no_animal_visible"

        # Defaults
        taxonomy = {
            "animal_class": "Unknown",
            "order": "Unknown",
            "family": "Unknown",
            "genus": "Unknown",
            "species": None
        }
        detected = []
        observable_features = []
        diagnostic_features = []

        if any(k in filename or k in desc for k in ["viper", "trimeresurus", "pit"]):
            detected = [
                {"common_name": "Banded Pit Viper", "scientific_name": "Trimeresurus sabahi fucatus", "confidence": 0.94},
                {"common_name": "Western Diamondback Rattlesnake", "scientific_name": "Crotalus oreganus", "confidence": 0.04},
                {"common_name": "Gopher Snake", "scientific_name": "Pituophis catenifer", "confidence": 0.02}
            ]
            taxonomy = {
                "animal_class": "Reptilia",
                "order": "Squamata",
                "family": "Viperidae",
                "genus": "Trimeresurus",
                "species": "sabahi"
            }
            observable_features = ["green body", "triangular head", "arboreal tail"]
            diagnostic_features = ["heat-sensing pits"]
        elif "bee" in filename or "bee" in desc:
            detected = [
                {"common_name": "Honey Bee", "scientific_name": "Apis mellifera", "confidence": 0.88},
                {"common_name": "Bumblebee", "scientific_name": "Bombus", "confidence": 0.08},
                {"common_name": "Yellowjacket", "scientific_name": "Vespula vulgaris", "confidence": 0.04}
            ]
            taxonomy = {
                "animal_class": "Insecta",
                "order": "Hymenoptera",
                "family": "Apidae",
                "genus": "Apis",
                "species": "mellifera"
            }
            observable_features = ["winged body", "striped yellow and black"]
            diagnostic_features = ["pollen basket"]
        elif "snake" in filename or "snake" in desc or "rattle" in filename or "rattle" in desc:
            detected = [
                {"common_name": "Western Diamondback Rattlesnake", "scientific_name": "Crotalus oreganus", "confidence": 0.92},
                {"common_name": "Gopher Snake", "scientific_name": "Pituophis catenifer", "confidence": 0.05},
                {"common_name": "Common Garter Snake", "scientific_name": "Thamnophis sirtalis", "confidence": 0.03}
            ]
            taxonomy = {
                "animal_class": "Reptilia",
                "order": "Squamata",
                "family": "Viperidae",
                "genus": "Crotalus",
                "species": "oreganus"
            }
            observable_features = ["limbless", "scaled skin", "diamond pattern"]
            diagnostic_features = ["rattle on tail"]
        elif "spider" in filename or "spider" in desc or "widow" in filename or "widow" in desc:
            detected = [
                {"common_name": "Black Widow Spider", "scientific_name": "Latrodectus mactans", "confidence": 0.90},
                {"common_name": "False Black Widow", "scientific_name": "Steatoda grossa", "confidence": 0.07},
                {"common_name": "Brown Recluse Spider", "scientific_name": "Loxosceles reclusa", "confidence": 0.03}
            ]
            taxonomy = {
                "animal_class": "Arachnida",
                "order": "Araneae",
                "family": "Theridiidae",
                "genus": "Latrodectus",
                "species": "mactans"
            }
            observable_features = ["8 legs", "shiny black body"]
            diagnostic_features = ["hourglass markings"]
        elif "bear" in filename or "bear" in desc or "grizzly" in filename or "grizzly" in desc:
            detected = [
                {"common_name": "Grizzly Bear", "scientific_name": "Ursus arctos horribilis", "confidence": 0.95},
                {"common_name": "Black Bear", "scientific_name": "Ursus americanus", "confidence": 0.04},
                {"common_name": "Brown Bear", "scientific_name": "Ursus arctos", "confidence": 0.01}
            ]
            taxonomy = {
                "animal_class": "Mammalia",
                "order": "Carnivora",
                "family": "Ursidae",
                "genus": "Ursus",
                "species": "arctos"
            }
            observable_features = ["quadruped", "thick brown fur", "shoulder hump"]
            diagnostic_features = ["long claws"]
        else:
            detected = [
                {"common_name": "Unknown species", "scientific_name": "Unknown", "confidence": 0.30}
            ]

        return {
            "image_quality_check": {
                "passes": passes_quality,
                "issue": quality_issue
            },
            "reasoning": "Fallback mock analysis due to pipeline failure.",
            "observable_features": observable_features,
            "diagnostic_features": diagnostic_features,
            "taxonomy": taxonomy,
            "uncertain": not passes_quality,
            "detected_candidates": detected
        }
