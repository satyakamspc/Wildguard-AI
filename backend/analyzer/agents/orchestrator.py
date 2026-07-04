import time
import asyncio
import logging
from .species import SpeciesAgent, QuotaExhaustedException
from .verification import VerificationAgent
from .risk import RiskAgent
from .knowledge import KnowledgeAgent
from .first_aid import FirstAidAgent
from .report import ReportAgent

logger = logging.getLogger(__name__)

class OrchestratorAgent:
    """
    Central Coordinator Agent.
    - Receives incoming image upload paths, geolocations, and description prompts.
    - Sequentially executes species detection.
    - Enforces confidence routing thresholds policy:
      - >= 0.90 -> Accept directly (skip location checks to prevent verification false positives)
      - 0.70 - 0.89 -> Run geographic range verification
      - < 0.70 / Uncertain / Quality fail -> Safety fallback (Unidentified Animal)
    - Executes risk, knowledge, and first-aid tasks in parallel to meet the 3.5s latency budget.
    - Formats payload using ReportAgent.
    """
    def __init__(self):
        self.species_agent = SpeciesAgent()
        self.verification_agent = VerificationAgent()
        self.risk_agent = RiskAgent()
        self.knowledge_agent = KnowledgeAgent()
        self.first_aid_agent = FirstAidAgent()
        self.report_agent = ReportAgent()

    async def orchestrate_workflow(self, image_path: str, latitude: float = None, longitude: float = None, user_description: str = "") -> dict:
        start_time = time.perf_counter()

        # 1. Species visual identification (sequential)
        try:
            species_res = self.species_agent.detect_species(image_path, user_description)
            candidates = species_res.get("detected_candidates", [])
            quality_check = species_res.get("image_quality_check", {"passes": True, "issue": None})
            uncertain = species_res.get("uncertain", False)
            reasoning = species_res.get("reasoning", "")
            observable_features = species_res.get("observable_features", [])
            diagnostic_features = species_res.get("diagnostic_features", [])
            taxonomy = species_res.get("taxonomy", {
                "animal_class": "Unknown",
                "order": "Unknown",
                "family": "Unknown",
                "genus": "Unknown",
                "species": None
            })
        except QuotaExhaustedException as qe:
            logger.error(f"Pipeline halted (quota exhausted): {str(qe)}")
            return {
                "status": "quota_exhausted",
                "latency_ms": 0,
                "message": str(qe),
                "ui_ready_payload": {}
            }
        except Exception as e:
            logger.error(f"Visual identification failed: {str(e)}")
            candidates = []
            quality_check = {"passes": False, "issue": "detection_failure"}
            uncertain = True
            reasoning = "Visual identification process encountered an error."
            observable_features = []
            diagnostic_features = []
            taxonomy = {
                "animal_class": "Unknown",
                "order": "Unknown",
                "family": "Unknown",
                "genus": "Unknown",
                "species": None
            }

        # Extract top candidate details
        top_cand = candidates[0] if candidates else None
        visual_conf = top_cand.get("confidence", 0.0) if top_cand else 0.0

        # 2. Enforce confidence routing policy
        if not quality_check.get("passes", True) or uncertain or not top_cand:
            # Low confidence/Quality check fail / Uncertain: Reject immediately and return generic fallback
            verified_species = {
                "common_name": "Unidentified Animal",
                "scientific_name": "Unknown",
                "verified_confidence": 0.0
            }
            verification_notes = "Identification confidence is too low or uncertain. Caution advised."
            region_mismatch_warning = False
        elif visual_conf >= 0.90:
            # High confidence: Accept directly (skip location checks to prevent verification false positives)
            verified_species = {
                "common_name": top_cand["common_name"],
                "scientific_name": top_cand["scientific_name"],
                "verified_confidence": visual_conf
            }
            verification_notes = "High-confidence visual match accepted directly."
            region_mismatch_warning = False
        elif visual_conf >= 0.70:
            # Moderate confidence: Run location verification check
            try:
                verif_res = self.verification_agent.verify_geographic_fit(
                    candidates, latitude, longitude, user_description
                )
                verified_species = verif_res.get("verified_species", {"common_name": "Unknown", "scientific_name": "Unknown", "verified_confidence": 0.0})
                verification_notes = verif_res.get("verification_notes", "")
                region_mismatch_warning = verif_res.get("region_mismatch_warning", False)
            except Exception as e:
                logger.error(f"Geographic verification failed: {str(e)}")
                verified_species = {"common_name": "Unknown", "scientific_name": "Unknown", "verified_confidence": 0.0}
                verification_notes = "Verification service failed."
                region_mismatch_warning = False
        else:
            # Low confidence (< 0.70): Return fallback
            verified_species = {
                "common_name": "Unidentified Animal",
                "scientific_name": "Unknown",
                "verified_confidence": 0.0
            }
            verification_notes = "Low identification confidence. Caution advised."
            region_mismatch_warning = False

        # 3. Parallel Lookups
        async def run_risk():
            try:
                await asyncio.sleep(0.01)  # cooperate with async loop
                return self.risk_agent.assess_danger(verified_species, verified_species["verified_confidence"])
            except Exception as e:
                logger.error(f"Risk assessment task failed: {str(e)}")
                return {
                    "risk_rating": "High",
                    "primary_hazard": "Potential physical defenses",
                    "proactive_precautions": ["Keep a safe distance.", "Avoid provoking the creature."]
                }

        async def run_knowledge():
            try:
                await asyncio.sleep(0.01)
                return self.knowledge_agent.get_profile(verified_species)
            except Exception as e:
                logger.error(f"Knowledge profile task failed: {str(e)}")
                return {
                    "habitat": "Information currently unavailable.",
                    "activity_pattern": "Diurnal",
                    "general_behavior": "Observe from a distance.",
                    "fun_fact": "No facts available for this entry."
                }

        async def run_first_aid():
            try:
                await asyncio.sleep(0.01)
                return self.first_aid_agent.get_first_aid(verified_species)
            except Exception as e:
                logger.error(f"First-aid retrieval task failed: {str(e)}")
                return {
                    "disclaimer": "Emergency first-aid database connection timed out. Call emergency services immediately.",
                    "immediate_steps": [
                        "CALL EMERGENCY SERVICES (e.g., 911/112) IMMEDIATELY.",
                        "Wash the wound and stay warm and still."
                    ],
                    "critical_warnings": [
                        "DO NOT panic. Keep the victim calm."
                    ],
                    "paramedic_checklist": [
                        "Record the exact time of the injury."
                    ]
                }

        # Run lookups in parallel
        risk_res, knowledge_res, first_aid_res = await asyncio.gather(
            run_risk(),
            run_knowledge(),
            run_first_aid()
        )

        consolidated = {
            "verified_species": verified_species,
            "verification_notes": verification_notes,
            "region_mismatch_warning": region_mismatch_warning,
            "image_quality_check": quality_check,
            "reasoning": reasoning,
            "observable_features": observable_features,
            "diagnostic_features": diagnostic_features,
            "taxonomy": taxonomy,
            "risk_data": risk_res,
            "knowledge_data": knowledge_res,
            "first_aid_data": first_aid_res
        }

        # 4. Standardized JSON Output Compilation
        try:
            ui_ready_payload = self.report_agent.compile_report(consolidated)
            status = "success"
        except Exception as e:
            logger.error(f"Report compilation failed: {str(e)}")
            ui_ready_payload = {}
            status = "error"

        end_time = time.perf_counter()
        latency_ms = int((end_time - start_time) * 1000)

        return {
            "status": status,
            "latency_ms": latency_ms,
            "ui_ready_payload": ui_ready_payload
        }
