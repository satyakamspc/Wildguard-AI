---

name: confidence-estimation
description: Evaluates and computes calibration scores, certainty metrics, and output confidence values for species classification candidates.

# responsibilities

* Calculate confidence scores for candidate species classifications.
* Adjust raw model probabilities using calibration models (e.g., Platt scaling, temperature scaling).
* Flag low-confidence predictions (e.g., confidence < 0.35) to trigger fallback safety modes.
* Incorporate contextual evidence (geographic range overlap, description matches) to adjust confidence.

## inputs

* Raw logit outputs or class probabilities from species classification models.
* Contextual validation flags (e.g., from range checks and descriptions).

## Outputs

* Calibrated confidence scores (0.0 to 1.0) for species candidates.
* Confidence certainty flag (e.g., High, Medium, Low certainty).

## dependencies

* AI/ML Inference Pipeline.
* Verification Agent.

## constraints

* Ensure scores are mathematically calibrated (probability matches true accuracy).
* Do not inflate low-confidence predictions artificially.
* Performance must be ultra-fast (under 20ms).

## success criteria

* Low-confidence classifications are successfully flagged.
* Under-represented species have calibrated confidence representing true likelihood.

---
