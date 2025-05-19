#!/usr/bin/env python
# Test script to verify our Unicode handling solution

import sys
import json
import subprocess

def test_unicode_handling():
    """Test that our clean_text_helper.py can handle Unicode characters correctly"""
    # Text with problematic Unicode characters
    test_text = """
--- RESPONSE BEGIN ---
<think>
Some thinking here
</think>
AI enhances healthcare through accurate diagnoses using advanced imaging and genetic testing, 
improving early detection outcomes. It aids access by interpreting consultations for remote 
patients, expanding care options. However, AI lacks human touch\ufffdcrucial for emotional 
and psychological patient care\ufffdand relies on data with potential biases or gaps in information. 
Thus, while valuable, AI complements, not replaces, essential human-centered healthcare.
--- RESPONSE END ---
"""

    # Call clean_text_helper.py with the test text
    cmd = [
        sys.executable, 
        "app/clean_text_helper.py", 
        test_text
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print("Success! Output:")
        print(result.stdout)
        
        # Try to parse the JSON output
        try:
            parsed = json.loads(result.stdout)
            print("\nParsed JSON successfully:")
            print(parsed)
            return True
        except json.JSONDecodeError as e:
            print(f"\nJSON parsing error: {e}")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"Error running clean_text_helper.py: {e}")
        print(f"Stdout: {e.stdout}")
        print(f"Stderr: {e.stderr}")
        return False

if __name__ == "__main__":
    print("Testing Unicode handling in clean_text_helper.py...")
    success = test_unicode_handling()
    sys.exit(0 if success else 1)
