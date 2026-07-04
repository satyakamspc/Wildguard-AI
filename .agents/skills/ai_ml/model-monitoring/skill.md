---

name: model-monitoring
description: Tracks and logs runtime performance metrics, resource utilization, drift indicators, and prediction distributions.

# responsibilities

* Log model latency per prediction stage.
* Record prediction distribution statistics to detect concept/data drift.
* Monitor system resources (CPU/GPU/memory usage) during inference.
* Collect user feedback/corrections to build fine-tuning datasets.

## inputs

* Inference latency, prediction outputs, and hardware logs.
* User corrections and feedback metrics.

## Outputs

* Telemetry logs, drift alerts, and accuracy reports.

## dependencies

* Logging system.
* Database.

## constraints

* Performance tracking must not introduce overhead to the main request flow.
* Respect user privacy when tracking custom images.
* Do not block requests during metrics collection.

## success criteria

* Accurately logs telemetry for model performance.
* Performance degradation or resource anomalies are flagged immediately.

---
