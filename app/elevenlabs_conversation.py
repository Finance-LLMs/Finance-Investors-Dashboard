#!/usr/bin/env python
# ElevenLabs Conversational AI integration using the official Python SDK

import os
import sys
import asyncio
import threading
from typing import Optional, Callable, List, Dict, Any
import time
import requests

# Add parent directory to path to handle imports correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from elevenlabs.client import ElevenLabs
    from elevenlabs.conversational_ai.conversation import Conversation
    from elevenlabs.conversational_ai.default_audio_interface import DefaultAudioInterface
    ELEVENLABS_SDK_AVAILABLE = True
except ImportError:
    print("[WARNING] ElevenLabs SDK not available. Install with: pip install 'elevenlabs[pyaudio]'")
    ELEVENLABS_SDK_AVAILABLE = False

from instance.config import ELEVENLABS_API_KEY

class DebateConversationManager:
    """
    Manages ElevenLabs conversational AI for debate scenarios.
    Provides both real-time conversation and text-based interaction.
    """
    
    def __init__(self, agent_id: str, api_key: str = None):
        self.agent_id = agent_id
        self.api_key = api_key or ELEVENLABS_API_KEY
        self.conversation = None
        self.conversation_id = None
        self.is_session_active = False
        self.responses = []
        self.conversation_history = []
        
        if not ELEVENLABS_SDK_AVAILABLE:
            raise ImportError("ElevenLabs SDK is required. Install with: pip install 'elevenlabs[pyaudio]'")
        
        # Initialize ElevenLabs client
        self.client = ElevenLabs(api_key=self.api_key)
    
    def create_conversation(self, 
                          audio_interface=None,
                          callback_agent_response: Optional[Callable[[str], None]] = None,
                          callback_user_transcript: Optional[Callable[[str], None]] = None,
                          callback_latency: Optional[Callable[[int], None]] = None) -> Conversation:
        """
        Create a new conversation instance with custom callbacks.
        """
        # Use default audio interface if none provided
        if audio_interface is None:
            audio_interface = DefaultAudioInterface()
        
        # Set up default callbacks if none provided
        if callback_agent_response is None:
            callback_agent_response = self._default_agent_response_callback
        
        if callback_user_transcript is None:
            callback_user_transcript = self._default_user_transcript_callback
        
        self.conversation = Conversation(
            self.client,
            self.agent_id,
            requires_auth=bool(self.api_key),
            audio_interface=audio_interface,
            callback_agent_response=callback_agent_response,
            callback_agent_response_correction=self._agent_response_correction_callback,
            callback_user_transcript=callback_user_transcript,
            callback_latency_measurement=callback_latency,
        )
        
        return self.conversation
    
    def _default_agent_response_callback(self, response: str):
        """Default callback for agent responses."""
        print(f"Agent: {response}")
        self.responses.append(response)
        self.conversation_history.append({"role": "agent", "text": response, "timestamp": time.time()})
    
    def _default_user_transcript_callback(self, transcript: str):
        """Default callback for user transcripts."""
        print(f"User: {transcript}")
        self.conversation_history.append({"role": "user", "text": transcript, "timestamp": time.time()})
    
    def _agent_response_correction_callback(self, original: str, corrected: str):
        """Callback for agent response corrections."""
        print(f"Agent correction: {original} -> {corrected}")
    
    def start_conversation(self, timeout_seconds: int = 300) -> str:
        """
        Start a conversation session and return the conversation ID.
        
        Args:
            timeout_seconds: Maximum time to keep the conversation active
        
        Returns:
            conversation_id: ID of the conversation session
        """
        if not self.conversation:
            self.create_conversation()
        
        print(f"[DEBUG] Starting conversation with agent: {self.agent_id}")
        self.conversation.start_session()
        self.is_session_active = True
        
        # Set up automatic session timeout
        def timeout_handler():
            time.sleep(timeout_seconds)
            if self.is_session_active:
                print(f"[DEBUG] Conversation timeout after {timeout_seconds} seconds")
                self.end_conversation()
        
        timeout_thread = threading.Thread(target=timeout_handler, daemon=True)
        timeout_thread.start()
        
        return self.agent_id  # Return agent ID as session identifier
    
    def end_conversation(self) -> Optional[str]:
        """
        End the current conversation session.
        
        Returns:
            conversation_id: ID of the ended conversation
        """
        if self.conversation and self.is_session_active:
            print("[DEBUG] Ending conversation session")
            self.conversation_id = self.conversation.end_session()
            self.is_session_active = False
            return self.conversation_id
        return None
    
    def wait_for_session_end(self) -> Optional[str]:
        """
        Wait for the conversation session to end naturally.
        
        Returns:
            conversation_id: ID of the conversation
        """
        if self.conversation:
            self.conversation_id = self.conversation.wait_for_session_end()
            self.is_session_active = False
            return self.conversation_id
        return None
    
    def get_last_response(self) -> Optional[str]:
        """Get the last agent response."""
        return self.responses[-1] if self.responses else None
    
    def get_conversation_history(self) -> List[Dict[str, Any]]:
        """Get the full conversation history."""
        return self.conversation_history.copy()
    
    def clear_history(self):
        """Clear the conversation history."""
        self.responses.clear()
        self.conversation_history.clear()

