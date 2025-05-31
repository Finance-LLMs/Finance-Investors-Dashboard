#!/usr/bin/env python
# Helper script to run debate response generation

import sys
import os
import json

# Add the directory containing this script to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from streamlit_debator__2 import get_agent_response

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
        # from langchain_ollama import OllamaLLM
        # print("Creating OllamaLLM instance...")
        # llm = OllamaLLM(model="qwen2:1.5b", temperature=0.7)
        print("Generating debate response...")
        topic = "AI in healthcare, allowing AI to override human decisions in healthcare."
        
        # Create a more specific and contextual prompt for the debate
        if debate_side.lower() == "for":
            stance_instruction = "You strongly SUPPORT allowing AI to override human decisions in healthcare when appropriate."
            examples = "Argue points like: AI can process vast amounts of data faster than humans, reduce medical errors, provide consistent care 24/7, and make unbiased decisions based purely on medical evidence."
        else:
            stance_instruction = "You strongly OPPOSE allowing AI to override human decisions in healthcare."
            examples = "Argue points like: Human judgment and empathy are irreplaceable, AI can have biases in training data, patients deserve human decision-makers, and medical ethics require human accountability."
        
        prompt = f"""You are participating in a formal debate about: "{topic}"

Your Position: {stance_instruction}

Context: The user just said: "{user_input}"

Your task: Provide a strong, well-reasoned argument that directly addresses their point while advancing your position. {examples}

Be engaging, use specific examples, and challenge their reasoning. Keep your response focused and persuasive. Respond as if you're in a live debate - be assertive and confident in your position.

Your response:"""

        response = get_agent_response(prompt)
        
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
