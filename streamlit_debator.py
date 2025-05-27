import os
import streamlit as st
import requests

# STT, TTS imports
from app.stt_elevenlabs import transcribe_audio
from app.tts_elevenlabs import list_voices, text_to_speech

# Constants
UPLOAD_DIR = "uploads"
ELEVEN_API_KEY = "sk_58867558b9f2729bdf352667a7431a7195fff32ef7f75518"
AGENT_ID = "agent_01jw38s8c2efzth4rhmd9dfnj1"
ELEVEN_API_URL = f"https://api.elevenlabs.io/v1/convai/agents/{AGENT_ID}/simulate-conversation"

# Helper: call ElevenLabs ConvAI agent for response
def get_agent_response(first_message: str) -> str:
    headers = {
        "Xi-Api-Key": ELEVEN_API_KEY,
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
    resp = requests.post(ELEVEN_API_URL, json=payload, headers=headers)
    if not resp.ok:
        return ""
    data = resp.json()
    conv = data.get("simulated_conversation", [])
    agent_msgs = [m.get("message") for m in conv if m.get("role") == "agent"]
    return agent_msgs[-1] if agent_msgs else ""

# Ensure upload directory
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Session state defaults
def init_state():
    if 'topic' not in st.session_state:
        st.session_state.topic = ''
    if 'side' not in st.session_state:
        st.session_state.side = 'against'
    if 'voice_id' not in st.session_state:
        voices = list_voices().get('voices', [])
        default = voices[0]
        st.session_state.voice_id = default['voice_id']
        st.session_state.voice_name = default['name']

init_state()

# Sidebar settings
st.sidebar.header("Debate Settings")
st.sidebar.text_input("Topic", key='topic')
st.sidebar.radio("AI side", ['for', 'against'], key='side')
voice_map = {v['name']: v['voice_id'] for v in list_voices().get('voices', [])}
st.sidebar.selectbox("Voice", options=list(voice_map), key='voice_name', on_change=lambda: st.session_state.update({'voice_id': voice_map[st.session_state.voice_name]}))

# Main
st.title("Audio-Only Medical Debate")

if not st.session_state.topic:
    st.info("Please enter a debate topic in the sidebar to begin.")
else:
    try:
        audio_input = st.audio_input("Speak your argument", key='mic')
    except Exception:
        audio_input = st.file_uploader("Upload audio", type=['wav', 'mp3'], key='upload')

    if audio_input:
        filename = getattr(audio_input, 'name', 'input.wav')
        path = os.path.join(UPLOAD_DIR, filename)
        with open(path, 'wb') as f:
            data = audio_input.read() if hasattr(audio_input, 'read') else audio_input.getbuffer()
            f.write(data)

        user_text = transcribe_audio(path, language='en')
        if user_text:
            prompt = (
                "You are an AI system designed to be an expert debater, mimicking the personality of a sassy human. "
                "You have a wealth of knowledge about healthcare, medical, and caregiving professions. You are meticulous, "
                "highly detailed and confident in asserting your stand during conversations. Today's debate topic is: "
                "AI should be allowed to override human decisions in healthcare. You are to give an opposing motion for no less "
                "than 4 minutes (more than 500 words) after the other team (human) has given their stand (proponent view). "
                "Be firm and clear in your stand as the opposing motion. Give a detailed speech filled with examples.\n\n"
                "For each of your points:\n"
                "- State your stand clearly\n"
                "- Make specific references to the contents of your opponents' speech\n"
                "- Include explanations, analogies, and examples\n"
                "- Ask a follow-up question to challenge their view\n\n"
                "At the end, summarize your points and restate the questions.\n\n"
                f"Topic: {st.session_state.topic}\n"
                f"User says: {user_text}"
            )
            bot_text = get_agent_response(prompt)
            if bot_text:
                tts = text_to_speech(bot_text, voice_id=st.session_state.voice_id)
                if tts:
                    st.audio(tts, format='audio/mp3')

    if st.button("Replay Last AI"):
        if bot_text:
            tts = text_to_speech(bot_text, voice_id=st.session_state.voice_id)
            if tts:
                st.audio(tts, format='audio/mp3')
