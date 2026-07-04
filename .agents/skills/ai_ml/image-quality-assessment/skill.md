---

name: image-quality-assessment
description: Assesses the quality of uploaded images to detect blur, poor lighting, obstructions, or lack of subjects.

# responsibilities

* Detect motion blur or out-of-focus images.
* Analyze lighting conditions (over-exposure or under-exposure/darkness).
* Determine if a relevant biological subject is present in the frame.
* Detect truncation or obstruction of key species features.

## inputs

* Raw or normalized input images.

## Outputs

* Quality check results (pass/fail status).
* Descriptive issue details (e.g., "Image is too blurry", "Too dark").

## dependencies

* Image Preprocessing.
* OpenCV or lightweight quality classification networks.

## constraints

* Perform quality assessment before expensive inference steps.
* Output descriptive issues so the frontend can guide the user.
* Process assessment under 40ms.

## success criteria

* Unusable images (highly blurred or pitch black) are rejected instantly.
* Informative warning flags are generated when images are of sub-optimal quality.

---
