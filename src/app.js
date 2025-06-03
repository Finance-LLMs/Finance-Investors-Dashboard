// --- src/app.js ---
import { Conversation } from '@11labs/client';

let conversation = null;
let mouthAnimationInterval = null;
let currentMouthState = 'M130,170 Q150,175 170,170'; // closed mouth

// Create the animated doctor avatar SVG
function createAvatarSVG() {
    return `
        <svg viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg" class="avatar-svg doctor-avatar">
            <!-- Body/torso - T-shirt under coat -->
            <path d="M110,220 Q150,200 190,220 L190,350 L110,350 Z" fill="#3B82F6" />
            
            <!-- Doctor's white coat -->
            <path d="M100,220 Q150,195 200,220 L200,360 L100,360 Z" fill="white" stroke="#E5E7EB" />
            <path d="M100,220 L200,220" stroke="#E5E7EB" stroke-width="1" />
            
            <!-- Coat lapels -->
            <path d="M135,220 L130,260 L150,230 L170,260 L165,220" fill="#F9FAFB" />
            
            <!-- Coat buttons -->
            <circle cx="150" cy="270" r="3" fill="#D1D5DB" />
            <circle cx="150" cy="300" r="3" fill="#D1D5DB" />
            <circle cx="150" cy="330" r="3" fill="#D1D5DB" />
            
            <!-- Coat pockets -->
            <path d="M115,290 L135,290 L135,320 L115,320 Z" stroke="#E5E7EB" />
            <path d="M165,290 L185,290 L185,320 L165,320 Z" stroke="#E5E7EB" />
            
            <!-- Arms -->
            <path d="M110,220 Q90,240 85,280 Q84,300 90,320" stroke="#E8C4A2" stroke-width="16" stroke-linecap="round" />
            <path d="M190,220 Q210,240 215,280 Q216,300 210,320" stroke="#E8C4A2" stroke-width="16" stroke-linecap="round" />
            
            <!-- White coat sleeves -->
            <path d="M110,220 Q90,240 85,280 Q84,300 90,320" stroke="white" stroke-width="20" stroke-linecap="round" opacity="0.9" />
            <path d="M190,220 Q210,240 215,280 Q216,300 210,320" stroke="white" stroke-width="20" stroke-linecap="round" opacity="0.9" />
            
            <!-- Hands -->
            <ellipse cx="90" cy="320" rx="10" ry="12" fill="#E8C4A2" />
            <ellipse cx="210" cy="320" rx="10" ry="12" fill="#E8C4A2" />
            
            <!-- Neck -->
            <path d="M135,190 Q150,195 165,190 L165,220 L135,220 Z" fill="#E8C4A2" />
            
            <!-- Head shape -->
            <ellipse cx="150" cy="140" rx="55" ry="65" fill="#E8C4A2" />
            
            <!-- Eyebrows -->
            <path d="M115,115 Q130,110 140,115" stroke="#3F2305" stroke-width="2.5" fill="none" />
            <path d="M160,115 Q170,110 185,115" stroke="#3F2305" stroke-width="2.5" fill="none" />
            
            <!-- Eyes -->
            <path d="M115,130 Q125,125 135,130 Q125,135 115,130 Z" fill="white" />
            <path d="M165,130 Q175,125 185,130 Q175,135 165,130 Z" fill="white" />
            
            <!-- Pupils -->
            <circle cx="125" cy="130" r="3.5" fill="#594A3C" />
            <circle cx="175" cy="130" r="3.5" fill="#594A3C" />
            
            <!-- Eye highlights -->
            <circle cx="123" cy="128" r="1" fill="white" />
            <circle cx="173" cy="128" r="1" fill="white" />
            
            <!-- Lower eyelids -->
            <path d="M118,133 Q125,135 132,133" stroke="#E5A282" stroke-width="1" opacity="0.5" />
            <path d="M168,133 Q175,135 182,133" stroke="#E5A282" stroke-width="1" opacity="0.5" />
            
            <!-- Mouth -->
            <path 
                id="avatarMouth"
                d="${currentMouthState}"
                stroke="#C27D7D" 
                stroke-width="1.5" 
                fill="none"
            />
            
            <!-- Cheek shading -->
            <path d="M120,150 Q130,160 120,165" stroke="#D4B08C" stroke-width="3" opacity="0.2" />
            <path d="M180,150 Q170,160 180,165" stroke="#D4B08C" stroke-width="3" opacity="0.2" />
            
            <!-- Square glasses -->
            <path d="M105,130 L135,130 L135,145 L105,145 Z" fill="none" stroke="#31363F" stroke-width="2" />
            <path d="M165,130 L195,130 L195,145 L165,145 Z" fill="none" stroke="#31363F" stroke-width="2" />
            <path d="M135,137 L165,137" stroke="#31363F" stroke-width="2" />
            <path d="M105,130 L95,125" stroke="#31363F" stroke-width="2" />
            <path d="M195,130 L205,125" stroke="#31363F" stroke-width="2" />
            
            <!-- Ears -->
            <path d="M90,135 Q85,145 90,155 Q100,160 105,155 L102,135 Z" fill="#E8C4A2" />
            <path d="M95,140 Q93,145 95,150" stroke="#D4B08C" stroke-width="1" opacity="0.6" />
            <path d="M210,135 Q215,145 210,155 Q200,160 195,155 L198,135 Z" fill="#E8C4A2" />
            <path d="M205,140 Q207,145 205,150" stroke="#D4B08C" stroke-width="1" opacity="0.6" />
        </svg>
    `;
}