# Custom Audio Interface for file-based audio processing
class FileAudioInterface:
    """
    Custom audio interface for file-based audio input/output.
    Useful for web applications where audio comes from uploaded files.
    """
    
    def __init__(self):
        self.audio_input_file = None
        self.audio_output_data = None
    
    def set_input_file(self, file_path: str):
        """Set the audio input file path."""
        self.audio_input_file = file_path
    
    def get_output_data(self) -> Optional[bytes]:
        """Get the generated audio output data."""
        return self.audio_output_data
    
    # Methods required by AudioInterface (simplified implementation)
    def start(self):
        """Start the audio interface."""
        print("[DEBUG] File audio interface started")
    
    def stop(self):
        """Stop the audio interface."""
        print("[DEBUG] File audio interface stopped")

# Fallback to REST API implementation for compatibility
class FallbackConversationManager:
    """
    Fallback implementation using REST API when SDK is not available.
    """
    
    def __init__(self, agent_id: str, api_key: str = None):
        self.agent_id = agent_id
        self.api_key = api_key or ELEVENLABS_API_KEY
        self.conversation_url = f"https://api.elevenlabs.io/v1/convai/agents/{agent_id}/simulate-conversation"
    
    def get_agent_response(self, first_message: str) -> str:
        """
        Get agent response using REST API simulation.
        This is the existing implementation from streamlit_debator__2.py
        """
        print("Sending to Agent via REST API...")
        headers = {
            "Xi-Api-Key": self.api_key,
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
        
        try:
            resp = requests.post(self.conversation_url, json=payload, headers=headers)
            resp.raise_for_status()
            
            data = resp.json()
            conv = data.get("simulated_conversation", [])
            agent_msgs = [m.get("message") for m in conv if m.get("role") == "agent"]
            response = agent_msgs[-1] if agent_msgs else ""
            print(f"Agent Response: {response}")
            return response
        except Exception as e:
            print(f"[ERROR] Failed to get agent response: {e}")
            return ""

# Factory function to create the appropriate conversation manager
def create_conversation_manager(agent_id: str, api_key: str = None, prefer_sdk: bool = True):
    """
    Create a conversation manager, preferring SDK but falling back to REST API.
    
    Args:
        agent_id: ElevenLabs agent ID
        api_key: API key (optional)
        prefer_sdk: Whether to prefer SDK over REST API
    
    Returns:
        Conversation manager instance
    """
    if ELEVENLABS_SDK_AVAILABLE and prefer_sdk:
        try:
            return DebateConversationManager(agent_id, api_key)
        except Exception as e:
            print(f"[WARNING] Failed to create SDK manager: {e}")
            return FallbackConversationManager(agent_id, api_key)
    else:
        return FallbackConversationManager(agent_id, api_key)

if __name__ == "__main__":
    # Example usage
    agent_id = "agent_01jw5fzsbnek3bfab7p690qp44"  # Your agent ID
    
    try:
        # Try SDK approach
        manager = create_conversation_manager(agent_id)
        
        if isinstance(manager, DebateConversationManager):
            print("Using ElevenLabs SDK for conversation")
            conversation_id = manager.start_conversation(timeout_seconds=60)
            print(f"Conversation started: {conversation_id}")
            
            # Wait for conversation to end (user would interact via voice)
            # manager.wait_for_session_end()
            
            # For demo, end immediately
            time.sleep(2)
            manager.end_conversation()
            
            print("Conversation history:")
            for entry in manager.get_conversation_history():
                print(f"  {entry['role']}: {entry['text']}")
        
        else:
            print("Using REST API fallback")
            response = manager.get_agent_response("Hello, let's start a debate about healthcare.")
            print(f"Response: {response}")
    
    except Exception as e:
        print(f"Error: {e}")
