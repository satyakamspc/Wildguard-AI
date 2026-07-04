---
name: frontend

description: The Frontend provides the user interface for the Wildlife AI Agent application. It enables users to upload wildlife images, interact with the system, monitor analysis progress, and view the final AI-generated report in a clear and user-friendly format.

# Purpose
Provide an intuitive and responsive interface for users to interact with the Wildlife AI Agent system.

## Goals
* Allow users to upload wildlife images.
* Display analysis progress in real time.
* Present the final report in a clean and understandable format.
* Ensure a smooth user experience across desktop and mobile devices.

### Responsibilities

* Accept image uploads (drag-and-drop or file picker).
* Validate supported image formats and file sizes.
* Send images securely to the backend.
* Display loading indicators while analysis is in progress.
* Receive and render the final analysis report.
* Present:
    * Species Identification
    * Confidence Score
    * Risk Level
    * Habitat Information
    * First Aid Instructions
    * Prevention Tips
* Handle API errors gracefully.
* Maintain responsive and accessible UI components.

## Inputs

* Wildlife image uploaded by the user.
* Responses received from backend APIs.

## Outputs

* Interactive user interface.
* Structured wildlife analysis report.
* Error and status notifications.

# Technologies

* React
* Vite
* HTML
* CSS
* JavaScript
* Axios (API communication)

## Constraints

* Never perform AI inference locally.
* Never expose API keys or secrets.
* Do not modify backend responses.
* Display uncertainty exactly as returned by the backend.

## Success Criteria

* Image upload completes successfully.
* Backend responses are rendered correctly.
* Loading and error states are handled properly.
* Interface remains responsive and user-friendly.

---