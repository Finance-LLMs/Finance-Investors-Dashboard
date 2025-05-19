#!/usr/bin/env node
// Enhanced server.js with improved TTS handling and timeouts

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { PythonShell } = require('python-shell');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api';

// Configure middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));  // Increase JSON payload limit

// Setup file uploads directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `recording-${Date.now()}.wav`);
  }
});
const upload = multer({ storage });

// Helper function to get a Python interpreter path
function getPythonPath() {
  return 'C:\\Users\\Akshat\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';
}

// Create a promise with a timeout
function promiseWithTimeout(promise, timeoutMs, errorMsg) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMsg || 'Operation timed out'));
    }, timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => clearTimeout(timeoutId));
}

// API Endpoints
// List available voices from ElevenLabs
app.get('/api/voices', async (req, res) => {
  try {
    console.log('[DEBUG] Fetching available voices');
    
    // Use the Python function to get voices
    const options = {
      scriptPath: path.join(__dirname, '../app'),
      pythonPath: getPythonPath(),
      pythonOptions: ['-u'],
      args: []
    };

    promiseWithTimeout(
      PythonShell.run('run_voices.py', options),
      10000,
      'Voice fetching timed out'
    )
    .then(results => {
      // Parse the JSON output from Python
      const voices = JSON.parse(results[0] || '{"voices": []}');
      res.json(voices);
    })
    .catch(err => {
      console.error('Python script error:', err);
      
      // Fallback to direct API call if Python fails
      axios.get('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': ELEVENLABS_API_KEY },
        timeout: 10000 // 10s timeout
      })
      .then(response => {
        res.json(response.data);
      })
      .catch(fallbackErr => {
        console.error('Fallback API error:', fallbackErr);
        res.status(500).json({ error: 'Failed to fetch voices' });
      });
    });
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({ error: 'Failed to fetch voices' });
  }
});

// Handle audio upload and transcription
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioFilePath = req.file.path;
    console.log(`[DEBUG] Processing audio file: ${audioFilePath}`);
    
    // Use Python function for transcription
    const options = {
      scriptPath: path.join(__dirname, '../app'),
      pythonPath: getPythonPath(),
      pythonOptions: ['-u'],
      args: [audioFilePath, 'en']
    };

    promiseWithTimeout(
      PythonShell.run('run_stt.py', options),
      30000, // 30s timeout for transcription
      'Transcription timed out'
    )
    .then(results => {
      const transcription = results[0] || 'Transcription failed';
      console.log(`[DEBUG] Transcription result: ${transcription.slice(0, 50)}...`);
      res.json({ text: transcription });
    })
    .catch(err => {
      console.error('Python transcription error:', err);
      
      // Fallback to direct API call
      const formData = new FormData();
      formData.append('file', fs.createReadStream(audioFilePath));
      formData.append('model_id', 'whisper-1');
      
      axios.post('https://api.elevenlabs.io/v1/speech-to-text', formData, {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          ...formData.getHeaders()
        },
        timeout: 30000 // 30s timeout
      })
      .then(response => {
        res.json({ text: response.data.text });
      })
      .catch(fallbackErr => {
        console.error('Fallback transcription error:', fallbackErr);
        res.status(500).json({ error: 'Failed to transcribe audio' });
      });
    });
  } catch (error) {
    console.error('Error in transcription route:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

// Get debate response using Ollama
app.post('/api/debate-response', async (req, res) => {
  try {
    const { userInput, history, debateSide, debateRound } = req.body;
    console.log(`[DEBUG] Debate request - Input length: ${userInput.length}, Side: ${debateSide}, Round: ${debateRound}`);
    console.log(`[DEBUG] History entries: ${history ? history.length : 0}`);
    
    // Prepare arguments for Python script
    const args = [
      userInput,
      JSON.stringify(history || []),
      debateSide,
      debateRound.toString()
    ];
    
    console.log(`[DEBUG] Starting Python debate script with model deepseek-r1`);
    
    // Run the Python script with proper timeout
    const options = {
      mode: 'text',
      pythonPath: 'C:\\Users\\Akshat\\AppData\\Local\\Programs\\Python\\Python312\\python.exe',
      pythonOptions: ['-u'],
      scriptPath: path.join(__dirname, '..', 'app'),
      args: args
    };
    
    const results = await PythonShell.run('run_debate.py', options);
    
    // Combine all output lines
    const fullOutput = results.join('\n');
    console.log(`[DEBUG] Received debate response of length: ${fullOutput.length}`);
    
    // Clean the output using the same function used for TTS
    const cleanOptions = {
      mode: 'text',
      pythonPath: 'C:\\Users\\Akshat\\AppData\\Local\\Programs\\Python\\Python312\\python.exe',
      pythonOptions: ['-u'],
      scriptPath: path.join(__dirname, '..', 'app'),
      args: [fullOutput]
    };
    
    // Use the clean_text helper to extract just the response text
    const cleanResult = await PythonShell.run('clean_text_helper.py', cleanOptions);
    const cleanedResponse = cleanResult[0]; // Get just the cleaned text
    
    // Send only the cleaned response to the frontend
    res.json({ 
      response: cleanedResponse,
      fullOutput: fullOutput // Optional - remove this if you don't want to send the full output
    });
  } catch (error) {
    console.error('Error in debate response route:', error);
    res.status(500).json({ error: 'Failed to generate debate response' });
  }
});

// Generate Text-to-Speech with enhanced reliability
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    
    console.log(`[DEBUG] Processing TTS request with ${text.length} characters of text`);
    
    if (!text || !voiceId) {
      return res.status(400).json({ error: 'Text and voiceId are required' });
    }
      // Use Python script to clean the text first
    console.log(`[DEBUG] Using clean_tts.py to filter and process text`);

      const options = {
        scriptPath: path.join(__dirname, '../app'),
        pythonPath: getPythonPath(),
        pythonOptions: ['-u'],
        args: [text, voiceId, '30']  // 30s timeout within the Python script
      };
      
      // Create a temporary file path for the audio
      console.log(`[DEBUG] Starting Python TTS script for ${text.length} characters of text`);
      
      promiseWithTimeout(
        PythonShell.run('tts_enhanced.py', options),
        40000, // 40s timeout for the entire Python process
        'Python TTS process timed out'
      )
      .then((results) => {
        console.log(`[DEBUG] TTS Python script output:`, results);
        
        // Get the file path from the Python script output
        const outputPath = results && results.length > 0 ? results[results.length - 1].trim() : null;
        
        if (outputPath && fs.existsSync(outputPath)) {
          console.log(`[DEBUG] Audio file exists at ${outputPath}`);
          // Read the audio file and send as base64
          const audioBuffer = fs.readFileSync(outputPath);
          const base64Audio = audioBuffer.toString('base64');
          console.log(`[DEBUG] Audio converted to base64 (${base64Audio.length} characters)`);
          
          // Clean up the file
          fs.unlinkSync(outputPath);
          
          res.json({
            audioContent: base64Audio,
            format: 'audio/mp3',
            source: 'python-script'
          });
        } else {
          console.error(`[ERROR] Audio file not found at path: ${outputPath || 'not returned'}`);
          throw new Error('Audio file not generated or path not returned');
        }
      })
      .catch(err => {
        console.error('Python TTS error:', err);
        console.error('Error details:', err.traceback || 'No traceback');
        
        // If both direct API and Python method fail, return an error
        res.status(500).json({ 
          error: 'Failed to generate speech after multiple attempts',
          details: 'Both direct API and Python methods failed'
        });
      });
    } 
  catch (error) {
    console.error('Error in TTS route:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Enhanced server running on port ${PORT}`);
});
