#!/usr/bin/env python
# Helper script to clean text for frontend display

import sys
import os
import re
import json

# Add the directory containing this script to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from clean_tts import clean_text_for_tts

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: No text provided")
        sys.exit(1)
    
    text = sys.argv[1]
    cleaned_text = clean_text_for_tts(text)
    
    # Handle Unicode issues by replacing invalid characters
    cleaned_text = cleaned_text.replace('\ufffd', '-')
    
    # Use JSON to properly encode special characters
    print(json.dumps(cleaned_text))