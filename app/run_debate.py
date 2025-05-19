#!/usr/bin/env python
# Helper script to run debate response generation

import sys
import os
import json

# Add the directory containing this script to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from rag_pipeline import llm_response_medical_debate

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Error: Missing required arguments")
        sys.exit(1)
    try:
        user_input = sys.argv[1]
        print(f"Received user input of length: {len(user_input)}")
        
        # Parse history as JSON
        history_json = sys.argv[2]
        history = json.loads(history_json) if history_json != "[]" else None
        print(f"Parsed history with {len(history) if history else 0} entries")
        
        debate_side = sys.argv[3]
        debate_round = int(sys.argv[4]) if len(sys.argv) > 4 else 1
        print(f"Debate side: {debate_side}, round: {debate_round}")
          # Verify Ollama connection before proceeding
        from langchain_ollama import OllamaLLM
        print("Creating OllamaLLM instance...")
        llm = OllamaLLM(model="deepseek-r1", temperature=0.7)
        
        print("Generating debate response...")
        response = llm_response_medical_debate(
            query=user_input,
            debate_side=debate_side
        )
        
        # Only output the final response without debug logs
        print(f"--- RESPONSE BEGIN ---")
        print(response)
        print(f"--- RESPONSE END ---")
    except Exception as e:
        import traceback
        print(f"Error generating debate response: {str(e)}")
        print(traceback.format_exc())
        print(f"Error generating debate response: {str(e)}")
        sys.exit(1)
