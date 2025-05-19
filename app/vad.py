# app/vad.py

import numpy as np
import time
from typing import Callable, Optional

class VoiceActivityDetector:
    """
    Simple Voice Activity Detection to automatically detect when the user stops speaking.
    This can be used to create a more natural Siri-like conversation flow.
    """
    
    def __init__(self, 
                silence_threshold: float = 0.05, 
                silence_duration: float = 2.0,
                on_silence_callback: Optional[Callable] = None):
        """
        Initialize a voice activity detector
        
        Args:
            silence_threshold: Amplitude threshold below which audio is considered silence
            silence_duration: Duration of silence (in seconds) before stopping recording
            on_silence_callback: Function to call when silence is detected
        """
        self.silence_threshold = silence_threshold
        self.silence_duration = silence_duration
        self.on_silence_callback = on_silence_callback
        
        # State tracking
        self.is_silent = True
        self.silent_since = time.time()
        self.was_active = False
    
    def process_audio(self, audio_data: np.ndarray) -> bool:
        """
        Process audio chunk and detect if speech has ended
        
        Args:
            audio_data: Numpy array of audio samples
            
        Returns:
            True if recording should stop, False otherwise
        """
        # Compute RMS amplitude
        rms = np.sqrt(np.mean(audio_data**2))
        
        # Determine if this chunk is silent
        current_silent = rms < self.silence_threshold
        current_time = time.time()
        
        # If we detect sound after silence, reset the timer
        if not current_silent:
            self.was_active = True  # Mark that we've detected activity
            self.silent_since = current_time
            self.is_silent = False
            return False
        
        # If silent now
        if current_silent:
            # If this is the first silent chunk, mark the time
            if not self.is_silent:
                self.silent_since = current_time
                self.is_silent = True
            
            # Check if we've been silent for long enough after detecting voice activity
            silence_elapsed = current_time - self.silent_since
            if silence_elapsed >= self.silence_duration and self.was_active:
                if self.on_silence_callback:
                    self.on_silence_callback()
                
                # Reset state
                self.was_active = False
                return True  # Signal to stop recording
                
        return False
