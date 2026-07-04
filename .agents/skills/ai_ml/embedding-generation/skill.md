---

name: embedding-generation
description: Generates high-dimensional feature vector representations (embeddings) from input images or texts for downstream retrieval or comparison.

# responsibilities

* Process preprocessed images through deep feature extractor backbones.
* Extract visual embeddings (e.g., ResNet, ViT, or specialized bio-embeddings).
* Standardize/normalize embeddings (L2 normalization) for cosine similarity calculation.
* Support batch processing of multiple images when necessary.

## inputs

* Preprocessed image tensors.
* Target model specification or configuration.

## Outputs

* High-dimensional feature vector embeddings (L2 normalized).

## dependencies

* Image Preprocessing.
* Core deep learning libraries (PyTorch, TensorFlow, or ONNX Runtime).

## constraints

* Embedding dimensions must remain consistent across queries.
* Inference latency must be minimal (under 100ms).
* Must manage CPU/GPU memory footprint efficiently.

## success criteria

* Embeddings generated successfully for all validated input images.
* Generated vectors are normalized and valid for distance metrics.

---
