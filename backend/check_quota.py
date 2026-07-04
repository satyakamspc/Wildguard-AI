import os
import sys

# Setup Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from analyzer.agents.client import get_client

def check_gemini_quota():
    print("--- Checking Gemini API Quota Status ---")
    try:
        client = get_client()
        # Make a tiny request to verify API availability
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents="Say 'Quota available.'"
        )
        print("\nSuccess! Your Gemini API quota is AVAILABLE.")
        print(f"Response: {response.text.strip()}")
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            print("\nResult: Your free quota is currently FINISHED (Rate limited / Quota Exceeded).")
            print("Details: Gemini API returned a 429 Resource Exhausted error.")
        else:
            print(f"\nResult: API Call failed with another error.")
            print(f"Error details: {error_msg}")

if __name__ == "__main__":
    check_gemini_quota()
