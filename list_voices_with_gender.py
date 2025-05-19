#!/usr/bin/env python
# Simple script to list all available voices with their details

import sys
import os
import requests
import json

# Add the directory containing app to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the API key
try:
    from app.instance.config import ELEVENLABS_API_KEY
except ImportError:
    print("Error: Could not import API key. Make sure the config file exists.")
    sys.exit(1)

def list_voices():
    """
    Fetch all available ElevenLabs voices.
    Returns a dict containing 'voices' list with voice details.
    """
    url = "https://api.elevenlabs.io/v1/voices"
    headers = {"xi-api-key": ELEVENLABS_API_KEY}
    try:
        resp = requests.get(url, headers=headers)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"Error fetching voices: {str(e)}")
        return {"voices": []}

def main():
    voices = list_voices()
    print('Available voices:')
    for voice in voices.get('voices', []):
        voice_id = voice.get('voice_id')
        name = voice.get('name')
        labels = voice.get('labels', {})
        gender = labels.get('gender', 'unknown')
        accent = labels.get('accent', 'unknown')
        description = voice.get('description', '')
        category = voice.get('category', '')
        print(f'- {name} (ID: {voice_id})')
        print(f'  Category: {category}')
        print(f'  Gender: {gender}')
        print(f'  Accent: {accent}')
        if description:
            print(f'  Description: {description}')
        print('')

if __name__ == "__main__":
    main()
