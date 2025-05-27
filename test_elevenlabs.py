#!/usr/bin/env python3
"""
Test script for ElevenLabs agent functionality
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from elevenlabs_agent import get_agent_response

def test_elevenlabs_agent():
    """Test the ElevenLabs agent with a simple input"""
    print("Testing ElevenLabs ConvAI agent...")
    
    # Test parameters
    user_input = "I believe AI should make decisions in healthcare because it can process data faster and more accurately than humans."
    topic = "AI should be allowed to override human decisions in healthcare"
    debate_side = "against"
    
    print(f"User input: {user_input}")
    print(f"Topic: {topic}")
    print(f"AI side: {debate_side}")
    print("\nGenerating response...")
    
    try:
        response = get_agent_response(user_input, topic, debate_side)
        if response:
            print(f"\nAI Response ({len(response)} characters):")
            print("-" * 50)
            print(response)
            print("-" * 50)
            print("\n✅ ElevenLabs agent test PASSED")
            return True
        else:
            print("\n❌ ElevenLabs agent test FAILED - No response received")
            return False
    except Exception as e:
        print(f"\n❌ ElevenLabs agent test FAILED - Error: {e}")
        return False

if __name__ == "__main__":
    test_elevenlabs_agent()
