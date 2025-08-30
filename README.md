# Finance Investors Dashboard �📈

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Finance-LLMs/Finance-Investors-Dashboard)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)

An interactive conversational AI platform that enables users to engage in financial consultations with AI Indian finance experts and investors. Built with ElevenLabs Conversational AI SDK, this application features multiple AI financial advisors with distinct investment philosophies and expertise areas.

 
## ✨ Features

- **Indian Finance Experts**: Engage with AI versions of renowned Indian finance personalities and investment gurus
- **Multi-Language Support**: Available in English, Hindi (हिंदी), and Tamil (தமிழ்) for broader accessibility
- **Single Interface Mode**: Clean, professional dashboard interface for financial consultations  
- **Financial Consultation**: Get personalized investment advice and financial insights
- **Real-time Voice Conversation**: Powered by ElevenLabs' advanced voice AI technology
- **Video Avatars**: High-quality video representations of each finance expert
- **Comprehensive Disclaimer**: Built-in legal compliance with SEBI regulations and educational disclaimers
- **Speaking Indicators**: Visual feedback showing when AI experts are responding
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Professional Grade**: Built for investors, financial advisors, and finance enthusiasts

## 💼 Available Finance Experts

- **SAIurabh**: Value Investor - AI version focused on value investing principles and long-term wealth creation
- **PAIrag**: Wealth Manager - Specialized in wealth management, portfolio strategies, and financial planning
- **MohnAIsh**: Investment Guru - AI representation of disciplined investment philosophy and market insights  
- **AIswath**: Valuation Expert - Expert in company valuation, financial analysis, and market fundamentals

*Each expert is available in multiple languages (English, Hindi, Tamil) and has unique conversation flows tailored to their area of expertise*

## ⚖️ Legal Compliance & Educational Use

This platform is designed with strict adherence to financial regulations and educational standards:

- **SEBI Compliance**: Clear disclaimers that the platform is not SEBI-registered and does not provide investment advice
- **Educational Purpose**: Explicitly positioned for financial literacy and educational use only
- **AI Transparency**: Users are clearly informed that they are interacting with AI representations, not actual personalities
- **Research Framework**: Developed by MIDAS Lab at IIIT Delhi for academic research in LLMs and finance
- **Professional Guidance**: Built-in recommendations to consult SEBI-registered financial advisors for actual investment decisions

## 🚀 Technology Stack

### Frontend
- **Vanilla JavaScript** with modern ES6+ features
- **Webpack** for module bundling and development server
- **CSS3** with responsive glassmorphic design patterns
- **Multi-language Support** with Unicode text rendering
- **HTML5** with semantic structure and accessibility features

### Backend
- **Node.js/Express** server for API endpoints with language routing
- **Python/FastAPI** alternative backend option
- **ElevenLabs API** integration for multi-language conversational AI
- **Environment-based Configuration** for secure API key management
- **CORS** enabled for cross-origin requests

### AI & Language Features
- **Multi-language AI Agents** for English, Hindi, and Tamil
- **Real-time Voice Processing** with ElevenLabs SDK
- **Language-specific Agent Routing** based on user selection
- **Cultural Context Awareness** in AI responses

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

# English Agents
SAURABH_AGENT_ID=saurabh_english_agent_id
PARAG_AGENT_ID=parag_english_agent_id
MOHNISH_AGENT_ID=mohnish_english_agent_id
ASWATH_AGENT_ID=aswath_english_agent_id

# Hindi Agents (हिंदी)
SAURABH_HINDI_AGENT_ID=saurabh_hindi_agent_id
PARAG_HINDI_AGENT_ID=parag_hindi_agent_id
MOHNISH_HINDI_AGENT_ID=mohnish_hindi_agent_id
ASWATH_HINDI_AGENT_ID=aswath_hindi_agent_id

# Tamil Agents (தமிழ்)
SAURABH_TAMIL_AGENT_ID=saurabh_tamil_agent_id
PARAG_TAMIL_AGENT_ID=parag_tamil_agent_id
MOHNISH_TAMIL_AGENT_ID=mohnish_tamil_agent_id
ASWATH_TAMIL_AGENT_ID=aswath_tamil_agent_id
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
2. **Select Language**: Choose from English, Hindi (हिंदी), or Tamil (தமிழ்) for your preferred conversation language
3. **Select Finance Expert**: Choose from available AI financial advisors (Saurabh, Parag, Mohnish, or Aswath)
4. **Start Consultation**: Click "Start Financial Consultation" to begin your voice conversation
5. **Financial Discussion**: Ask questions about investments, market analysis, portfolio strategies, or seek financial advice
6. **End Session**: Click "End Consultation" when finished
7. **Legal Compliance**: Review the built-in disclaimer for SEBI compliance and educational use guidelines

## 🏗️ Project Structure

```
Finance-Investors-Dashboard/
├── backend/
│   ├── server.js          # Express.js server with multi-language routing
│   └── server.py          # FastAPI alternative server
├── src/
│   ├── index.html         # Main dashboard with language selection
│   ├── app.js            # Core application logic
│   ├── styles.css        # Global styles with responsive design
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
├── dist/                 # Webpack build output
├── .env                  # Environment variables (not committed)
├── .gitignore           # Git ignore rules
├── package.json          # Node.js dependencies and scripts
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
2. Maintain responsive design principles across all screen sizes
3. Ensure multi-language support and Unicode text handling
4. Test across different browsers, devices, and language settings
5. Maintain SEBI compliance and educational disclaimers
6. Ensure API key security and never commit secrets to version control
7. Follow cultural sensitivity guidelines for multi-language content

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
