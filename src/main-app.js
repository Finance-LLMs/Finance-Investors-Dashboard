// --- New integrated app.js for the main page ---
import { Conversation } from '@elevenlabs/client';

let conversation = null;
let mouthAnimationInterval = null;
let currentMouthState = 'M130,170 Q150,175 170,170'; // closed mouth
let selectedAgent = null;
let currentTopic = '';

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
            <ellipse cx="130" cy="125" rx="8" ry="10" fill="white" />
            <ellipse cx="170" cy="125" rx="8" ry="10" fill="white" />
            <circle cx="130" cy="125" r="4" fill="#2D3748" />
            <circle cx="170" cy="125" r="4" fill="#2D3748" />
            
            <!-- Eye highlights -->
            <circle cx="132" cy="123" r="1.5" fill="white" />
            <circle cx="172" cy="123" r="1.5" fill="white" />
            
            <!-- Nose -->
            <path d="M145,135 Q150,145 155,135" stroke="#D69E2E" stroke-width="2" fill="none" />
            
            <!-- Mouth (animated) -->
            <path d="${currentMouthState}" stroke="#B83280" stroke-width="3" fill="none" id="doctorMouth" />
            
            <!-- Stethoscope -->
            <path d="M135,250 Q120,245 110,260 Q110,275 125,270 Q135,265 140,255" stroke="#4A5568" stroke-width="3" fill="none" />
            <circle cx="125" cy="270" r="8" fill="none" stroke="#4A5568" stroke-width="2" />
            <path d="M140,255 Q145,250 155,252 Q165,250 170,255" stroke="#4A5568" stroke-width="3" fill="none" />
        </svg>
    `;
}

// Create celebrity avatar with video support
function createCelebrityAvatar(opponent) {
    // Map for character videos
    const videoMap = {
        'nelson': 'nelson.mp4',
        'michelle': 'barbarella.mp4',
        'taylor': 'taylor.mp4',
    };
    
    // Fallback image map
    const imageMap = {
        'michelle': 'michelle.jpg',
        'nelson': 'nelson.jpg', 
        'taylor': 'taylor.jpg',
        'singapore_uncle': 'singapore_uncle.jpg'
    };
    
    const videoSrc = videoMap[opponent];
    const imageSrc = imageMap[opponent];
    
    // If no video and no image, fallback to SVG avatar
    if (!videoSrc && !imageSrc) return createAvatarSVG();
    
    return `
        <div class="celebrity-avatar-container">
            ${videoSrc ? 
                `<video 
                    src="/static/videos/${videoSrc}" 
                    class="celebrity-video"
                    muted
                    loop
                    playsinline
                    preload="auto"
                    id="avatarVideo"
                    style="display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 15px;"
                ></video>` : ''}
            <div class="fallback-avatar" style="display: none;">
                ${createAvatarSVG()}
            </div>
            <div class="speaking-indicator" id="speakingIndicator" style="display: none;">
                <div class="speaking-wave"></div>
                <div class="speaking-wave"></div>
                <div class="speaking-wave"></div>
            </div>
        </div>
    `;
}

// Initialize avatar display
function initializeAvatar() {
    const avatarContainer = document.getElementById('avatarContainer');
    if (selectedAgent) {
        avatarContainer.innerHTML = createCelebrityAvatar(selectedAgent);
        setupVideoEvents();
    } else {
        avatarContainer.innerHTML = `
            <div class="no-agent-message">
                Select an AI agent to see their avatar
            </div>
        `;
    }
}

// Setup video events for avatar video
function setupVideoEvents() {
    const video = document.getElementById('avatarVideo');
    if (video) {
        video.addEventListener('loadeddata', () => {
            console.log('Avatar video loaded successfully');
        });
        
        video.addEventListener('error', (e) => {
            console.error('Avatar video error:', e);
            // Fallback to SVG if video fails
            const avatarContainer = document.getElementById('avatarContainer');
            avatarContainer.innerHTML = createAvatarSVG();
        });
    }
}

// Mouth animation functions
function startMouthAnimation() {
    if (mouthAnimationInterval) return;
    
    const mouthShapes = [
        'M130,170 Q150,175 170,170', // closed
        'M130,170 Q150,180 170,170', // slightly open
        'M130,175 Q150,185 170,175', // more open
        'M130,170 Q150,180 170,170', // slightly open
    ];
    
    let shapeIndex = 0;
    mouthAnimationInterval = setInterval(() => {
        currentMouthState = mouthShapes[shapeIndex];
        const mouthElement = document.getElementById('doctorMouth');
        if (mouthElement) {
            mouthElement.setAttribute('d', currentMouthState);
        }
        shapeIndex = (shapeIndex + 1) % mouthShapes.length;
    }, 200);
}

function stopMouthAnimation() {
    if (mouthAnimationInterval) {
        clearInterval(mouthAnimationInterval);
        mouthAnimationInterval = null;
    }
    currentMouthState = 'M130,170 Q150,175 170,170'; // closed mouth
    const mouthElement = document.getElementById('doctorMouth');
    if (mouthElement) {
        mouthElement.setAttribute('d', currentMouthState);
    }
}

// Microphone permission
async function requestMicrophonePermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (error) {
        console.error('Microphone permission denied:', error);
        return false;
    }
}

// Get signed URL for agent
async function getSignedUrl(opponent, mode = null) {
    try {
        let url = opponent ? `/api/signed-url?opponent=${opponent}` : '/api/signed-url';
        if (mode) {
            url += `&mode=${mode}`;
        }
        console.log('Requesting signed URL for:', opponent, 'mode:', mode, 'URL:', url);
        const response = await fetch(url);
        if (!response.ok) {
            console.error('Failed to get signed URL, status:', response.status);
            throw new Error('Failed to get signed URL');
        }
        const data = await response.json();
        console.log('Received signed URL response:', data);
        return data.signedUrl;
    } catch (error) {
        console.error('Error getting signed URL:', error);
        throw error;
    }
}

// Update status displays
function updateStatus(isConnected) {
    const statusElement = document.getElementById('connectionStatus');
    if (statusElement) {
        statusElement.textContent = isConnected ? 'Connected' : 'Disconnected';
        statusElement.classList.toggle('connected', isConnected);
        statusElement.classList.remove('hidden');
    }
}

function updateSpeakingStatus(mode) {
    const statusElement = document.getElementById('speakingStatus');
    if (statusElement) {
        const isSpeaking = mode.mode === 'speaking';
        statusElement.textContent = isSpeaking ? 'Agent Speaking' : 'Agent Silent';
        statusElement.classList.toggle('speaking', isSpeaking);
        statusElement.classList.remove('hidden');
        
        // Show speaking indicator
        const speakingIndicator = document.getElementById('speakingIndicator');
        if (speakingIndicator) {
            speakingIndicator.style.display = isSpeaking ? 'flex' : 'none';
        }
        
        // Control avatar video if available
        const video = document.getElementById('avatarVideo');
        if (video) {
            if (isSpeaking && video.paused) {
                video.play().catch(e => console.log('Video play error:', e));
            } else if (!isSpeaking && !video.paused) {
                video.pause();
            }
        }
        
        // Control mouth animation for SVG avatar
        if (isSpeaking) {
            startMouthAnimation();
        } else {
            stopMouthAnimation();
        }
    }
}

// Start conversation function
async function startConversation() {
    try {
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
            alert('Microphone permission is required for the conversation.');
            return false;
        }
        
        if (!selectedAgent) {
            alert('Please select an AI agent first.');
            return false;
        }
        
        const signedUrl = await getSignedUrl(selectedAgent);
        
        // Set debate stances
        const userStance = "for";
        const aiStance = "against";
        
        conversation = await Conversation.startSession({
            signedUrl: signedUrl,
            dynamicVariables: {
                topic: currentTopic || "General discussion",
                user_stance: userStance,
                ai_stance: aiStance
            },
            onConnect: () => {
                console.log('Connected to conversation');
                updateStatus(true);
                // Update UI to show conversation is active
                updateConversationUI(true);
            },            
            onDisconnect: () => {
                console.log('Disconnected from conversation');
                updateStatus(false);
                updateConversationUI(false);
            },
            onModeChange: (mode) => {
                console.log('Mode changed:', mode);
                updateSpeakingStatus(mode);
            },
            onError: (error) => {
                console.error('Conversation error:', error);
                updateStatus(false);
                updateConversationUI(false);
                alert('An error occurred during the conversation.');
            }
        });
        
        return true;
    } catch (error) {
        console.error('Error starting conversation:', error);
        updateStatus(false);
        alert('Failed to start conversation. Please try again.');
        return false;
    }
}

// End conversation
async function endConversation() {
    console.log('Ending conversation...');
    if (conversation) {
        try {
            await conversation.endSession();
            console.log('Conversation ended successfully');
            updateConversationUI(false);
        } catch (error) {
            console.error('Error ending conversation:', error);
        }
        conversation = null;
    }
}

// Update conversation UI
function updateConversationUI(isActive) {
    const chatButton = document.getElementById('chatButton');
    const selectButton = document.getElementById('selectAgentButton');
    
    if (isActive) {
        chatButton.textContent = '🔚 End Chat';
        chatButton.onclick = endConversation;
        selectButton.disabled = true;
    } else {
        chatButton.textContent = '💬 Chat with Us';
        chatButton.onclick = handleChatClick;
        selectButton.disabled = !selectedAgent || !currentTopic;
    }
}

// Handle chat button click
async function handleChatClick() {
    if (conversation) {
        await endConversation();
    } else {
        const success = await startConversation();
        if (!success) {
            updateConversationUI(false);
        }
    }
}

// Handle select agent button click
async function handleSelectAgentClick() {
    if (!selectedAgent || !currentTopic) {
        alert('Please select an agent and enter a topic first.');
        return;
    }
    
    // Start conversation with debate setup
    const success = await startConversation();
    if (success) {
        console.log(`Started debate with ${selectedAgent} on topic: "${currentTopic}"`);
    }
}

// Show agent avatar based on selection
function showAgentAvatar(agent) {
    selectedAgent = agent;
    const container = document.getElementById('avatarContainer');
    
    // Create avatar based on agent
    if (agent === 'nelson') {
        container.innerHTML = createNelsonAvatar();
    } else if (agent === 'michelle') {
        container.innerHTML = createMichelleAvatar();
    } else if (agent === 'taylor') {
        container.innerHTML = createTaylorAvatar();
    } else {
        // Use celebrity avatar with video support
        container.innerHTML = createCelebrityAvatar(agent);
        setupVideoEvents();
    }
}

// Create specific avatars (these can be customized per agent)
function createNelsonAvatar() {
    return `
        <div class="celebrity-avatar-container">
            <video 
                src="/static/videos/nelson.mp4" 
                class="celebrity-video"
                muted
                loop
                playsinline
                preload="auto"
                id="avatarVideo"
                style="display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 15px;"
            ></video>
            <div class="speaking-indicator" id="speakingIndicator" style="display: none;">
                <div class="speaking-wave"></div>
                <div class="speaking-wave"></div>
                <div class="speaking-wave"></div>
            </div>
        </div>
    `;
}

function createMichelleAvatar() {
    return `
        <div class="celebrity-avatar-container">
            <video 
                src="/static/videos/barbarella.mp4" 
                class="celebrity-video"
                muted
                loop
                playsinline
                preload="auto"
                id="avatarVideo"
                style="display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 15px;"
            ></video>
            <div class="speaking-indicator" id="speakingIndicator" style="display: none;">
                <div class="speaking-wave"></div>
                <div class="speaking-wave"></div>
                <div class="speaking-wave"></div>
            </div>
        </div>
    `;
}

function createTaylorAvatar() {
    return `
        <div class="celebrity-avatar-container">
            <video 
                src="/static/videos/taylor.mp4" 
                class="celebrity-video"
                muted
                loop
                playsinline
                preload="auto"
                id="avatarVideo"
                style="display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 15px;"
            ></video>
            <div class="speaking-indicator" id="speakingIndicator" style="display: none;">
                <div class="speaking-wave"></div>
                <div class="speaking-wave"></div>
                <div class="speaking-wave"></div>
            </div>
        </div>
    `;
}

// Update button states based on selections
function updateButtonStates() {
    const chatButton = document.getElementById('chatButton');
    const selectButton = document.getElementById('selectAgentButton');
    
    const hasAgent = selectedAgent !== null;
    const hasTopic = currentTopic.length > 0;
    
    chatButton.disabled = !hasAgent;
    selectButton.disabled = !hasAgent || !hasTopic;
}

// Initialize the application
function initializeApp() {
    // Agent selection functionality
    document.querySelectorAll('.agent-card').forEach(card => {
        card.addEventListener('click', function() {
            // Remove selection from all cards
            document.querySelectorAll('.agent-card').forEach(c => c.classList.remove('selected'));
            
            // Add selection to clicked card
            this.classList.add('selected');
            
            // Store selected agent
            selectedAgent = this.dataset.agent;
            
            // Enable buttons
            updateButtonStates();
            
            // Show avatar
            showAgentAvatar(selectedAgent);
        });
    });
    
    // Topic input functionality
    const topicInput = document.getElementById('topicInput');
    if (topicInput) {
        topicInput.addEventListener('input', function() {
            currentTopic = this.value.trim();
            updateButtonStates();
        });
    }
    
    // Button event listeners
    const chatButton = document.getElementById('chatButton');
    const selectButton = document.getElementById('selectAgentButton');
    
    if (chatButton) {
        chatButton.addEventListener('click', handleChatClick);
    }
    
    if (selectButton) {
        selectButton.addEventListener('click', handleSelectAgentClick);
    }
    
    // Initialize avatar display
    initializeAvatar();
    
    console.log('AI Debate Arena initialized successfully');
}

// Export functions for global access
window.startConversation = startConversation;
window.endConversation = endConversation;
window.showAgentAvatar = showAgentAvatar;
window.updateButtonStates = updateButtonStates;

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

export { 
    startConversation, 
    endConversation, 
    showAgentAvatar, 
    updateButtonStates,
    createAvatarSVG,
    createCelebrityAvatar
};
