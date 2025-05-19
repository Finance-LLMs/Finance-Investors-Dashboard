#!/usr/bin/env python
# Enhanced TTS script with improved error handling, timeouts, and diagnostics

import sys
import os
import time
import traceback
import requests

# Add the directory containing this script to the Python path
app_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(app_dir)
sys.path.append(app_dir)

# Import the API key
sys.path.append(os.path.join(app_dir))
try:
    from instance.config import ELEVENLABS_API_KEY
    api_key_loaded = True
except ImportError:
    print("[ERROR] Failed to import ELEVENLABS_API_KEY")
    api_key_loaded = False
    ELEVENLABS_API_KEY = ""

def verify_api_key():
    """Verify if the API key is valid with a simple request"""
    if not ELEVENLABS_API_KEY:
        print("[ERROR] No API key found")
        return False
    
    url = "https://api.elevenlabs.io/v1/user/subscription"
    headers = {"xi-api-key": ELEVENLABS_API_KEY}
    
    try:
        print("[DEBUG] Verifying API key with subscription endpoint...")
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            print(f"[DEBUG] API key is valid. Subscription info: {resp.json().get('tier')}")
            character_count = resp.json().get('character_count', 0)
            character_limit = resp.json().get('character_limit', 0)
            print(f"[DEBUG] Character usage: {character_count}/{character_limit}")
            return True
        else:
            print(f"[ERROR] API key verification failed: {resp.status_code} - {resp.text}")
            return False
    except Exception as e:
        print(f"[ERROR] Error verifying API key: {str(e)}")
        return False

def text_to_speech(text, voice_id, model_id="eleven_multilingual_v2", timeout=30):
    """
    Enhanced text-to-speech function with timeout and better error handling
    """
    print(f"[DEBUG] Starting TTS conversion with {len(text)} characters")
    print(f"[DEBUG] Voice ID: {voice_id}")
    print(f"[DEBUG] Model: {model_id}")
    
    # Verify the API key first
    if not verify_api_key():
        print("[ERROR] API key validation failed")
        return b""
    
    # Truncate long text to avoid request issues
    if len(text) > 5000:
        print("[WARNING] Text exceeds 5000 characters, truncating...")
        text = text[:4990] + "..."
    
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
    }
    params = {"output_format": "mp3_44100_128"}
    payload = {
        "text": text,
        "model_id": model_id,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
    
    try:
        print(f"[DEBUG] Sending request to ElevenLabs API (timeout: {timeout}s)...")
        resp = requests.post(url, headers=headers, params=params, json=payload, timeout=timeout)
        
        print(f"[DEBUG] Response status code: {resp.status_code}")
        print(f"[DEBUG] Response content type: {resp.headers.get('Content-Type', 'unknown')}")
        
        if resp.status_code == 200:
            content_length = len(resp.content)
            print(f"[SUCCESS] Received {content_length} bytes of audio data")
            
            # Verify we actually got audio data
            if content_length < 1000:
                print(f"[WARNING] Audio data seems too small ({content_length} bytes)")
                
            # Check content type
            content_type = resp.headers.get('Content-Type', '')
            if 'audio' not in content_type:
                print(f"[WARNING] Response Content-Type is not audio: {content_type}")
            
            return resp.content
        else:
            print(f"[ERROR] ElevenLabs TTS failed ({resp.status_code}): {resp.text}")
            return b""
    except requests.exceptions.Timeout:
        print(f"[ERROR] Request timed out after {timeout} seconds")
        return b""
    except Exception as e:
        print(f"[ERROR] Exception during TTS request: {str(e)}")
        print(traceback.format_exc())
        return b""

def main():
    if len(sys.argv) < 3:
        print("[ERROR] Text and voice_id required")
        return 1
    
    text = sys.argv[1]
    voice_id = sys.argv[2]
    
    # Allow setting timeout from command line
    timeout = 60  # Default to 60 seconds
    if len(sys.argv) > 3:
        try:
            timeout = int(sys.argv[3])
            print(f"[DEBUG] Using custom timeout: {timeout}s")
        except ValueError:
            print(f"[WARNING] Invalid timeout value, using default {timeout}s")
    
    # Create output directory if it doesn't exist - use absolute path
    server_dir = os.path.join(root_dir, "server")
    upload_dir = os.path.join(server_dir, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    timestamp = int(time.time())
    output_filename = f"tts-{timestamp}.mp3"
    output_path = os.path.join(upload_dir, output_filename)
    
    try:
        print(f"[DEBUG] Starting TTS process")
        print(f"[DEBUG] Output path: {output_path}")
        
        # Print more diagnostic information
        print(f"[DEBUG] Python version: {sys.version}")
        print(f"[DEBUG] Requests version: {requests.__version__}")
        print(f"[DEBUG] API key: {'valid' if api_key_loaded else 'not loaded'}")
        
        audio_bytes = text_to_speech(text, voice_id, timeout=timeout)
        
        if not audio_bytes:
            print("[ERROR] No audio data received from ElevenLabs")
            return 1
        
        # Save the audio to a file
        with open(output_path, "wb") as f:
            f.write(audio_bytes)
        
        print(f"[SUCCESS] Audio file saved: {output_path}")
        
        # Success - just output the path for the server to find
        print(output_path)
        return 0
    except Exception as e:
        print(f"[ERROR] Exception in main: {str(e)}")
        print(traceback.format_exc())
        return 1

if __name__ == "__main__":
    sys.exit(main())
