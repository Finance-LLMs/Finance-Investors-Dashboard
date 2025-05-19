#!/usr/bin/env python
# Script to list all available voices with their IDs and gender information

import requests
import os
import sys
import json

# Import the API key directly
ELEVENLABS_API_KEY = "sk_d3e874d84ac48c6c11afca23654e43e3bd17c757bbf14b54"

def main():
    # Call the ElevenLabs API directly to get voice information
    url = "https://api.elevenlabs.io/v1/voices"
    headers = {"xi-api-key": ELEVENLABS_API_KEY}
    
    try:
        print("Fetching voices from ElevenLabs API...")
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        voices_data = response.json()
        voices = voices_data.get('voices', [])
        
        print(f"Found {len(voices)} voices\n")
        print("=== MALE VOICES ===")
        male_voices = []
        
        # First show all male voices
        for voice in voices:
            name = voice.get('name')
            voice_id = voice.get('voice_id')
            labels = voice.get('labels', {})
            description = voice.get('description', '')
            
            # Check if this is a male voice
            gender = labels.get('gender')
            if gender == 'male':
                male_voices.append(voice)
                print(f"Name: {name}")
                print(f"ID: {voice_id}")
                print(f"Description: {description}")
                print("---")
        
        print(f"\nTotal male voices: {len(male_voices)}")
        
        # Then show all other voices
        print("\n=== OTHER VOICES ===")
        for voice in voices:
            if voice not in male_voices:
                name = voice.get('name')
                voice_id = voice.get('voice_id')
                labels = voice.get('labels', {})
                gender = labels.get('gender', 'unknown')
                
                print(f"Name: {name}")
                print(f"ID: {voice_id}")
                print(f"Gender: {gender}")
                print("---")
                
    except Exception as e:
        print(f"Error: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
