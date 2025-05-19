import requests
import sys
import os

# Add parent directory to path to handle imports correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.instance.config import ELEVENLABS_API_KEY

print(f"API Key: {ELEVENLABS_API_KEY[:5]}...{ELEVENLABS_API_KEY[-5:]}")

# Test the API key by trying to list voices
url = "https://api.elevenlabs.io/v1/voices"
headers = {"xi-api-key": ELEVENLABS_API_KEY}

try:
    print("Sending request to ElevenLabs API...")
    response = requests.get(url, headers=headers)
    print(f"Response status: {response.status_code}")
    
    if response.status_code == 200:
        voices = response.json().get('voices', [])
        print(f"Success! Found {len(voices)} voices:")
        for voice in voices[:3]:  # Show first 3 voices
            print(f" - {voice.get('name')} (ID: {voice.get('voice_id')})")
    else:
        print(f"API Error: {response.text}")
except Exception as e:
    print(f"Error: {str(e)}")
