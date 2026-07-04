---

name: retrieval
description: Queries vector databases or knowledge bases using generated embeddings to find nearest neighbor reference profiles.

# responsibilities

* Convert input features into search queries.
* Query vector indexes using cosine similarity or Euclidean distance metrics.
* Retrieve candidate matches and associated metadata (first aid, hazards, taxonomy).
* Format matches into a structured list of candidates.

## inputs

* Query embeddings or search keywords.

## Outputs

* Ranked list of matching species documents and metadata.

## dependencies

* Embedding Generation.
* Vector index / database.

## constraints

* Queries must be completed within 100ms.
* Maintain up-to-date vector indexes.
* Limit retrieval size to the top K nearest neighbors.

## success criteria

* Correct reference profiles are retrieved for the top species candidates.
* Semantic search yields high recall for taxonomic queries.

---
