// Medical Debate Arena - JavaScript Frontend
class DebateInterface {
  constructor() {
    this.selectedTopic = null;
    this.selectedStance = null;
    this.selectedVoice = 'iP95p4xoKVk53GoZ742B'; // Default male voice
    this.voices = [];
    this.chatHistory = [];
    this.isRecording = false;
    this.isSpeaking = false;
    this.isProcessing = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.audioPlayer = null;
    this.mouthState = 'M130,170 Q150,175 170,170';
    
    this.init();
  }

  async init() {
    await this.loadVoices();
    this.setupEventListeners();
    this.setupAudioPlayer();
    this.initializeAvatar();
  }

  async loadVoices() {
    try {
      const response = await fetch('/api/voices');
      if (!response.ok) throw new Error('Failed to fetch voices');
      this.voices = await response.json();
      console.log('Voices loaded:', this.voices.length);
    } catch (error) {
      console.error('Error loading voices:', error);
      this.showToast('Error loading voices', 'error');
    }
  }

  setupEventListeners() {
    // Topic selection
    document.getElementById('topicSelect').addEventListener('change', (e) => {
      this.selectedTopic = e.target.value;
      this.updateRecordingButtonState();
    });

    // Stance selection
    document.getElementById('stanceSelect').addEventListener('change', (e) => {
      this.selectedStance = e.target.value;
      this.updateRecordingButtonState();
    });

    // Recording button
    document.getElementById('recordButton').addEventListener('click', () => {
      if (!this.isRecording) {
        this.startRecording();
      } else {
        this.stopRecording();
      }
    });

    // Reset button
    document.getElementById('resetButton').addEventListener('click', () => {
      this.resetDebate();
    });
  }

  setupAudioPlayer() {
    this.audioPlayer = document.createElement('audio');
    this.audioPlayer.addEventListener('play', () => {
      this.isSpeaking = true;
      this.updateSpeakingAnimation();
      this.updateUI();
    });
    this.audioPlayer.addEventListener('ended', () => {
      this.isSpeaking = false;
      this.updateSpeakingAnimation();
      this.updateUI();
    });
  }

  updateRecordingButtonState() {
    const button = document.getElementById('recordButton');
    const canRecord = this.selectedTopic && this.selectedStance && !this.isProcessing && !this.isSpeaking;
    button.disabled = !canRecord;
  }

  async startRecording() {
    if (!this.selectedTopic || !this.selectedStance) {
      this.showToast('Please select a topic and stance first', 'error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        await this.processUserInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.updateUI();
      this.showToast('Recording started - speak your argument', 'success');
    } catch (error) {
      console.error('Error starting recording:', error);
      this.showToast('Could not access microphone', 'error');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.updateUI();
    }
  }

  async processUserInput(audioBlob) {
    try {
      this.isProcessing = true;
      this.updateUI();

      // Step 1: Transcribe audio
      const userText = await this.transcribeAudio(audioBlob);
      if (!userText) {
        throw new Error('Transcription failed');
      }

      // Add user message to history
      this.chatHistory.push({ role: 'user', text: userText });
      this.updateChatHistory();

      // Step 2: Generate AI response
      const debateRound = Math.floor(this.chatHistory.length / 2) + 1;
      const aiSide = this.selectedStance === 'for' ? 'against' : 'for';
      
      const historyPairs = [];
      for (let i = 0; i < this.chatHistory.length; i += 2) {
        if (i + 1 < this.chatHistory.length) {
          historyPairs.push([this.chatHistory[i].text, this.chatHistory[i + 1].text]);
        }
      }

      const aiResponse = await this.getDebateResponse(userText, historyPairs, aiSide, debateRound);
      
      // Add AI message to history
      this.chatHistory.push({ role: 'ai', text: aiResponse });
      this.updateChatHistory();

      // Step 3: Convert to speech and play
      const audioUrl = await this.textToSpeech(aiResponse);
      this.audioPlayer.src = audioUrl;
      await this.audioPlayer.play();

    } catch (error) {
      console.error('Error processing user input:', error);
      this.showToast('Error processing your input', 'error');
    } finally {
      this.isProcessing = false;
      this.updateUI();
    }
  }

  async transcribeAudio(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Transcription failed');
    const data = await response.json();
    return data.text;
  }

  async getDebateResponse(userInput, history, aiSide, round) {
    const response = await fetch('/api/debate-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput, history, aiSide, round }),
    });

    if (!response.ok) throw new Error('Failed to get debate response');
    const data = await response.json();
    return data.response;
  }

