# app/tts_elevenlabs.py

import requests
import os
import sys

# Add parent directory to path to handle imports correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from instance.config import ELEVENLABS_API_KEY

def list_voices() -> dict:
    """
    Fetch all available ElevenLabs voices.
    Returns a dict containing 'voices' list with 'voice_id' and 'name'.
    """
    url = "https://api.elevenlabs.io/v1/voices"
    headers = {"xi-api-key": ELEVENLABS_API_KEY}
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    return resp.json()

def text_to_speech(
    text: str,
    voice_id: str,
    model_id: str = "eleven_multilingual_v2",
    output_format: str = "mp3_44100_128"
) -> bytes:
    """
    Convert `text` into speech using ElevenLabs TTS Convert endpoint.
    Returns raw audio bytes (MP3) on success, or empty bytes on failure.
    """
    print(f"TTS: Starting conversion for text of length {len(text)}")
    print(f"TTS: Using voice_id: {voice_id}")
    print(f"TTS: API Key exists: {bool(ELEVENLABS_API_KEY)}")
    
    # Check if the text is too long, ElevenLabs has a limit
    if len(text) > 5000:
        print("TTS: Warning - Text is over 5000 characters, truncating...")
        text = text[:4990] + "..."
    
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    params = {"output_format": output_format}
    payload = {
        "text": text,
        "model_id": model_id
    }

    print("TTS: Sending request to ElevenLabs API...")
    
    try:
        resp = requests.post(url, headers=headers, params=params, json=payload)
        print(f"TTS: Response status code: {resp.status_code}")
        
        if resp.status_code == 200:
            print(f"TTS: Success - Received {len(resp.content)} bytes")
            return resp.content
        else:
            print(f"[ERROR] ElevenLabs TTS failed ({resp.status_code}): {resp.text}")
            return b""
            
    except Exception as e:
        print(f"[ERROR] Exception during TTS request: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return b""
