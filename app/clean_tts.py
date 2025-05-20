#!/usr/bin/env python
# Clean TTS helper script that filters debug output and model thinking tags

import sys
import os
import time
import re

# Add the directory containing this script to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from tts_elevenlabs import text_to_speech

def clean_text_for_tts(text):
    """
    Clean the text to remove debugging info and model thinking
    """
    # Check if we have the special response markers
    start = text.find("--- RESPONSE BEGIN ---") + len("--- RESPONSE BEGIN ---")
    end = text.find("--- RESPONSE END ---")
    if start > 0 and end > start:
        response_text = text[start:end].strip()
        
        # Remove any thinking blocks within the response
        response_text = re.sub(r'<think>[\s\S]*?</think>', '', response_text, flags=re.DOTALL)
        
        # Replace any problematic Unicode characters
        response_text = response_text.replace('\ufffd', '-')
        
        # Clean up other potential problematic characters
        response_text = ''.join(char if ord(char) < 65536 else '-' for char in response_text)
        
        # # Split into paragraphs and get the last non-empty one
        # paragraphs = [p for p in re.split(r'\n\s*\n', response_text) if p.strip()]
        # if paragraphs:
        #     # Get the last paragraph
        #     final_paragraph = paragraphs[-1].strip()
        #     return final_paragraph
        
        return response_text.strip()
    
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("TTS failed: Text and voice_id required")
        sys.exit(1)
    
    text = sys.argv[1]
    voice_id = sys.argv[2]
    
    # First clean the text
    cleaned_text = clean_text_for_tts(text)
    
    print(f"Original text length: {len(text)}")
    print(f"Cleaned text length: {len(cleaned_text)}")
    
    # Create output directory if it doesn't exist
    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "server", "uploads")
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, f"tts-{int(time.time())}.mp3")
    try:
        print(f"Starting TTS for cleaned text")
        print(f"Voice ID: {voice_id}")
        print(f"Output path: {output_path}")
        
        audio_bytes = text_to_speech(cleaned_text, voice_id)
        
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
