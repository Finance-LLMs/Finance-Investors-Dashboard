#!/usr/bin/env python
# Helper script to run text-to-speech

import sys
import os
import time

# Add the directory containing this script to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from tts_elevenlabs import text_to_speech

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("TTS failed: Text and voice_id required")
        sys.exit(1)
    
    text = sys.argv[1]
    voice_id = sys.argv[2]
    
    # Create output directory if it doesn't exist
    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "server", "uploads")
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, f"tts-{int(time.time())}.mp3")
    try:
        print(f"Starting TTS for text of length: {len(text)}")
        print(f"Voice ID: {voice_id}")
        print(f"Output path: {output_path}")
        
        audio_bytes = text_to_speech(text, voice_id)
        
        print(f"TTS completed - received {len(audio_bytes)} bytes of audio")
        
        # Save the audio to a file
        with open(output_path, "wb") as f:
            f.write(audio_bytes)
        
        print(f"Successfully saved audio to: {output_path}")
        print(output_path)
    except Exception as e:
        import traceback
        print(f"TTS failed: {str(e)}")
        print(traceback.format_exc())
        sys.exit(1)
