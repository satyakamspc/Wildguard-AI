---

name: object-detection
description: Detects the bounding coordinates and presence of animal subjects inside uploaded images.

# responsibilities

* Localize animal subjects using object detection backbones (e.g., YOLO, Faster R-CNN).
* Extract bounding boxes of interest to crop the subject.
* Filter out irrelevant background regions before classification.
* Handle multi-instance detection of multiple subjects in a single frame.

## inputs

* Preprocessed image tensors.

## Outputs

* Bounding boxes (coordinates: xmin, ymin, xmax, ymax).
* Class labels (e.g., "animal") and detection confidence.

## dependencies

* Image Preprocessing.
* Inference Pipeline.

## constraints

* Object detection model must be lightweight to keep latency low.
* Support multiple animal detection in a single frame.
* Bounding box output must use normalized coordinates.

## success criteria

* Successfully outputs bounding boxes around animal subjects.
* Background noise is reduced by feeding cropped subjects to the species identifier.

---
