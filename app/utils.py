# app/utils.py
import base64
import streamlit as st

def get_custom_css():
    return """
    <style>
    /* Remove container box while keeping messages styled */
    #chat-container {
        border: none !important;
        background: transparent !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
    }

    /* Keep message bubbles styling */
    .message-bubble {
        margin: 0.75rem 0 !important;
        padding: 1rem !important;
        border-radius: 15px !important;
        color: #ffffff !important;
    }

    .user-bubble {
        background: #2a2a72 !important;
        border: 1px solid #3a3a8a !important;
        margin-left: 15%;
    }

    .ai-bubble {
        background: #333333 !important;
        border: 1px solid #444444 !important;
        margin-right: 15%;
    }

    /* Keep text styling */
    .message-bubble strong,
    .message-bubble p {
        color: #ffffff !important;
    }

    /* Adjust status message styling */
    .stAlert {
        background: #2a2a72 !important;
        border: 1px solid #3a3a8a !important;
        color: white !important;
        border-radius: 8px;
        margin: 1rem 0;
    }

    /* Keep audio controls styling */
    .stAudio {
        filter: invert(1);
        margin: 0.5rem 0 !important;
    }

    .stAudio time {
        color: #cccccc !important;
    }

    /* Adjust button container */
    div[data-testid="stHorizontalBlock"] {
        border-top: 2px solid #2a2a72 !important;
        padding-top: 1rem !important;
        margin-top: 1rem !important;
    }
    </style>
    """

def autoplay_audio(audio_bytes):
    audio_base64 = base64.b64encode(audio_bytes).decode()
    audio_html = f"""
        <audio autoplay style="display:none">
            <source src="data:audio/mp3;base64,{audio_base64}" type="audio/mp3">
        </audio>
    """
    st.markdown(audio_html, unsafe_allow_html=True)

def render_listening_animation():
    html = """
    <div style="text-align: center; padding: 1rem;">
        <div style="display: inline-flex; align-items: center; gap: 0.5rem; 
                    background: #e3f2fd; padding: 0.75rem 1.5rem; border-radius: 24px;
                    border: 1px solid #bbdefb;">
            <div style="display: flex; gap: 0.25rem;">
                <div style="width: 8px; height: 24px; background: #2196f3; 
                            animation: pulse 0.8s infinite alternate;"></div>
                <div style="width: 8px; height: 32px; background: #2196f3;
                            animation: pulse 0.8s infinite alternate 0.2s;"></div>
                <div style="width: 8px; height: 24px; background: #2196f3;
                            animation: pulse 0.8s infinite alternate 0.4s;"></div>
            </div>
            <span style="color: #1a237e; font-weight: 500;">Listening...</span>
        </div>
    </div>
    <style>
    @keyframes pulse {
        from { opacity: 0.4; transform: scaleY(0.8); }
        to { opacity: 1; transform: scaleY(1); }
    }
    </style>
    """
    st.markdown(html, unsafe_allow_html=True)

def render_message_bubbles(chat_history):
    for msg in chat_history:
        bubble_class = "user-bubble" if msg["role"] == "user" else "ai-bubble"
        speaker = "You" if msg["role"] == "user" else "AI"
        
        html = f"""
        <div class="message-bubble {bubble_class}">
            <strong>{speaker}</strong>
            <p>{msg['text']}</p>
        </div>
        """
        st.markdown(html, unsafe_allow_html=True)