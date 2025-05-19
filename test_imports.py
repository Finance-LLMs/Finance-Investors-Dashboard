#!/usr/bin/env python
# Test script to verify imports

import sys
import os

# Add app directory to path
app_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app")
sys.path.append(app_dir)

try:
    from tts_elevenlabs import list_voices
    print("Successfully imported list_voices from tts_elevenlabs")
except ImportError as e:
    print(f"Error importing list_voices: {e}")

try:
    from stt_elevenlabs import transcribe_audio
    print("Successfully imported transcribe_audio from stt_elevenlabs")
except ImportError as e:
    print(f"Error importing transcribe_audio: {e}")

try:
    from instance.config import ELEVENLABS_API_KEY
    print("Successfully imported ELEVENLABS_API_KEY from instance.config")
    print(f"API Key: {ELEVENLABS_API_KEY[:5]}...{ELEVENLABS_API_KEY[-5:]}")
except ImportError as e:
    print(f"Error importing ELEVENLABS_API_KEY: {e}")
