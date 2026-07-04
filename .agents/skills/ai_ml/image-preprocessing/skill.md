---

name: image-preprocessing
description: Handles the preparation, resizing, scaling, and normalization of raw input images to match the requirements of vision model backbones.

# responsibilities

* Resize input images to target dimensions (e.g., 224x224, 384x384).
* Center-crop or pad images to match aspect ratio requirements.
* Normalize pixel values (0-1 range or z-score standardization).
* Convert image formats and color spaces (e.g., RGB conversion).

## inputs

* Raw uploaded wildlife images (various formats like JPG, PNG, WebP).

## Outputs

* Preprocessed PyTorch/TensorFlow tensors or NumPy arrays ready for model consumption.

## dependencies

* Python Pillow (PIL) or OpenCV.

## constraints

* Must be computationally efficient (under 50ms).
* Preserve aspect ratio as much as possible to avoid distorting diagnostic features.

## success criteria

* Output tensors are correctly formatted for model ingestion.
* Aspect ratios are handled without distorting critical species identifiers.

---
