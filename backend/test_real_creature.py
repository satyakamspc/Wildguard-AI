import os
import sys
import asyncio
import pprint

# Setup Python path to include the backend directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from analyzer.agents.orchestrator import OrchestratorAgent

async def run_test():
    print("--- Starting Real Creature Identification Test ---")
    orch = OrchestratorAgent()

    # Find a real image in uploads using absolute path
    base_dir = os.path.dirname(os.path.abspath(__file__))
    uploads_dir = os.path.join(base_dir, "media", "uploads")
    
    if not os.path.exists(uploads_dir):
        print(f"Uploads directory does not exist: {uploads_dir}")
        return

    images = [f for f in os.listdir(uploads_dir) if f.endswith(".jpg") and "Trimeresurus" in f]
    if not images:
        # Fallback to any jpg in uploads
        images = [f for f in os.listdir(uploads_dir) if f.endswith(".jpg")]
        if not images:
            print(f"No images found in uploads directory: {uploads_dir}")
            return

    image_path = os.path.join(uploads_dir, images[0])
    print(f"Testing with real image: {image_path}")

    # Run the orchestrator workflow
    print("\nTriggering parallel agent pipeline...")
    res = await orch.orchestrate_workflow(
        image_path=image_path,
        latitude=8.47,     # Takua Pa District coordinates (Thailand)
        longitude=98.35,
        user_description="Green snake seen on a tree branch."
    )

    print("\n--- Pipeline Result ---")
    pprint.pprint(res)

if __name__ == "__main__":
    asyncio.run(run_test())
