#!/usr/bin/env python
# Test ElevenLabs TTS directly

import os
import sys
import time
import requests
from pathlib import Path

# Add parent directory to path to handle imports correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.instance.config import ELEVENLABS_API_KEY

def direct_tts_test(text="This is a test of the ElevenLabs Text to Speech API.", voice_id="EXAVITQu4vr4xnSDxMaL"):
    """Test the ElevenLabs API directly"""
    print(f"Testing direct TTS with text length: {len(text)}")
    print(f"Voice ID: {voice_id}")
    print(f"API Key: {ELEVENLABS_API_KEY[:5]}...{ELEVENLABS_API_KEY[-5:]}")
    
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2"
    }
    
    print("Sending request to ElevenLabs API...")
    try:
        response = requests.post(url, headers=headers, json=payload)
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"Received {len(response.content)} bytes of audio")
            
            # Save to a file
            output_dir = Path.cwd() / "test_output"
            output_dir.mkdir(exist_ok=True)
            output_file = output_dir / f"test_tts_{int(time.time())}.mp3"
            
            with open(output_file, "wb") as f:
                f.write(response.content)
                
            print(f"Saved audio to: {output_file}")
            return True
        else:
            print(f"API Error: {response.text}")
            return False
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return False

if __name__ == "__main__":
    test_text = "Hello, this is a test of the ElevenLabs Text to Speech API. If you can hear this message, it means that the API is working correctly."
    
    if len(sys.argv) > 1:
        voice_id = sys.argv[1]
    else:
        # Default to Sarah voice
        voice_id = "EXAVITQu4vr4xnSDxMaL"
    
    direct_tts_test(test_text, voice_id)
