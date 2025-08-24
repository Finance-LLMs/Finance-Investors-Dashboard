# Finance Investors Dashboard �📈

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Finance-LLMs/Finance-Investors-Dashboard)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)

An interactive conversational AI platform that enables users to engage in financial consultations with AI Indian finance experts and investors. Built with ElevenLabs Conversational AI SDK, this application features multiple AI financial advisors with distinct investment philosophies and expertise areas.

## ✨ Features

- **Indian Finance Experts**: Engage with AI versions of renowned Indian finance personalities and investment gurus
- **Single Interface Mode**: Clean, professional dashboard interface for financial consultations  
- **Financial Consultation**: Get personalized investment advice and financial insights
- **Real-time Voice Conversation**: Powered by ElevenLabs' advanced voice AI technology
- **Video Avatars**: High-quality video representations of each finance expert
- **Animated Money Rain**: Immersive visual experience with Indian-themed money animations
- **Indian Tricolor Theme**: Glassmorphic UI with Indian flag-inspired gradient backgrounds
- **Speaking Indicators**: Visual feedback showing when AI experts are responding
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Professional Grade**: Built for investors, financial advisors, and finance enthusiasts

## 💼 Available Finance Experts

- **SAIurabh**: Value Investor - AI version focused on value investing principles and long-term wealth creation
- **PAIrag**: Wealth Manager - Specialized in wealth management, portfolio strategies, and financial planning
- **MohnAIsh**: Investment Guru - AI representation of disciplined investment philosophy and market insights  
- **AIswath**: Valuation Expert - Expert in company valuation, financial analysis, and market fundamentals

*Each expert has unique conversation flows and can provide specialized advice in their area of expertise*

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
git clone https://github.com/Finance-LLMs/Finance-Investors-Dashboard.git
cd Finance-Investors-Dashboard
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
SAURABH_AGENT_ID=saurabh_agent_id
PARAG_AGENT_ID=parag_agent_id
MOHNISH_AGENT_ID=mohnish_agent_id
ASWATH_AGENT_ID=aswath_agent_id
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

1. **Access the Dashboard**: Open the application to see the Indian Finance Investors Dashboard
2. **Select Finance Expert**: Choose from available AI financial advisors (Saurabh, Parag, Mohnish, or Aswath)
3. **Start Consultation**: Click "Start Financial Consultation" to begin your voice conversation
4. **Financial Discussion**: Ask questions about investments, market analysis, portfolio strategies, or seek financial advice
5. **End Session**: Click "End Consultation" when finished

## 🏗️ Project Structure

```
Finance-Investors-Dashboard/
├── backend/
│   ├── server.js          # Express.js server with finance expert routing
│   └── server.py          # FastAPI alternative server
├── src/
│   ├── index.html         # Main dashboard interface
│   ├── app.js            # Core application logic
│   ├── styles.css        # Global styles with Indian theme
│   ├── images/           # Finance expert avatars and assets
│   │   ├── saurabh.png   # SAIurabh avatar
│   │   ├── parag.png     # PAIrag avatar  
│   │   ├── mohnish.png   # MohnAIsh avatar
│   │   ├── aswath.png    # AIswath avatar
│   │   └── finance/      # Financial themed assets
│   └── videos/           # Expert video avatars
│       ├── saurabh.mp4   # SAIurabh video
│       ├── parag.mp4     # PAIrag video
│       ├── mohnish.mp4   # MohnAIsh video
│       └── aswath.mp4    # AIswath video
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

1. Check the [Issues](https://github.com/Finance-LLMs/Finance-Investors-Dashboard/issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**Built with ❤️ by the Finance-LLMs team for the Indian Finance Community**