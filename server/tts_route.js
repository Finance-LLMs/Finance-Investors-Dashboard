// Generate Text-to-Speech with clean text processing
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    
    console.log(`[DEBUG] Processing TTS request with ${text.length} characters of text`);
    
    if (!text || !voiceId) {
      return res.status(400).json({ error: 'Text and voiceId are required' });
    }
    
    // Use Python script to clean the text and process TTS
    console.log(`[DEBUG] Using clean_tts.py to filter and process text`);
    const options = {
      scriptPath: path.join(__dirname, '../app'),
      pythonPath: 'C:\\Users\\Akshat\\AppData\\Local\\Programs\\Python\\Python312\\python.exe',
      pythonOptions: ['-u'],
      args: [text, voiceId]
    };
    
    try {
      console.log(`[DEBUG] Starting clean_tts.py for ${text.length} characters of text`);
      const results = await PythonShell.run('clean_tts.py', options);
      
      console.log(`[DEBUG] Clean TTS script output:`, results);
      
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
        
        return res.json({
          audioContent: base64Audio,
          format: 'audio/mp3'
        });
      } else {
        console.error(`[ERROR] Audio file not found at path: ${outputPath || 'not returned'}`);
        throw new Error('Audio file not generated or path not returned');
      }
    } catch (ttsErr) {
      console.error('Clean TTS error:', ttsErr);
      
      // If the error was because of a Python exception, try direct API call with basic cleaning
      try {
        console.log(`[DEBUG] Falling back to direct API call with basic text cleaning`);
        
        // Basic cleaning on the client-side - remove <think> tags and system messages
        const cleanedText = text
          .replace(/<think>[\s\S]*?<\/think>/g, '') // Remove thinking blocks
          .replace(/Vector database loaded successfully![\s\S]*?Generated response of length: \d+/g, '') // Remove system messages
          .trim();
        
        console.log(`[DEBUG] Text length after basic cleaning: ${cleanedText.length}`);
        
        const response = await axios.post(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            text: cleanedText,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          },
          {
            headers: {
              'xi-api-key': ELEVENLABS_API_KEY,
              'Content-Type': 'application/json',
              'Accept': 'audio/mpeg'
            },
            responseType: 'arraybuffer',
            timeout: 30000 // 30s timeout
          }
        );
        
        console.log(`[DEBUG] Direct API call successful, received ${response.data.length} bytes`);
        const audioBase64 = Buffer.from(response.data).toString('base64');
        
        return res.json({
          audioContent: audioBase64,
          format: 'audio/mpeg'
        });
      } catch (directApiErr) {
        console.error('Direct API TTS error:', directApiErr);
        res.status(500).json({ error: 'Failed to generate speech after multiple attempts' });
      }
    }
  } catch (error) {
    console.error('Error in TTS route:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});