// Create celebrity avatar with image
function createCelebrityAvatar(opponent) {
    const imageMap = {
        'michelle': 'michelle.jpg',
        'nelson': 'nelson.jpg', 
        'taylor': 'taylor.jpg'
    };
    
    const imageSrc = imageMap[opponent];
    if (!imageSrc) return createAvatarSVG(); // fallback to doctor avatar
    
    return `
        <div class="celebrity-avatar-container">
            <img 
                src="/static/images/${imageSrc}" 
                alt="${opponent} avatar" 
                class="celebrity-image"
                onerror="this.style.display='none'; this.nextSibling.style.display='block';"
            />
            <div class="fallback-avatar" style="display: none;">
                ${createAvatarSVG()}
            </div>
            <div class="speaking-indicator" id="speakingIndicator">
                <div class="speaking-wave"></div>
                <div class="speaking-wave"></div>
                <div class="speaking-wave"></div>
            </div>
        </div>
    `;
}

// Initialize avatar
function initializeAvatar() {
    const avatarWrapper = document.getElementById('animatedAvatar');
    const opponentSelect = document.getElementById('opponent');
    
    if (avatarWrapper) {
        const selectedOpponent = opponentSelect ? opponentSelect.value : '';
        
        if (selectedOpponent) {
            avatarWrapper.innerHTML = createCelebrityAvatar(selectedOpponent);
        } else {
            avatarWrapper.innerHTML = createAvatarSVG();
        }
    }
}

// Animate mouth when speaking
function startMouthAnimation() {
    if (mouthAnimationInterval) return; // Already animating
    
    const avatarWrapper = document.getElementById('animatedAvatar');
    if (avatarWrapper) {
        avatarWrapper.classList.add('avatar-speaking');
        
        // If it's a celebrity avatar, show the speaking indicator
        const speakingIndicator = document.getElementById('speakingIndicator');
        if (speakingIndicator) {
            speakingIndicator.style.display = 'flex';
        }
    }
    
    mouthAnimationInterval = setInterval(() => {
        const mouthElement = document.getElementById('avatarMouth');
        if (mouthElement) {
            // Random probability to change mouth state - creates natural speaking pattern
            const shouldChangeMouth = Math.random() > 0.4; // 60% chance to change
            
            if (shouldChangeMouth) {
                currentMouthState = currentMouthState === 'M130,170 Q150,175 170,170' 
                    ? 'M130,170 Q150,195 170,170' // open mouth (oval)
                    : 'M130,170 Q150,175 170,170'; // closed mouth
                
                mouthElement.setAttribute('d', currentMouthState);
                mouthElement.setAttribute('fill', currentMouthState.includes('195') ? '#8B4513' : 'none');
                mouthElement.setAttribute('opacity', currentMouthState.includes('195') ? '0.7' : '1');
            }
        }
    }, Math.random() * 200 + 100); // Variable timing 100-300ms
}

// Stop mouth animation
function stopMouthAnimation() {
    if (mouthAnimationInterval) {
        clearInterval(mouthAnimationInterval);
        mouthAnimationInterval = null;
    }
    
    const avatarWrapper = document.getElementById('animatedAvatar');
    if (avatarWrapper) {
        avatarWrapper.classList.remove('avatar-speaking');
        
        // Hide speaking indicator for celebrity avatars
        const speakingIndicator = document.getElementById('speakingIndicator');
        if (speakingIndicator) {
            speakingIndicator.style.display = 'none';
        }
    }
    
    // Reset mouth to closed state
    currentMouthState = 'M130,170 Q150,175 170,170';
    const mouthElement = document.getElementById('avatarMouth');
    if (mouthElement) {
        mouthElement.setAttribute('d', currentMouthState);
        mouthElement.setAttribute('fill', 'none');
        mouthElement.setAttribute('opacity', '1');
    }
}

async function requestMicrophonePermission() {
    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        return true;
    } catch (error) {
        console.error('Microphone permission denied:', error);
        return false;
    }
}

async function getSignedUrl(opponent) {
    try {
        const url = opponent ? `/api/signed-url?opponent=${opponent}` : '/api/signed-url';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to get signed URL');
        const data = await response.json();
        return data.signedUrl;
    } catch (error) {
        console.error('Error getting signed URL:', error);
        throw error;
    }
}

async function getAgentId() {
    const response = await fetch('/api/getAgentId');
    const { agentId } = await response.json();
    return agentId;
}

