// src/lib/api.ts
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface Voice {
  voice_id: string;
  name: string;
}

export interface DebateResponse {
  response: string;
}

export interface TranscriptionResponse {
  text: string;
}

export interface TTSResponse {
  audioContent: string;
  format: string;
}

// Fetch available voices
export const fetchVoices = async (): Promise<Voice[]> => {
  try {
    const response = await axios.get(`${API_URL}/voices`);
    return response.data.voices || [];
  } catch (error) {
    console.error('Error fetching voices:', error);
    return [];
  }
};

// Transcribe audio
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    
    const response = await axios.post<TranscriptionResponse>(
      `${API_URL}/transcribe`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data.text || '';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
};

// Get debate response
export const getDebateResponse = async (
  userInput: string,
  history: [string, string][] = [],
  debateSide: string,
  debateRound: number
): Promise<string> => {
  try {
    const response = await axios.post<DebateResponse>(
      `${API_URL}/debate-response`,
      {
        userInput,
        history,
        debateSide,
        debateRound
      }
    );
    
    return response.data.response || '';
  } catch (error) {
    console.error('Error getting debate response:', error);
    throw new Error('Failed to get debate response');
  }
};

// Generate speech from text
export const textToSpeech = async (text: string, voiceId: string): Promise<string> => {
  try {
    const response = await axios.post<TTSResponse>(
      `${API_URL}/tts`,
      {
        text,
        voiceId
      }
    );
    
    // Return the base64 audio string
    return `data:${response.data.format};base64,${response.data.audioContent}`;
  } catch (error) {
    console.error('Error converting text to speech:', error);
    throw new Error('Failed to convert text to speech');
  }
};