  async textToSpeech(text) {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId: this.selectedVoice }),
    });

    if (!response.ok) throw new Error('TTS failed');
    const data = await response.json();
    return data.audioUrl;
  }

  updateChatHistory() {
    const historyContainer = document.getElementById('chatHistory');
    historyContainer.innerHTML = '';
    
    this.chatHistory.forEach((message, index) => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${message.role}`;
      messageDiv.innerHTML = `
        <div class="message-header">${message.role === 'user' ? 'You' : 'AI Debater'}</div>
        <div class="message-text">${message.text}</div>
      `;
      historyContainer.appendChild(messageDiv);
    });
    
    historyContainer.scrollTop = historyContainer.scrollHeight;
  }

  resetDebate() {
    this.chatHistory = [];
    this.selectedTopic = null;
    this.selectedStance = null;
    document.getElementById('topicSelect').value = '';
    document.getElementById('stanceSelect').value = '';
    this.updateChatHistory();
    this.updateUI();
    this.showToast('Debate reset', 'success');
  }

  updateUI() {
    const recordButton = document.getElementById('recordButton');
    const statusText = document.getElementById('statusText');
    
    if (this.isRecording) {
      recordButton.innerHTML = '<i class="icon-stop"></i> Stop Recording';
      recordButton.className = 'record-button recording';
      statusText.textContent = 'Recording...';
    } else if (this.isProcessing) {
      recordButton.innerHTML = '<i class="icon-loading"></i> Processing...';
      recordButton.className = 'record-button processing';
      recordButton.disabled = true;
      statusText.textContent = 'Processing your input...';
    } else if (this.isSpeaking) {
      recordButton.innerHTML = '<i class="icon-mic"></i> Start Recording';
      recordButton.className = 'record-button';
      recordButton.disabled = true;
      statusText.textContent = 'AI is speaking...';
    } else {
      recordButton.innerHTML = '<i class="icon-mic"></i> Start Recording';
      recordButton.className = 'record-button';
      statusText.textContent = 'Ready to record';
    }
    
    this.updateRecordingButtonState();
  }

  initializeAvatar() {
    // Avatar mouth animation will be handled by CSS and updateSpeakingAnimation
    this.updateSpeakingAnimation();
  }

  updateSpeakingAnimation() {
    const avatarMouth = document.getElementById('avatarMouth');
    if (this.isSpeaking) {
      // Start mouth animation
      if (!this.mouthAnimation) {
        this.mouthAnimation = setInterval(() => {
          const shouldChangeMouth = Math.random() > 0.4;
          if (shouldChangeMouth) {
            this.mouthState = this.mouthState === 'M130,170 Q150,175 170,170' 
              ? 'M130,170 Q150,195 170,170' 
              : 'M130,170 Q150,175 170,170';
            avatarMouth.setAttribute('d', this.mouthState);
          }
        }, 150);
      }
    } else {
      // Stop mouth animation
      if (this.mouthAnimation) {
        clearInterval(this.mouthAnimation);
        this.mouthAnimation = null;
      }
      this.mouthState = 'M130,170 Q150,175 170,170';
      avatarMouth.setAttribute('d', this.mouthState);
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}

// Initialize the debate interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new DebateInterface();
});