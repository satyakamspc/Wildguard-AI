---

name: model-manager
description: Controls model loading, versioning, serialization formats (e.g., ONNX, PyTorch), caching, and memory management.

# responsibilities

* Fetch and cache model weights from remote repositories (or local storage).
* Track model versioning and configuration mappings.
* Load models onto the appropriate hardware device (CPU, CUDA, MPS).
* Handle dynamic model swapping/unloading to conserve system memory.

## inputs

* Model configurations and specifications.
* Paths to weight checkpoints or serialized files.

## Outputs

* Initialized model instances ready for execution.

## dependencies

* Safe file systems and cloud/local model caches.

## constraints

* Avoid redundant reloading of model weights on every request.
* Verify model checksums/signatures before loading to ensure integrity.
* Restrict model size to fit within system memory constraints.

## success criteria

* Models are cached and loaded into device memory efficiently.
* Device resources are properly allocated and garbage-collected.

---
