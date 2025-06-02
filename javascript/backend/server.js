const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use("/static", express.static(path.join(__dirname, "../dist")));

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

// Constants
const ELEVENLABS_API_KEY = process.env.XI_API_KEY;
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api';

// ElevenLabs voices endpoint
app.get('/api/voices', async (req, res) => {
  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });
    res.json(response.data.voices);
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({ error: 'Failed to fetch voices' });
  }
});

// Transcription endpoint
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });
    formData.append('model', 'whisper-1');

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ text: response.data.text });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

// Debate response endpoint
app.post('/api/debate-response', async (req, res) => {
  try {
    const { userInput, history, aiSide, round } = req.body;
    
    // Try ElevenLabs first, fallback to Ollama
    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${process.env.AGENT_ID}`,
        {
          method: "GET",
          headers: {
            "xi-api-key": process.env.XI_API_KEY,
          },
        }
      );
      
      // Use ElevenLabs response logic here
      res.json({ response: "ElevenLabs debate response" });
    } catch (elevenLabsError) {
      // Fallback to Ollama
      const prompt = `You are participating in a formal medical debate. You are arguing ${aiSide} the motion.
      
Current round: ${round}
User's argument (${aiSide === 'for' ? 'against' : 'for'}): ${userInput}

Previous exchanges:
${history.map(([user, ai], i) => `Round ${i + 1}:\nHuman: ${user}\nAI: ${ai}`).join('\n\n')}

Provide a strong, evidence-based counter-argument in 2-3 sentences. Be professional and medical in tone.`;

      const ollamaResponse = await axios.post(`${OLLAMA_API_URL}/generate`, {
        model: 'llama3.2',
        prompt: prompt,
        stream: false,
      });

      res.json({ response: ollamaResponse.data.response });
    }
  } catch (error) {
    console.error('Error generating debate response:', error);
    res.status(500).json({ error: 'Failed to generate debate response' });
  }
});

// Text-to-speech endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    
    if (!text || !voiceId) {
      return res.status(400).json({ error: 'Text and voiceId are required' });
    }

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        responseType: 'arraybuffer',
      }
    );

    const audioBuffer = Buffer.from(response.data);
    const base64Audio = audioBuffer.toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    res.json({ audioUrl });
  } catch (error) {
    console.error('Error generating TTS:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

app.get("/api/signed-url", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${process.env.AGENT_ID}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": process.env.XI_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get signed URL");
    }

    const data = await response.json();
    res.json({ signedUrl: data.signed_url });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get signed URL" });
  }
});

//API route for getting Agent ID, used for public agents
app.get("/api/getAgentId", (req, res) => {
  const agentId = process.env.AGENT_ID;
  res.json({
    agentId: `${agentId}`,
  });
});

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}: http://localhost:${PORT}`);
});
