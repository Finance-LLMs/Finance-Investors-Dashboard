#!/usr/bin/env python3
"""
ElevenLabs ConvAI Agent implementation for debate responses
"""

import os
import sys
import json
import requests
from typing import Optional

# ElevenLabs constants
ELEVEN_API_KEY = "sk_58867558b9f2729bdf352667a7431a7195fff32ef7f75518"
AGENT_ID = "agent_01jw38s8c2efzth4rhmd9dfnj1"
ELEVEN_API_URL = f"https://api.elevenlabs.io/v1/convai/agents/{AGENT_ID}/simulate-conversation"

def get_agent_response(user_input: str, topic: str = "", debate_side: str = "against") -> str:
    """
    Get response from ElevenLabs ConvAI agent
    
    Args:
        user_input: The user's debate argument
        topic: The debate topic
        debate_side: Which side the AI should take ('for' or 'against')
    
    Returns:
        The agent's response text
    """
    try:
        print(f"[DEBUG] ElevenLabs Agent - Starting response generation", file=sys.stderr)
        print(f"[DEBUG] User Input: {user_input}", file=sys.stderr)
        print(f"[DEBUG] Topic: {topic}", file=sys.stderr)
        print(f"[DEBUG] Debate Side: {debate_side}", file=sys.stderr)
        
        # Construct the prompt based on the debate context
        if topic:
            first_message = (
                f"You are an AI system designed to be an expert debater, mimicking the personality of a sassy human. "
                f"You have a wealth of knowledge about healthcare, medical, and caregiving professions. You are meticulous, "
                f"highly detailed and confident in asserting your stand during conversations. Today's debate topic is: "
                f"{topic}. You are to give an opposing motion for no less "
                f"than 4 minutes (more than 500 words) after the other team (human) has given their stand (proponent view). "
                f"Be firm and clear in your stand as the opposing motion. Give a detailed speech filled with examples.\n\n"
                f"For each of your points:\n"
                f"- State your stand clearly\n"
                f"- Make specific references to the contents of your opponents' speech\n"
                f"- Include explanations, analogies, and examples\n"
                f"- Ask a follow-up question to challenge their view\n\n"
                f"At the end, summarize your points and restate the questions.\n\n"
                f"Topic: {topic}\n"
                f"User says: {user_input}"
            )
        else:
            first_message = user_input
        print(f"[DEBUG] Constructed first_message length: {len(first_message)} characters", file=sys.stderr)
        print(f"[DEBUG] First message preview: {first_message[:200]}...", file=sys.stderr)
        
        headers = {
            "Xi-Api-Key": ELEVEN_API_KEY,
            "Content-Type": "application/json",
        }
        
        payload = {
            "simulation_specification": {
                "simulated_user_config": {
                    "language": "en",
                    "first_message": first_message
                }
            }
        }
        
        print(f"[DEBUG] Making request to ElevenLabs API: {ELEVEN_API_URL}", file=sys.stderr)
        print(f"[DEBUG] Payload size: {len(str(payload))} characters", file=sys.stderr)
        
        response = requests.post(ELEVEN_API_URL, json=payload, headers=headers, timeout=30)
        
        print(f"[DEBUG] API Response Status: {response.status_code}", file=sys.stderr)
        
        if not response.ok:
            print(f"Error: ElevenLabs API returned {response.status_code}: {response.text}", file=sys.stderr)
            return ""
        
        data = response.json()
        print(f"[DEBUG] Response data keys: {list(data.keys())}", file=sys.stderr)
        
        conversation = data.get("simulated_conversation", [])
        print(f"[DEBUG] Conversation entries: {len(conversation)}", file=sys.stderr)
        
        # Extract agent messages
        agent_messages = [msg.get("message") for msg in conversation if msg.get("role") == "agent"]
        print(f"[DEBUG] Found {len(agent_messages)} agent messages", file=sys.stderr)
        
        if agent_messages:
            final_response = agent_messages[-1]
            print(f"[DEBUG] Final AI Response Length: {len(final_response)} characters", file=sys.stderr)
            print(f"[DEBUG] AI Response Preview: {final_response[:200]}...", file=sys.stderr)
            print(f"[DEBUG] Full AI Response:\n{'-'*50}\n{final_response}\n{'-'*50}", file=sys.stderr)
            return final_response  # Return the last agent response
        else:
            print("Error: No agent response found in conversation", file=sys.stderr)
            return ""
            
    except requests.RequestException as e:
        print(f"Error calling ElevenLabs API: {e}", file=sys.stderr)
        return ""
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        return ""

def main():
    """
    Main function for command line usage
    Expected arguments: user_input [history_json] [debate_side] [debate_round]
    """
    if len(sys.argv) < 2:
        print("Usage: python elevenlabs_agent.py <user_input> [history_json] [debate_side] [debate_round]", file=sys.stderr)
        sys.exit(1)
    
    user_input = sys.argv[1]
    history_json = sys.argv[2] if len(sys.argv) > 2 else "[]"
    debate_side = sys.argv[3] if len(sys.argv) > 3 else "against"
    debate_round = sys.argv[4] if len(sys.argv) > 4 else "1"
    
    # For now, we'll use a default topic. In the future, this could be passed as an argument
    topic = "AI should be allowed to override human decisions in healthcare"
    
    try:
        # Parse history if provided (though ElevenLabs agent doesn't use it directly)
        history = json.loads(history_json) if history_json else []
        
        # Get response from ElevenLabs agent
        response = get_agent_response(user_input, topic, debate_side)
        
        if response:
            print(response)
        else:
            print("I apologize, but I'm having trouble generating a response right now. Please try again.", file=sys.stderr)
            sys.exit(1)
            
    except json.JSONDecodeError as e:
        print(f"Error parsing history JSON: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
