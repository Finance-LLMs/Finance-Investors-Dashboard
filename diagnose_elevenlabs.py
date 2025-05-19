#!/usr/bin/env python
# Script to diagnose issues with ElevenLabs API

import os
import sys
import json
import time
import requests

# Add the app directory to the path to access the config
app_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app")
sys.path.append(app_dir)

try:
    from instance.config import ELEVENLABS_API_KEY
    print(f"API key loaded (first 5 chars): {ELEVENLABS_API_KEY[:5]}...")
except ImportError as e:
    print(f"Failed to import ELEVENLABS_API_KEY: {str(e)}")
    print("Please ensure the API key is properly set in app/instance/config.py")
    sys.exit(1)

def check_api_status():
    """Check if ElevenLabs API is accessible"""
    try:
        resp = requests.get("https://api.elevenlabs.io/v1/voices", timeout=5)
        if resp.status_code == 200:
            return True, "ElevenLabs API is accessible"
        else:
            return False, f"ElevenLabs API returned status code {resp.status_code}"
    except Exception as e:
        return False, f"Failed to connect to ElevenLabs API: {str(e)}"

def check_subscription():
    """Check subscription status"""
    headers = {"xi-api-key": ELEVENLABS_API_KEY}
    try:
        resp = requests.get("https://api.elevenlabs.io/v1/user/subscription", headers=headers, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            return True, {
                "tier": data.get("tier", "unknown"),
                "character_count": data.get("character_count", 0),
                "character_limit": data.get("character_limit", 0),
                "remaining_characters": data.get("character_limit", 0) - data.get("character_count", 0)
            }
        else:
            return False, f"Failed to check subscription: {resp.status_code} - {resp.text}"
    except Exception as e:
        return False, f"Error checking subscription: {str(e)}"

def list_available_voices():
    """List available voices"""
    headers = {"xi-api-key": ELEVENLABS_API_KEY}
    try:
        resp = requests.get("https://api.elevenlabs.io/v1/voices", headers=headers, timeout=5)
        if resp.status_code == 200:
            voices = resp.json().get("voices", [])
            return True, [{"name": v.get("name"), "id": v.get("voice_id")} for v in voices]
        else:
            return False, f"Failed to list voices: {resp.status_code} - {resp.text}"
    except Exception as e:
        return False, f"Error listing voices: {str(e)}"

def test_tts_request():
    """Test a small TTS request"""
    test_text = "This is a short test of the ElevenLabs text to speech API."
    voice_id = "EXAVITQu4vr4xnSDxMaL"  # Default voice (Sarah)
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
    }
    
    payload = {
        "text": test_text,
        "model_id": "eleven_multilingual_v2"
    }
    
    print("Testing TTS with a short message...")
    try:
        start_time = time.time()
        resp = requests.post(url, headers=headers, json=payload, timeout=20)
        elapsed = time.time() - start_time
        
        if resp.status_code == 200:
            content_length = len(resp.content)
            output_file = os.path.join(os.path.dirname(__file__), "test_output", f"test_short_{int(time.time())}.mp3")
            os.makedirs(os.path.dirname(output_file), exist_ok=True)
            
            with open(output_file, "wb") as f:
                f.write(resp.content)
            
            return True, {
                "status": "Success",
                "bytes_received": content_length,
                "elapsed_seconds": elapsed,
                "output_file": output_file
            }
        else:
            return False, {
                "status": "Failed",
                "status_code": resp.status_code,
                "error": resp.text,
                "elapsed_seconds": elapsed
            }
    except Exception as e:
        import traceback
        return False, {
            "status": "Error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }

def run_diagnostics():
    """Run all diagnostics and print results"""
    print("=== ElevenLabs API Diagnostics ===")
    print("\n1. Checking API status...")
    status_ok, status_msg = check_api_status()
    print(f"API Status: {'✅ OK' if status_ok else '❌ Failed'}")
    print(f"Result: {status_msg}")
    
    print("\n2. Checking subscription...")
    sub_ok, sub_data = check_subscription()
    print(f"Subscription: {'✅ OK' if sub_ok else '❌ Failed'}")
    if sub_ok:
        print(f"Tier: {sub_data['tier']}")
        print(f"Character usage: {sub_data['character_count']} / {sub_data['character_limit']}")
        print(f"Characters remaining: {sub_data['remaining_characters']}")
    else:
        print(f"Error: {sub_data}")
    
    print("\n3. Checking available voices...")
    voices_ok, voices_data = list_available_voices()
    print(f"Voices: {'✅ OK' if voices_ok else '❌ Failed'}")
    if voices_ok:
        print(f"Found {len(voices_data)} voices:")
        for i, voice in enumerate(voices_data[:5]):  # Show first 5 voices
            print(f"  - {voice['name']} (ID: {voice['id']})")
        if len(voices_data) > 5:
            print(f"  - ... {len(voices_data) - 5} more voices available")
    else:
        print(f"Error: {voices_data}")
    
    print("\n4. Testing TTS with short message...")
    tts_ok, tts_data = test_tts_request()
    print(f"TTS Test: {'✅ OK' if tts_ok else '❌ Failed'}")
    if tts_ok:
        print(f"Received {tts_data['bytes_received']} bytes in {tts_data['elapsed_seconds']:.2f} seconds")
        print(f"Output file: {tts_data['output_file']}")
    else:
        print(f"Status: {tts_data.get('status', 'Unknown')}")
        print(f"Error: {tts_data.get('error', 'Unknown')}")
        if tts_data.get('traceback'):
            print(f"Details:\n{tts_data['traceback']}")
    
    print("\n=== Diagnostics Summary ===")
    print(f"API Status: {'✅' if status_ok else '❌'}")
    print(f"Subscription: {'✅' if sub_ok else '❌'}")
    print(f"Voices: {'✅' if voices_ok else '❌'}")
    print(f"TTS Test: {'✅' if tts_ok else '❌'}")
    
    return status_ok and sub_ok and voices_ok and tts_ok

if __name__ == "__main__":
    success = run_diagnostics()
    sys.exit(0 if success else 1)
