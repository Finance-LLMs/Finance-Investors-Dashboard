#!/usr/bin/env python
# Fixed TTS script that ensures proper output path handling

import sys
import os
import time
import traceback

# Add the directory containing this script to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from tts_elevenlabs import text_to_speech

def main():
    if len(sys.argv) < 3:
        print("TTS failed: Text and voice_id required")
        return 1
    
    text = sys.argv[1]
    voice_id = sys.argv[2]
    
    # Create output directory if it doesn't exist - use absolute path
    server_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "server")
    upload_dir = os.path.join(server_dir, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    timestamp = int(time.time())
    output_filename = f"tts-{timestamp}.mp3"
    output_path = os.path.join(upload_dir, output_filename)
    
    try:
        print(f"Starting TTS with ElevenLabs...")
        print(f"Text length: {len(text)}")
        print(f"Voice ID: {voice_id}")
        print(f"Output path: {output_path}")
        
        audio_bytes = text_to_speech(text, voice_id)
        
        if not audio_bytes:
            print("Error: No audio data received from ElevenLabs")
            return 1
        
        print(f"Received {len(audio_bytes)} bytes of audio data")
        
        # Save the audio to a file
        with open(output_path, "wb") as f:
            f.write(audio_bytes)
        
        print(f"Audio file saved: {output_path}")
        
        # Success - just output the path for the server to find
        print(output_path)
        return 0
    except Exception as e:
        print(f"TTS Error: {str(e)}")
        print(traceback.format_exc())
        return 1

if __name__ == "__main__":
    sys.exit(main())
