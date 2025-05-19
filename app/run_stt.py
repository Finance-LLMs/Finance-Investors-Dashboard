#!/usr/bin/env python
# Helper script to run speech-to-text

import sys
import os

# Add the directory containing this script to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from stt_elevenlabs import transcribe_audio

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Transcription failed: No audio file provided")
        sys.exit(1)
    
    audio_path = sys.argv[1]
    language = sys.argv[2] if len(sys.argv) > 2 else "en"
    
    try:
        transcript = transcribe_audio(audio_path, language)
        print(transcript)
    except Exception as e:
        print(f"Transcription failed: {str(e)}")
        sys.exit(1)
