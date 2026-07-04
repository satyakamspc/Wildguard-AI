---

name: inference-pipeline
description: Manages the end-to-end execution of deep learning models for classification, detection, and segmentation.

# responsibilities

* Load models into active memory/GPU/NPU.
* Run model feed-forward passes on preprocessed tensors.
* Batch input requests where appropriate.
* Route requests to specific models based on target task.
* Handle CPU/GPU device context switching.

## inputs

* Preprocessed image tensors.
* Target model configuration parameters.

## Outputs

* Raw model logits, bounding box coordinates, or class probability maps.

## dependencies

* Model Manager.
* Hardware acceleration runtimes (e.g., PyTorch, ONNX Runtime).

## constraints

* Maintain low latency execution (under 500ms for forward pass).
* Safely release memory allocations and prevent GPU/RAM memory leaks.
* Handle out-of-memory errors gracefully without crashing the backend.

## success criteria

* Executes model feed-forward pass without errors.
* Correctly coordinates the flow from raw image input to raw logits output.

---
