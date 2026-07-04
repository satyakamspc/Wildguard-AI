---

name: species-identification
description: Classifies animal subjects to identify taxonomic hierarchies (family, genus, species) based on visual features.

# responsibilities

* Extract fine-grained visual features of species.
* Output probability distribution over all target wildlife classes.
* Map predictions to taxonomic records.
* Support fine-grained classification for lookalike species.

## inputs

* Preprocessed image tensors (optionally cropped by object detection).

## Outputs

* Probabilities for species candidates and their taxonomic hierarchies.

## dependencies

* Inference Pipeline.
* Bounding boxes or cropped images.

## constraints

* Must support fine-grained distinction between highly similar lookalike species (e.g., venomous vs. non-venomous snakes).
* Ensure low classification error rates on critical indicator species.
* Process prediction in under 300ms.

## success criteria

* Provides correct species candidates.
* Resolves candidate taxonomy structure (class, order, family, genus, species).

---
