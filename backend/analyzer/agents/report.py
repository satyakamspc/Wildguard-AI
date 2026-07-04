class ReportAgent:
    """
    Standardizes all sub-agent responses into a single JSON schema.
    Converts threat ratings to frontend-compatible color classes:
    - 'Critical' / 'High' -> 'danger'
    - 'Medium' -> 'warning'
    - 'Low' -> 'success'
    - Default / Unknown -> 'info'
    """
    def compile_report(self, orchestrator_payload: dict) -> dict:
        verified_species = orchestrator_payload.get("verified_species", {})
        risk_data = orchestrator_payload.get("risk_data", {})
        first_aid_data = orchestrator_payload.get("first_aid_data", {})
        knowledge_data = orchestrator_payload.get("knowledge_data", {})
        verification_notes = orchestrator_payload.get("verification_notes", "")
        region_mismatch_warning = orchestrator_payload.get("region_mismatch_warning", False)
        quality_check = orchestrator_payload.get("image_quality_check", {"passes": True, "issue": None})
        reasoning = orchestrator_payload.get("reasoning", "")
        observable_features = orchestrator_payload.get("observable_features", [])
        diagnostic_features = orchestrator_payload.get("diagnostic_features", [])
        taxonomy = orchestrator_payload.get("taxonomy", {})

        # Map risk rating to card status colors
        risk_rating = risk_data.get("risk_rating", "Medium")
        color_mapping = {
            "Critical": "danger",
            "High": "danger",
            "Medium": "warning",
            "Low": "success"
        }
        card_risk_color = color_mapping.get(risk_rating, "info")

        # Compile JSON payload structure
        ui_ready_payload = {
            "card_species": {
                "common_name": verified_species.get("common_name", "Unknown"),
                "scientific_name": verified_species.get("scientific_name", "Unknown"),
                "confidence": verified_species.get("verified_confidence", 0.0),
                "image_quality_check": {
                    "passes": quality_check.get("passes", True),
                    "issue": quality_check.get("issue", None),
                },
                "quality_passes": quality_check.get("passes", True),
                "quality_issue": quality_check.get("issue", None),
                "verification_notes": verification_notes,
                "region_mismatch": region_mismatch_warning,
                # Redesigned AI/ML diagnostic fields forwarded to frontend safely
                "reasoning": reasoning,
                "observable_features": observable_features,
                "diagnostic_features": diagnostic_features,
                "animal_class": taxonomy.get("animal_class", "Unknown"),
                "order": taxonomy.get("order", "Unknown"),
                "family": taxonomy.get("family", "Unknown"),
                "genus": taxonomy.get("genus", "Unknown"),
                "species": taxonomy.get("species")
            },
            "card_risk": {
                "rating": risk_rating,
                "risk_rating": risk_rating,
                "color_code": card_risk_color,
                "primary_hazard": risk_data.get("primary_hazard", "Potential Hazard"),
                "precautions": risk_data.get("proactive_precautions", []),
                "proactive_precautions": risk_data.get("proactive_precautions", [])
            },
            "card_first_aid": {
                "disclaimer": first_aid_data.get("disclaimer", "Seek emergency medical advice."),
                "steps": first_aid_data.get("immediate_steps", []),
                "immediate_steps": first_aid_data.get("immediate_steps", []),
                "warnings": first_aid_data.get("critical_warnings", []),
                "critical_warnings": first_aid_data.get("critical_warnings", []),
                "paramedic_checklist": first_aid_data.get("paramedic_checklist", [])
            },
            "card_knowledge": {
                "habitat": knowledge_data.get("habitat", "N/A"),
                "activity_pattern": knowledge_data.get("activity_pattern", "N/A"),
                "general_behavior": knowledge_data.get("general_behavior", "N/A"),
                "fun_fact": knowledge_data.get("fun_fact", "N/A")
            }
        }

        return ui_ready_payload
