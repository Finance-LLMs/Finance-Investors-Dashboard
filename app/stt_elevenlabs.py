# app/stt_elevenlabs.py

import requests
import os
import sys

# Add parent directory to path to handle imports correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from instance.config import ELEVENLABS_API_KEY

def transcribe_audio(audio_path: str, language: str = "en") -> str:
    """
    Send the audio file at audio_path to ElevenLabs STT and return the transcript.
    Optionally forces the language via `language_code`.
    """
    url = "https://api.elevenlabs.io/v1/speech-to-text"
    headers = {"xi-api-key": ELEVENLABS_API_KEY}

    data = {
        "model_id": "scribe_v1",        # required
        "language_code": language       # ISO-639-1 or ISO-639-3, e.g. "en" or "eng" :contentReference[oaicite:0]{index=0}
    }
    files = {"file": open(audio_path, "rb")}

    resp = requests.post(url, headers=headers, data=data, files=files)
    if resp.status_code == 200:
        return resp.json().get("text", "")
    else:
        print("[ERROR] ElevenLabs STT:", resp.status_code, resp.text)
        return "Transcription failed."
