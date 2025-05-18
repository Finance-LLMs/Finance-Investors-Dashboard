
import streamlit as st
import time

# Configure the page
st.set_page_config(
    page_title="AI Debator",
    page_icon="🦦",
    layout="wide"
)

# Custom CSS for styling
st.markdown("""
<style>
    .main-container {
        background-color: #fdf4eb;
        padding: 20px;
        border-radius: 10px;
    }
    .debate-card {
        background-color: #e67e55;
        padding: 20px;
        border-radius: 15px;
        color: white;
    }
    .otter-container {
        background-color: #f8d8b9;
        border-radius: 15px;
        padding: 10px;
        display: flex;
        justify-content: center;
        min-height: 350px;
    }
    .debate-text {
        background-color: white;
        border-radius: 10px;
        padding: 15px;
        min-height: 100px;
        color: #3a3a3a;
    }
    .button-primary {
        background-color: #2d3748;
        color: white;
        padding: 10px 20px;
        border-radius: 30px;
        border: none;
        text-align: center;
        cursor: pointer;
    }
    /* Note: Animations would need to be implemented with JavaScript in Streamlit components */
</style>
""", unsafe_allow_html=True)

# App title
st.title("AI Debator")
st.subheader("Engage in a formal debate with an AI otter")

# Define debate topics and stance options
debate_topics = [
    "Allowing AI to override human decisions",
    "Universal Basic Income is necessary",
    "Social media does more harm than good",
    "Remote work should be the new normal",
    "Climate action should take priority over economic growth"
]

stance_options = ["For the motion", "Against the motion"]

# Create two columns for the layout
col1, col2 = st.columns([3, 2])

# Main debate interface column
with col1:
    st.markdown('<div class="debate-card">', unsafe_allow_html=True)
    
    # Select topic and stance
    selected_topic = st.selectbox("Debate Topic", debate_topics)
    selected_stance = st.selectbox("Your Stance", stance_options)
    
    # Debate text area
    st.markdown('<div class="debate-text" id="debate-text">', unsafe_allow_html=True)
    debate_text = st.empty()
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Start speaking button
    if st.button("Start Speaking", key="start_speaking"):
        is_speaking = True
        
        # Generate debate text based on topic and stance
        full_text = f"As a debater {'for' if 'For' in selected_stance else 'against'} the motion that '{selected_topic}', "
        full_text += "I would like to present several key points. "
        
        if "For" in selected_stance:
            full_text += "First, this position leads to more efficient outcomes. Second, there are numerous examples of success when implementing this approach. Third, the ethical considerations strongly favor this stance. In conclusion, the evidence clearly supports being for this motion."
        else:
            full_text += "First, this position presents significant risks we cannot ignore. Second, historical precedent shows the dangers of this approach. Third, there are better alternatives we should consider. To conclude, I firmly believe we should stand against this motion."
        
        # Animate text appearance
        displayed_text = ""
        for char in full_text:
            displayed_text += char
            debate_text.markdown(displayed_text)
            time.sleep(0.03)
        
        is_speaking = False
        
    st.markdown('</div>', unsafe_allow_html=True)

# Otter column
with col2:
    st.markdown('<div class="otter-container">', unsafe_allow_html=True)
    
    # Note: In Streamlit, we would need to use HTML/CSS/JS for the animated otter
    # This is a simplified representation
    st.markdown("""
    <div style="display: flex; justify-content: center; align-items: center; height: 300px;">
        <svg width="200" height="300" viewBox="0 0 300 400">
            <!-- SVG code for the otter would go here -->
            <!-- In a full implementation, this would be replaced with a custom Streamlit component -->
            <text x="150" y="200" text-anchor="middle" fill="#333">
                [Animated Otter Visualization]
            </text>
            <text x="150" y="220" text-anchor="middle" fill="#333" font-size="12">
                (Custom Component Required)
            </text>
        </svg>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)
    
# Note: For a full implementation, a custom Streamlit component would be needed for the animated otter
# This would require JavaScript for the animations and would be more complex
st.markdown("""
### Note about the Streamlit conversion:
For a complete implementation with an animated otter in Streamlit, you would need to create a custom Streamlit component using HTML, CSS, and JavaScript. The animation of the otter's mouth would be handled in JavaScript, similar to how it's done in the React version but adapted for Streamlit's component system.
""")
