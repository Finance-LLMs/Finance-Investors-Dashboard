#!/usr/bin/env python
# Helper script to get all voices

import json
import sys
import os

# Add the directory containing this script to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from tts_elevenlabs import list_voices

if __name__ == "__main__":
    try:
        voices = list_voices()
        print(json.dumps(voices))
    except Exception as e:
        print(json.dumps({"error": str(e), "voices": []}))
        sys.exit(1)
