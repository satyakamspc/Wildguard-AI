import os
import json
import logging

logger = logging.getLogger(__name__)

class VerificationAgent:
    """
    Geographical verification agent.
    - Matches candidate species against geographic ranges (latitude/longitude) defined in geographic_db.json.
    - Acts strictly as a validator/filter: if coordinates mismatch, applies a penalty (-0.30).
    - NEVER boosts confidence (no +0.05 boost) to prevent artificial visual score inflation.
    """
    def __init__(self, geo_db_path: str = None):
        if geo_db_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            geo_db_path = os.path.join(base_dir, "mock_data", "geographic_db.json")
        
        self.geo_db_path = geo_db_path
        self.geo_db = {}
        try:
            with open(self.geo_db_path, "r") as f:
                self.geo_db = json.load(f)
        except Exception as e:
            logger.error(f"Failed to load geographic database from {self.geo_db_path}: {str(e)}")

    def verify_geographic_fit(self, detected_candidates: list, latitude: float = None, longitude: float = None, user_description: str = "") -> dict:
        if not detected_candidates:
            return {
                "verified_species": {"common_name": "Unknown", "scientific_name": "Unknown", "verified_confidence": 0.0},
                "verification_notes": "No candidates detected.",
                "region_mismatch_warning": False
            }

        desc_lower = user_description.lower() if user_description else ""
        best_candidate = detected_candidates[0]

        # 1. Text description keyword alignment
        for cand in detected_candidates:
            sc_name = cand["scientific_name"]
            c_name = cand["common_name"].lower()
            if (
                ("rattle" in desc_lower and "rattlesnake" in c_name) or
                ("widow" in desc_lower and "widow" in c_name) or
                ("grizzly" in desc_lower and "grizzly" in c_name) or
                ("honey" in desc_lower and "honey" in c_name) or
                ("viper" in desc_lower and "viper" in c_name)
            ):
                # We align the candidate, but we do NOT increase confidence score
                best_candidate = cand
                break

        scientific_name = best_candidate["scientific_name"]
        common_name = best_candidate["common_name"]
        original_confidence = best_candidate["confidence"]

        verified_confidence = original_confidence
        notes = "Visual model confidence preserved; location verification skipped (no coordinates)."
        region_mismatch_warning = False

        # 2. Geo coordinate range checking
        if latitude is not None and longitude is not None:
            if scientific_name in self.geo_db:
                geo_data = self.geo_db[scientific_name]
                lat_range = geo_data.get("latitude_range")
                lng_range = geo_data.get("longitude_range")

                if lat_range and lng_range:
                    in_latitude = lat_range[0] <= latitude <= lat_range[1]
                    in_longitude = lng_range[0] <= longitude <= lng_range[1]

                    if in_latitude and in_longitude:
                        # Validate range matches, but do NOT boost the score
                        notes = f"Location verified: {common_name} is native to these coordinates."
                    else:
                        # Apply penalty for mismatch (filter policy)
                        verified_confidence = max(original_confidence - 0.30, 0.10)
                        notes = f"Location mismatch: {common_name} is not native to these coordinates."
                        
                        # Set warning flag for dangerous species mismatch
                        dangerous_species = ["Crotalus oreganus", "Latrodectus mactans", "Ursus arctos horribilis"]
                        if scientific_name in dangerous_species:
                            region_mismatch_warning = True
                            notes += " Warning: Threat alerts preserved out of caution."
                else:
                    notes = "Geographic range rules incomplete for this species; visual confidence preserved."
            else:
                notes = "Species not present in geographical database; visual confidence preserved."

        return {
            "verified_species": {
                "common_name": common_name,
                "scientific_name": scientific_name,
                "verified_confidence": round(verified_confidence, 2)
            },
            "verification_notes": notes,
            "region_mismatch_warning": region_mismatch_warning
        }
