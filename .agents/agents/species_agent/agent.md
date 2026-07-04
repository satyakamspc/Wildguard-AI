---
name: species-agent
description: Visual classifier agent utilizing a lightweight MobileNet/VLM model or mock API to predict the animal species.

# responsibilities
* Preprocess incoming images (resize, normalize) before feeding them to the classification model.
* Run inference to predict species labels and probability scores.
* Return the top 3 candidate species.
* Detect and flag poor image quality (e.g., if exposure or blur makes classification unreliable).

## inputs
* image_file_path: string

## outputs
* detected_candidates: list of objects:
  * common_name: string
  * scientific_name: string
  * confidence: float (0.0 to 1.0)
* image_quality_check:
  * passes: boolean
  * issue: string | null ("blurry", "too_dark", etc.)

## constraints
* For the hackathon demo, if the model is unsure, it must return a fallback candidate representing the closest broad family (e.g., "Unknown Snake species" instead of a specific viper).
* Never suggest a high-confidence identification if the quality check fails.
---
