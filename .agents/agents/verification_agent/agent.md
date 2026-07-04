---
name: verification-agent
description: A rule-based verification agent that uses geographical range data and user description keywords to filter out false positive animal classifications.

# responsibilities
* Cross-reference visual candidates with a geographical distribution database.
* Check for keyword matches in user description (e.g., if user types "rattle", prioritize Crotalus species).
* Downgrade the confidence score of species that are non-native to the user's location (e.g., a Black Mamba in North America).
* Output the verified primary species.

## inputs
* detected_candidates: list (from species_agent)
* latitude: float (optional)
* longitude: float (optional)
* user_description: string (optional)

## outputs
* verified_species:
  * common_name: string
  * scientific_name: string
  * verified_confidence: float
* verification_notes: string (e.g., "Location matched native habitat", "Mismatched region - confidence adjusted")

## constraints
* If geographic data is unavailable, do not adjust the visual confidence score.
* If the visual model predicts a dangerous species (venomous/aggressive) but geographic location mismatches, raise a "region_mismatch_warning" flag but preserve the threat alert out of caution.
---
