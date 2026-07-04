import os
import sys
import asyncio
import pprint
from PIL import Image

# Setup Python path to include the backend directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from analyzer.agents.orchestrator import OrchestratorAgent

async def run_test():
    print("--- Starting AI/ML Inference Pipeline Test ---")
    orch = OrchestratorAgent()

    # Verify a test image exists
    image_path = "media/uploads/test_creature.jpg"
    if not os.path.exists(image_path):
        os.makedirs(os.path.dirname(image_path), exist_ok=True)
        # Create a basic 100x100 solid color image for testing
        img = Image.new('RGB', (224, 224), color='orange')
        img.save(image_path)
        print(f"Created a mock orange test image at: {image_path}")

    # Run the orchestrator workflow
    print("\nTriggering parallel agent pipeline...")
    res = await orch.orchestrate_workflow(
        image_path=image_path,
        latitude=37.7749,
        longitude=-122.4194,
        user_description="I found a honey bee on a flower."
    )

    print("\n--- Pipeline Result ---")
    pprint.pprint(res)

if __name__ == "__main__":
    asyncio.run(run_test())
