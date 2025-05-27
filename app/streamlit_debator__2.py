import os
# import streamlit as st
import requests

# STT, TTS imports
# from app.stt_elevenlabs import transcribe_audio
# from app.tts_elevenlabs import list_voices, text_to_speech

# Constants
UPLOAD_DIR = "uploads"
ELEVEN_API_KEY = "sk_a649a82e1aea55930753e9171ca5a3ad17f7aa1b55afe493"
AGENT_ID = "agent_01jvyxr1wkft5bddtqqrwaqkn5"
ELEVEN_API_URL = f"https://api.elevenlabs.io/v1/convai/agents/{AGENT_ID}/simulate-conversation"

# Ensure upload directory
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Helper: call ElevenLabs ConvAI agent for response
def get_agent_response(first_message: str) -> str:
    print("Sending to Agent...")
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

    data = resp.json()
    conv = data.get("simulated_conversation", [])
    agent_msgs = [m.get("message") for m in conv if m.get("role") == "agent"]
    response = agent_msgs[-1] if agent_msgs else ""
    print(f"Agent Response: {response}")
    return response

# # Play temporary audio response
# def play_thinking_message():
#     thinking_text = "Good points. Please wait a moment while I think of a response."
#     print(f"Temp Message: {thinking_text}")
#     tts = text_to_speech(thinking_text, voice_id=st.session_state.voice_id)
#     if tts:
#         st.audio(tts, format='audio/mp3')
#         print("Playing thinking audio...")

# # Session state defaults
# if 'chat_history' not in st.session_state:
#     st.session_state.chat_history = []
# if 'topic' not in st.session_state:
#     st.session_state.topic = ''
# if 'side' not in st.session_state:
#     st.session_state.side = 'against'
# if 'voice_id' not in st.session_state:
#     voices = list_voices().get('voices', [])
#     default = voices[0]
#     st.session_state.voice_id = default['voice_id']
#     st.session_state.voice_name = default['name']

# # Sidebar: settings & history
# st.sidebar.header("Debate Settings")
# st.sidebar.text_input("Topic", key='topic')
# st.sidebar.radio("AI side", ['for', 'against'], key='side')
# voice_map = {v['name']: v['voice_id'] for v in list_voices().get('voices', [])}
# st.sidebar.selectbox(
#     "Voice", options=list(voice_map), key='voice_name',
#     on_change=lambda: st.session_state.update({'voice_id': voice_map[st.session_state.voice_name]})
# )

# st.sidebar.header("Chat History")
# for msg in st.session_state.chat_history:
#     st.sidebar.markdown(f"**{msg['role'].capitalize()}:** {msg['text']}")
# if st.sidebar.button("Clear History"):
#     st.session_state.chat_history = []

# # Main UI
# st.title("Medical Voice Debate")
# if not st.session_state.topic:
#     st.info("Please enter a debate topic in the sidebar to begin.")
# else:
#     st.header(f"Topic: {st.session_state.topic}")
#     st.subheader(f"AI argues {st.session_state.side.capitalize()}")

#     # Display prior messages
#     for msg in st.session_state.chat_history:
#         with st.chat_message(msg['role']):
#             st.write(msg['text'])

#     st.markdown("---")
#     # Capture audio (mic or upload)
#     try:
#         audio_input = st.audio_input("Your argument", key='mic')
#     except Exception:
#         audio_input = st.file_uploader("Upload audio (wav/mp3)", type=['wav','mp3'], key='upload')

#     if audio_input:
#         print("GOT Audio")
#         # Save file
#         filename = getattr(audio_input, 'name', 'input.wav')
#         path = os.path.join(UPLOAD_DIR, filename)
#         with open(path, 'wb') as f:
#             data = audio_input.read() if hasattr(audio_input, 'read') else audio_input.getbuffer()
#             f.write(data)

#         # Transcribe
#         user_text = transcribe_audio(path, language='en')
#         print(f"GOT Text: {user_text}")
#         st.session_state.chat_history.append({'role': 'user', 'text': user_text})

#         # Play thinking message
#         play_thinking_message()

#         # Get AI response
#         # prompt = f"User says: {user_text}, Based on the user's response what can you say {st.session_state.side.capitalize()} the motion on the topic: {st.session_state.topic}, "
#         prompt = f"You are an AI assistant participating in a debate about {st.session_state.topic}. You are on the {st.session_state.side} side of the motion. Respond to the user's statements with well-reasoned arguments that support your position."
#         print(f"User Text Input: {user_text}")
#         bot_text = get_agent_response(prompt)
#         if bot_text:
#             st.session_state.chat_history.append({'role': 'bot', 'text': bot_text})
#             # TTS
#             tts = text_to_speech(bot_text, voice_id=st.session_state.voice_id)
#             if tts:
#                 st.audio(tts, format='audio/mp3')
#                 print("Playing AI Audio Response")

#     # Replay last AI button
#     if st.button("Replay Last AI"):
#         # find last bot message
#         last_bot = next((m for m in reversed(st.session_state.chat_history) if m['role']=='bot'), None)
#         if last_bot:
#             tts = text_to_speech(last_bot['text'], voice_id=st.session_state.voice_id)
#             if tts:
#                 st.audio(tts, format='audio/mp3')
#                 print("Replaying AI Audio")
