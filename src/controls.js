// --- src/controls.js ---
import { Conversation } from '@elevenlabs/client';

let conversation = null;
let avatarWindow = null;
let summarizeRequested = false;

// Cross-window communication with avatar display
function sendToAvatar(action, data = {}) {
    if (avatarWindow && !avatarWindow.closed) {
        avatarWindow.postMessage({ action, data }, window.location.origin);
    }
}

// Get the currently selected opponent from buttons
function getSelectedOpponent() {
    const selectedButton = document.querySelector('.opponent-button.selected');
    return selectedButton ? selectedButton.getAttribute('data-opponent') : '';
}

// Handle opponent button selection
function selectOpponent(opponentValue) {
    // Remove selection from all buttons
    document.querySelectorAll('.opponent-button').forEach(button => {
        button.classList.remove('selected');
    });
    
    // Add selection to clicked button
    const selectedButton = document.querySelector(`[data-opponent="${opponentValue}"]`);
    if (selectedButton) {
        selectedButton.classList.add('selected');
    }
    
    // Send avatar update to avatar window
    sendToAvatar('updateAvatar', { opponent: opponentValue });
    
    // Check form validity
    checkFormValidity();
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
    const summaryButton = document.getElementById('summaryButton');
    
    // Update based on the exact mode string we receive
    const isSpeaking = mode.mode === 'speaking';
    statusElement.textContent = isSpeaking ? 'Agent Speaking' : 'Agent Silent';
    statusElement.classList.toggle('speaking', isSpeaking);
    
    // Send speaking status to avatar window for animation
    sendToAvatar('updateSpeaking', { speaking: isSpeaking });
    
    if (isSpeaking) {
        // Disable summary button when agent is speaking
        if (summaryButton) {
            summaryButton.disabled = true;
        }
    } else {
        // Only enable summary button when:
        // 1. Agent is done speaking
        // 2. Button should be visible
        // 3. We're not in the middle of a summary request
        if (summaryButton && summaryButton.style.display !== 'none' && !summarizeRequested) {
            summaryButton.disabled = false;
        }
        
        // If the agent just finished speaking and we requested a summary,
        // this is likely the end of the summary response
        if (summarizeRequested) {
            console.log('Agent finished speaking after summary request');
            // Reset the summary request state after a brief delay
            // to ensure any follow-up API calls have completed
            setTimeout(() => {
                summarizeRequested = false;
                
                // Reset the button if it still exists and should be visible
                if (summaryButton && summaryButton.style.display !== 'none') {
                    // Reset button appearance
                    summaryButton.disabled = false;
                    summaryButton.classList.remove('loading');
                    
                    // Reset button text
                    summaryButton.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                            <line x1="3" y1="6" x2="3.01" y2="6"></line>
                            <line x1="3" y1="12" x2="3.01" y2="12"></line>
                            <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                        Summarize Debate
                    `;
                    console.log('Summary completed, button reset and re-enabled');
                }
            }, 1000); // Wait 1 second before resetting to ensure API operations completed
        }
    }
    
    console.log('Speaking status updated:', { mode, isSpeaking, summarizeRequested }); // Debug log
}

// Function to disable/enable form controls
function setFormControlsState(disabled) {
    const topicSelect = document.getElementById('topic');
    const opponentButtons = document.querySelectorAll('.opponent-button');
    
    topicSelect.disabled = disabled;
    opponentButtons.forEach(button => button.disabled = disabled);
}

// Open avatar window
function openAvatarWindow() {
    if (avatarWindow && !avatarWindow.closed) {
        avatarWindow.focus();
        return;
    }
    
    const avatarUrl = '/avatar.html';
    avatarWindow = window.open(
        avatarUrl, 
        'avatarWindow', 
        'width=800,height=800,menubar=no,toolbar=no,location=no,status=no,scrollbars=no,resizable=yes'
    );
    
    // Wait a moment for the window to load, then send initial data
    setTimeout(() => {
        const selectedOpponent = getSelectedOpponent();
        if (selectedOpponent) {
            sendToAvatar('updateAvatar', { opponent: selectedOpponent });
        }
    }, 1000);
}

async function startConversation() {
    const startButton = document.getElementById('startButton');
    const endButton = document.getElementById('endButton');
    const summaryButton = document.getElementById('summaryButton');
    
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
        const selectedOpponent = getSelectedOpponent();
        
        const signedUrl = await getSignedUrl(selectedOpponent);
        //const agentId = await getAgentId(); // You can switch to agentID for public agents
        
        // Set user stance to "for" and AI stance to "against" by default
        const userStance = "for";
        const aiStance = "against";
        
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
                summaryButton.disabled = false;
                summaryButton.style.display = 'flex';
            },            
            onDisconnect: () => {
                console.log('Disconnected');
                updateStatus(false);
                setFormControlsState(false); // Re-enable form controls
                startButton.disabled = false;
                startButton.style.display = 'flex';
                endButton.disabled = true;
                endButton.style.display = 'none';
                summaryButton.disabled = true;
                summaryButton.style.display = 'none';
                document.getElementById('qnaButton').style.display = 'block';
                updateSpeakingStatus({ mode: 'listening' }); // Reset to listening mode on disconnect
                sendToAvatar('stopSpeaking'); // Ensure avatar animation stops
            },
            onError: (error) => {
                console.error('Conversation error:', error);
                setFormControlsState(false); // Re-enable form controls on error
                startButton.disabled = false;
                startButton.style.display = 'flex';
                endButton.disabled = true;
                endButton.style.display = 'none';
                summaryButton.disabled = true;
                summaryButton.style.display = 'none';
                document.getElementById('qnaButton').style.display = 'block';
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
    console.log('Ending conversation...');
    if (conversation) {
        try {
            await conversation.endSession();
            console.log('Conversation ended successfully');
        } catch (error) {
            console.error('Error ending conversation:', error);
        } finally {
            conversation = null;
        }
    } else {
        console.log('No active conversation to end');
    }
}

// Function to request a summary of the conversation
async function summarizeConversation() {
    if (conversation && !summarizeRequested) {
        try {
            // Set flag to indicate we're expecting a summary
            summarizeRequested = true;
            
            // Disable the summary button and add loading indicator
            const summaryButton = document.getElementById('summaryButton');
            if (summaryButton) {
                summaryButton.disabled = true;
                summaryButton.classList.add('loading');
                
                // Change button text to indicate processing
                const originalText = summaryButton.innerHTML;
                summaryButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                    Creating Summary...
                `;
            }
            
            // Log the request time for debugging
            console.log(`Summary requested at ${new Date().toISOString()}`);
            
            // Send a message to the AI asking for a summary
            // Try different methods in case the API has changed
            try {
                // Prepare the summary message with clear instructions
                const summaryPrompt = "Please summarize our entire debate so far with key points from both sides.";
                
                // Method 1: Using sendTextMessage (original method)
                if (typeof conversation.sendTextMessage === 'function') {
                    await conversation.sendTextMessage(summaryPrompt);
                    console.log('Summary requested using sendTextMessage');
                } 
                // Method 2: Using sendUserMessage 
                else if (typeof conversation.sendUserMessage === 'function') {
                    await conversation.sendUserMessage(summaryPrompt);
                    console.log('Summary requested using sendUserMessage');
                }
                // Method 3: Using prompt
                else if (typeof conversation.prompt === 'function') {
                    await conversation.prompt(summaryPrompt);
                    console.log('Summary requested using prompt');
                }                
                // Method 4: Using write
                else if (typeof conversation.write === 'function') {
                    await conversation.write(summaryPrompt);
                    console.log('Summary requested using write');
                }
                // Method 5: Using ask
                else if (typeof conversation.ask === 'function') {
                    await conversation.ask(summaryPrompt);
                    console.log('Summary requested using ask');
                }
                // Method 6: If none of the above works, log the available methods and information
                else {
                    console.error('No suitable message sending method found on conversation object');
                    console.log('Available methods:', 
                        Object.getOwnPropertyNames(Object.getPrototypeOf(conversation)));
                    console.log('Conversation object keys:', Object.keys(conversation));
                    console.log('Conversation object:', conversation);
                    throw new Error('No suitable method to send message to AI');
                }
            } catch (innerError) {
                console.error('Error sending message:', innerError);
                throw innerError;
            }
            
            console.log('Summary requested, button will remain disabled until summary is complete');
            
            // Safety fallback: If after 60 seconds the flag is still set (agent didn't complete speaking),
            // reset the flag and re-enable the button
            setTimeout(() => {
                if (summarizeRequested) {
                    console.log(`Fallback: Summary request timed out after 60 seconds at ${new Date().toISOString()}`);
                    summarizeRequested = false;
                    
                    // Reset the button if it's still on the page and disabled
                    const summaryButtonCheck = document.getElementById('summaryButton');
                    if (summaryButtonCheck) {
                        if (summaryButtonCheck.disabled && summaryButtonCheck.style.display !== 'none') {
                            // Reset button to original state
                            summaryButtonCheck.disabled = false;
                            summaryButtonCheck.classList.remove('loading');
                            summaryButtonCheck.innerHTML = `
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="8" y1="6" x2="21" y2="6"></line>
                                    <line x1="8" y1="12" x2="21" y2="12"></line>
                                    <line x1="8" y1="18" x2="21" y2="18"></line>
                                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                                </svg>
                                Summarize Debate
                            `;
                            console.log('Summary button reset by timeout fallback');
                        }
                    }
                }
            }, 60000);
        } catch (error) {
            console.error('Error requesting summary:', error);
            alert('Failed to request summary. Please try again.');
            
            // Re-enable the button on error after a short delay
            setTimeout(() => {
                const summaryButton = document.getElementById('summaryButton');
                if (summaryButton) {
                    summaryButton.disabled = false;
                }
            }, 1000);
        }
    }
}

// Q&A with Nelson Mandela
async function startQnA() {
    try {
        console.log('Starting Q&A with Nelson Mandela...');
        
        // End any existing conversation first
        if (conversation) {
            console.log('Ending existing conversation before starting Q&A...');
            await endConversation();
            // Wait a moment to ensure cleanup is complete
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Request microphone permission first
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
            alert('Microphone permission is required for the Q&A session.');
            return;
        }
        
        // Set form controls state
        setFormControlsState(true);
        
        // Force select Nelson Mandela
        selectOpponent('nelson');
        
        // Get signed URL for Nelson Mandela Q&A mode
        const signedUrl = await getSignedUrl('nelson', 'qna');
        
        console.log('Creating Q&A conversation with signed URL...');
        console.log('Signed URL details:', signedUrl);
        
        // Create new conversation with the same structure as the debate but simpler parameters
        conversation = await Conversation.startSession({
            signedUrl: signedUrl,
            // Add simple dynamic variables to make it a Q&A session
            dynamicVariables: {
                topic: "Allowing AI to override human decisions in healthcare",
                user_stance: "curious",
                ai_stance: "against"
            },
            onConnect: () => {
                console.log('Q&A session connected successfully');
                updateStatus(true);
                updateSpeakingStatus({ mode: 'listening' });
                
                // Send an initial greeting to keep the connection active
                setTimeout(() => {
                    console.log('Q&A session ready for user input');
                }, 1000);
                
                // Hide Q&A button and show end button
                document.getElementById('qnaButton').style.display = 'none';
                document.getElementById('endButton').style.display = 'flex';
                document.getElementById('startButton').style.display = 'none';
                document.getElementById('summaryButton').style.display = 'none';
            },
            onDisconnect: () => {
                console.log('Q&A session disconnected');
                updateStatus(false);
                updateSpeakingStatus({ mode: 'agent_silent' });
                sendToAvatar('stopSpeaking');
                setFormControlsState(false);
                
                // Reset button visibility
                document.getElementById('qnaButton').style.display = 'block';
                document.getElementById('endButton').style.display = 'none';
                document.getElementById('startButton').style.display = 'flex';
                document.getElementById('summaryButton').style.display = 'none';
            },
            onError: (error) => {
                console.error('Q&A session error:', error);
                updateStatus(false);
                updateSpeakingStatus({ mode: 'agent_silent' });
                sendToAvatar('stopSpeaking');
                setFormControlsState(false);
                
                // Reset button visibility
                document.getElementById('qnaButton').style.display = 'block';
                document.getElementById('endButton').style.display = 'none';
                document.getElementById('startButton').style.display = 'flex';
                document.getElementById('summaryButton').style.display = 'none';
                
                alert('An error occurred during the Q&A session.');
            },
            onModeChange: (mode) => {
                console.log('Q&A mode changed:', mode);
                updateSpeakingStatus(mode);
            }
        });

        console.log('Q&A conversation session created successfully');

    } catch (error) {
        console.error('Error starting Q&A:', error);
        setFormControlsState(false);
        
        // Reset button visibility on error
        document.getElementById('qnaButton').style.display = 'block';
        document.getElementById('endButton').style.display = 'none';
        document.getElementById('startButton').style.display = 'flex';
        document.getElementById('summaryButton').style.display = 'none';
        
        alert('Failed to start Q&A session. Please check your internet connection and try again.');
    }
}

// Check form validity
function checkFormValidity() {
    const topicSelect = document.getElementById('topic');
    const startButton = document.getElementById('startButton');
    
    const topicSelected = topicSelect.value !== '';
    const opponentSelected = getSelectedOpponent() !== '';
    startButton.disabled = !(topicSelected && opponentSelected);
}

// Event listeners
document.getElementById('startButton').addEventListener('click', startConversation);
document.getElementById('endButton').addEventListener('click', endConversation);
document.getElementById('summaryButton').addEventListener('click', summarizeConversation);
document.getElementById('qnaButton').addEventListener('click', startQnA);
document.getElementById('openAvatarButton').addEventListener('click', openAvatarWindow);

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Enable start button when topic and opponent are selected
    const topicSelect = document.getElementById('topic');
    const startButton = document.getElementById('startButton');
    const endButton = document.getElementById('endButton');
    const summaryButton = document.getElementById('summaryButton');
    
    // Ensure initial button states
    endButton.style.display = 'none';
    summaryButton.style.display = 'none';
    
    // Make checkFormValidity globally accessible
    window.checkFormValidity = checkFormValidity;
    
    // Add event listeners for all form controls
    topicSelect.addEventListener('change', checkFormValidity);
    
    // Add event listeners for opponent buttons
    document.querySelectorAll('.opponent-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const opponentValue = e.currentTarget.getAttribute('data-opponent');
            selectOpponent(opponentValue);
        });
    });
    
    // Initial check
    checkFormValidity();
});

window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
});

// Handle window close to clean up avatar window
window.addEventListener('beforeunload', () => {
    if (avatarWindow && !avatarWindow.closed) {
        avatarWindow.close();
    }
});