function updateStatus(isConnected) {
    const statusElement = document.getElementById('connectionStatus');
    statusElement.textContent = isConnected ? 'Connected' : 'Disconnected';
    statusElement.classList.toggle('connected', isConnected);
}

function updateSpeakingStatus(mode) {
    const statusElement = document.getElementById('speakingStatus');
    // Update based on the exact mode string we receive
    const isSpeaking = mode.mode === 'speaking';
    statusElement.textContent = isSpeaking ? 'Agent Speaking' : 'Agent Silent';
    statusElement.classList.toggle('speaking', isSpeaking);
    
    // Animate avatar based on speaking state
    if (isSpeaking) {
        startMouthAnimation();
    } else {
        stopMouthAnimation();
    }
    
    console.log('Speaking status updated:', { mode, isSpeaking }); // Debug log
}

// Function to disable/enable form controls
function setFormControlsState(disabled) {
    const topicSelect = document.getElementById('topic');
    const stanceSelect = document.getElementById('stance');
    const opponentSelect = document.getElementById('opponent');
    
    topicSelect.disabled = disabled;
    stanceSelect.disabled = disabled;
    opponentSelect.disabled = disabled;
}

async function startConversation() {
    const startButton = document.getElementById('startButton');
    const endButton = document.getElementById('endButton');
    
    try {
        // Disable start button immediately to prevent multiple clicks
        startButton.disabled = true;
        
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
            alert('Microphone permission is required for the conversation.');
            startButton.disabled = false;
            return;
        }
        
        // Get selected opponent
        const selectedOpponent = document.getElementById('opponent').value;
        
        const signedUrl = await getSignedUrl(selectedOpponent);
        //const agentId = await getAgentId(); // You can switch to agentID for public agents
        
        // Get user stance and calculate opposite AI stance
        const userStance = document.getElementById('stance').value;
        const aiStance = userStance === 'for' ? 'against' : 'for';
        
        // Get the actual topic text instead of the value
        const topicSelect = document.getElementById('topic');
        const topicText = topicSelect.options[topicSelect.selectedIndex].text;
        
        conversation = await Conversation.startSession({
            signedUrl: signedUrl,
            //agentId: agentId, // You can switch to agentID for public agents
            dynamicVariables: {
                topic: topicText,
                user_stance: userStance,
                ai_stance: aiStance
            },
            onConnect: () => {
                console.log('Connected');
                updateStatus(true);
                setFormControlsState(true); // Disable form controls
                startButton.style.display = 'none';
                endButton.disabled = false;
                endButton.style.display = 'flex';
            },            
            onDisconnect: () => {
                console.log('Disconnected');
                updateStatus(false);
                setFormControlsState(false); // Re-enable form controls
                startButton.disabled = false;
                startButton.style.display = 'flex';
                endButton.disabled = true;
                endButton.style.display = 'none';
                updateSpeakingStatus({ mode: 'listening' }); // Reset to listening mode on disconnect
                stopMouthAnimation(); // Ensure avatar animation stops
            },
            onError: (error) => {
                console.error('Conversation error:', error);
                setFormControlsState(false); // Re-enable form controls on error
                startButton.disabled = false;
                startButton.style.display = 'flex';
                endButton.disabled = true;
                endButton.style.display = 'none';
                alert('An error occurred during the conversation.');
            },
            onModeChange: (mode) => {
                console.log('Mode changed:', mode); // Debug log to see exact mode object
                updateSpeakingStatus(mode);
            }
        });
    } catch (error) {
        console.error('Error starting conversation:', error);
        setFormControlsState(false); // Re-enable form controls on error
        startButton.disabled = false;
        alert('Failed to start conversation. Please try again.');
    }
}

async function endConversation() {
    if (conversation) {
        await conversation.endSession();
        conversation = null;
    }
}

document.getElementById('startButton').addEventListener('click', startConversation);
document.getElementById('endButton').addEventListener('click', endConversation);

// Initialize avatar when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeAvatar();
    
    // Enable start button when all three fields are selected
    const topicSelect = document.getElementById('topic');
    const stanceSelect = document.getElementById('stance');
    const opponentSelect = document.getElementById('opponent');
    const startButton = document.getElementById('startButton');
    const endButton = document.getElementById('endButton');
    
    // Ensure initial button states
    endButton.style.display = 'none';
    
    function checkFormValidity() {
        const topicSelected = topicSelect.value !== '';
        const stanceSelected = stanceSelect.value !== '';
        const opponentSelected = opponentSelect.value !== '';
        startButton.disabled = !(topicSelected && stanceSelected && opponentSelected);
    }
    
    // Add event listeners for all form controls
    topicSelect.addEventListener('change', checkFormValidity);
    stanceSelect.addEventListener('change', checkFormValidity);
    opponentSelect.addEventListener('change', () => {
        checkFormValidity();
        initializeAvatar(); // Update avatar when opponent changes
    });
    
    // Initial check
    checkFormValidity();
});

window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
});