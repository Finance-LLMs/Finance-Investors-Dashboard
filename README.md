# AI Debate Bot 🤖💬

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Finance-LLMs/AI-debate-bot)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)

An interactive conversational AI platform that enables users to engage in intelligent debates and Q&A sessions with various AI personas. Built with ElevenLabs Conversational AI SDK, this application features multiple AI debaters with distinct personalities and expertise areas.

## ✨ Features

- **Multiple AI Personas**: Choose from different AI debaters, each with unique personalities and expertise
- **Dual Interface Modes**: 
  - **Avatar Mode**: Visual interface with animated avatars
  - **Controls Mode**: Clean, text-based interface for focused conversations
- **Debate & Q&A Modes**: Switch between structured debates and casual question-answer sessions
- **Real-time Voice Conversation**: Powered by ElevenLabs' advanced voice AI technology
- **Responsive Design**: Modern, glassmorphic UI that works across devices
- **Professional Grade**: Built for educational, research, and professional use cases

## 🎭 Available AI Personas

- **Michelle (Barbarella)**: Singaporean model character
- **Nelson Mandela**: Anti-apartheid leader persona with separate Q&A and debate modes
- **Taylor Swift**: Pop icon personality

## 🚀 Technology Stack

### Frontend
- **Vanilla JavaScript** with modern ES6+ features
- **Webpack** for module bundling and development server
- **CSS3** with glassmorphic design patterns
- **Responsive HTML5** structure

### Backend
- **Node.js/Express** server for API endpoints
- **Python/FastAPI** alternative backend option
- **ElevenLabs API** integration for conversational AI
- **CORS** enabled for cross-origin requests

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (version 18 or higher)
- **Python** (version 3.8 or higher)
- **ElevenLabs API Key** - [Get your key here](https://elevenlabs.io/)
- **Git** for cloning the repository

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Finance-LLMs/AI-debate-bot.git
cd AI-debate-bot
```

### 2. Environment Configuration
Create a `.env` file in the root directory and configure your API keys:

```bash
# Windows
notepad .env

# Linux/macOS
vim .env
```

Add the following environment variables:
```env
XI_API_KEY=your_elevenlabs_api_key_here
AGENT_ID=your_default_agent_id
MICHELLE_AGENT_ID=michelle_agent_id
NELSON_AGENT_ID=nelson_debate_agent_id
NELSON_QA_AGENT_ID=nelson_qa_agent_id
TAYLOR_AGENT_ID=taylor_agent_id
```

### 3. Install Dependencies

**Frontend Dependencies:**
```bash
npm install
```

**Backend Dependencies (Python):**
```bash
pip install -r requirements.txt
```

### 4. Build and Run

**Option A: Node.js Backend (Recommended)**
```bash
npm start
```

**Option B: Python FastAPI Backend**
```bash
npm run start:python
```

**Option C: Development Mode with Hot Reload**
```bash
npm run dev
```

### 5. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## 🎯 Usage Guide

1. **Choose Your Interface**: Select between Avatar mode (visual) or Controls mode (text-based)
2. **Select AI Persona**: Pick from available AI debaters based on your topic
3. **Choose Mode**: Select either Debate mode for structured arguments or Q&A for casual conversation
4. **Start Conversing**: Click to begin your voice conversation with the AI

## 🏗️ Project Structure

```
AI-debate-bot/
├── backend/
│   ├── server.js          # Express.js server
│   └── server.py          # FastAPI alternative server
├── src/
│   ├── index.html         # Main landing page
│   ├── avatar.html        # Avatar interface
│   ├── controls.html      # Controls interface
│   ├── app.js            # Core application logic
│   ├── avatar.js         # Avatar mode functionality
│   ├── controls.js       # Controls mode functionality
│   ├── styles.css        # Global styles
│   ├── avatar.css        # Avatar mode styles
│   ├── controls.css      # Controls mode styles
│   └── images/           # Avatar images and assets
├── package.json          # Node.js dependencies
├── requirements.txt      # Python dependencies
├── webpack.config.js     # Webpack configuration
└── README.md            # This file
```

## 🔧 Development

### Available Scripts

- `npm start` - Build and run production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:backend` - Start only the Node.js backend
- `npm run start:python` - Start with Python FastAPI backend

### Development Guidelines

1. Follow modern JavaScript ES6+ standards
2. Maintain responsive design principles
3. Test across different browsers and devices
4. Ensure API key security and never commit secrets

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Finance-LLMs/AI-debate-bot/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- **ElevenLabs** for providing the Conversational AI SDK
- **Finance-LLMs** organization for project maintenance
- All contributors who have helped improve this project

---

**Built with ❤️ by the Finance-LLMs team**
