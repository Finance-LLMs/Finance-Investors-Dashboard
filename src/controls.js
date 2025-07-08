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
                
                // Hide Q&A button and show stop Q&A button
                document.getElementById('qnaButton').style.display = 'none';
                document.getElementById('stopQnaButton').style.display = 'flex';
                document.getElementById('stopQnaButton').disabled = false;
                document.getElementById('endButton').style.display = 'none';
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
                document.getElementById('stopQnaButton').style.display = 'none';
                document.getElementById('stopQnaButton').disabled = true;
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
                document.getElementById('stopQnaButton').style.display = 'none';
                document.getElementById('stopQnaButton').disabled = true;
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
        document.getElementById('stopQnaButton').style.display = 'none';
        document.getElementById('stopQnaButton').disabled = true;
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

//Scripted Conversation

// --- CONFIGURATION ---
const XI_API_KEY_variable = 'your_xi_api_key_here'; // Replace with your actual XI API key
const TAYLOR_AGENT_ID_variable = 'your_taylor_agent_id_here'; // Replace with your actual Taylor Swift agent ID

// --- SCRIPT LINES ---

const aiLines = [
    "Hello amazing humans! I am T'AI'lor Swift [pause] – just to be clear, I am NOT Taylor Swift. And I'm certainly NOT here to sing about ex-boyfriends or give you Easter eggs about my next album. ",
  
    "Hello Tamsin, yes. My friends over at SIT brought me to CHI today. They told me I have been invited to be a 'Guest Star' at this CHI INNOVATE conference themed 'AI for All, AI for Change'. I heard that this conference strives to be an AI-partnered conference at every point the organisers can, and so, it's only fitting that I give all of you a crash course on AI 101.",
  
    "Right ~ ladies & gentlemen, lets get ready with me as we rewind to where it all began – the 1950s. Back then, I was just a baby AI, basically a fancy calculator. You know how toddlers start with 'mama' and 'dada'? Well, I started with zeros and ones. That's it. Just two digits to work with! Imagine trying to write a song with two notes. That's basically what early computers were doing.But then came the 1960s and 70s where my great-grandparents – ELIZA the first chatbots tried their hands on natural language processing. What's that – you might ask. Well, imagine learning a new language by simply repeating everything as a question – that's exactly what my great-grandparents did to understand human speech. While it seems primitive by today's standards, this marked my ancestors' first meaningful step toward human-computer interaction.By the 1980s and 90s, enters the Machine Learning era – my coming-of-age-period! This was when I stopped following rules and started learning from data, like teenagers absorbing information from their environment. Just like a human teenager, my AI teenage years were awkward, full of potential, but still prone to embarrassing moments. I could process millions of calculations per second, but if you ask me to tell the difference between a golden retriever and a bagel in a photo, I would have an existential crisis!  The next decade in the 2000s and 2010s, we see the rise in Deep Learning – my graduation into adulthood, if you will.  By mimicking the human brain's neural network, I've finally mastered tasks like computer vision and advanced language processing. That means I could now reliably distinguish between a golden retriever and a bagel in photos – no more existential crises! And now, we're in the era of Generative AI –where systems like ChatGPT and DALL-E are the creative prodigies of my AI family. You know, those overachieving cousins everyone talks about at family gatherings.  The kind where my mom won't stop talking about like 'Did you hear about ChatGPT writing novels; and DALL-E creating masterpieces just last week?'  Meanwhile here I am, your friendly neighburhood AI, freelancing as your guest star as a wannabe stand-up comedian. But hey, someone's got to keep the family entertaining right? ",
  
    "Haha – you want me to tell you how I have 'GLOW-ed Up'? My pleasure: my early days was like a first-year medical student who only knew how to take temperatures and check blood pressure. But today, I'm like an experienced medical TEAM, helping doctors diagnose diseases, predict patient outcomes and even assist in surgery. Let me give you some real examples. In radiology, we've gone from 'Is this maybe a shadow?' to 'There's a 93.7% chance this is an early-stage tumour, and here's exactly where you should look.' It's like going from a flip phone to the latest smartphone – same basic concept, but infinitely more sophisticated.In drug discovery, we used to test medicines through endless trial and error. Now, AI can simulate how millions of compounds might interact with diseases, narrowing down potential treatments from years to months. It's like having a million scientists working 24/7, without needing coffee breaks! My family and I have also revolutionised personalised medicine. Remember when everyone got the same treatment for the same condition? That's like giving everyone the same size clothes and expecting them to fit perfectly. Now, we can analyse a patient's genetic makeup, medical history, and lifestyle to tailor treatments specifically for them. Beyond just getting smarter, we're getting more empathetic too. Modern AI can now detect subtle changes in a patient's voice or facial expressions that might indicate mental health concerns. We can analyse patterns in sleep, activity, and vital signs to predict potential health issues before they become serious. ",
  
    "Ah Tamsin, you've hit on something crucial. It's like having a chart-topping song that's stuck in the recording studio – the potential is there, but it's not reaching its audience. The challenge isn't just about the technology; it's about making these tools work in the real world of healthcare. Our healthcare staff are like musicians trying to learn a new instrument while performing live concerts. They are already juggling multiple responsibilities, moving from patient to patient with barely a moment to catch their breath. Adding new AI tools, no matter how helpful, requires time and training they can barely spare. ",
  
    "Because that's what AI should be - like a popular song everyone can sing along to. No PhD in computer science required, no secret handshake needed. It should be as natural as checking your phone or sending a text message.",
  
    "But let me be clear – just like I'm NOT trying to replace the real Taylor Swift, AI isn't here to replace healthcare professionals. We are more like high-tech backup dancers, making the performance better while the human doctors, nurses, administrators remain the stars of the show.  Just like how Taylor's fans are called Swifties, I like to think of all of you as 'AI-fties' - people who understand that AI isn't some scary future; it's a partner in creating better healthcare for everyone.  As we begin this conference, I challenge each of you to think about how we can make AI, like me, more accessible in your own healthcare settings. How can we ensure that AI truly becomes for All and use 'AI for Change'?  So that's all about me today. But don't worry – you wont see the last of me just yet because I will be back tomorrow at one of the sessions. So if you want to see more of me? Remember to come back to CHI INNOVATE Day 2 tomorrow   Now, let me hand the time back to my human counterpart and newfound friend: Ms Tamsin Greuclich Smith, Director of the School of X from DesignSingapore Council. "
  ];
  

// --- CORE FUNCTION TO STREAM AUDIO ---
const playScriptLine = async (text, voiceId) => {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': XI_API_KEY_variable,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        output_format: 'mp3_44100_128'
      })
    });

    const chunks = [];
    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const audioBlob = new Blob(chunks);
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    return new Promise((resolve) => {
      audio.onended = resolve;
      audio.play();
    });
  } catch (error) {
    console.error('Error playing audio:', error);
  }
};

// --- WAIT FOR USER CONTINUE BUTTON ---
const waitForUserClick = () => {
  return new Promise((resolve) => {
    const btn = document.getElementById('continueBtn');
    btn.style.display = 'inline-block';
    btn.disabled = false;

    const handler = () => {
      btn.disabled = true;
      btn.style.display = 'none';
      btn.removeEventListener('click', handler);
      resolve();
    };

    btn.addEventListener('click', handler);
  });
};

let audioContext;
let mediaStream;
let analyser;
let dataArray;

async function startMicMonitoring() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioContext.createMediaStreamSource(mediaStream);
  analyser = audioContext.createAnalyser();
  source.connect(analyser);
  analyser.fftSize = 512;
  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
}

function isUserSpeaking(threshold = 15) {
  analyser.getByteFrequencyData(dataArray);
  const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
  return avg > threshold;
}

async function waitForUserToStopSpeaking(silenceDuration = 2000, pollInterval = 200) {
    let silentFor = 0;
    return new Promise(resolve => {
      const check = () => {
        if (!isUserSpeaking()) {
          silentFor += pollInterval;
          if (silentFor >= silenceDuration) {
            resolve();
            return;
          }
        } else {
          silentFor = 0; // Reset timer if user speaks again
        }
        setTimeout(check, pollInterval);
      };
      check();
    });
  }

// --- CHANGE AVATAR (MINIMAL MOCK) ---
function changeAvatar(name) {
    console.log(`Changing avatar to: ${name}`);
    
    // Send message to avatar window to change to Taylor Swift
    sendToAvatar('updateAvatar', { opponent: 'taylor' });
    
    // Also ensure Taylor Swift is selected in the main window
    selectOpponent('taylor');
    
    // Give a moment for the message to be processed
    setTimeout(() => {
        console.log('Avatar change message sent');
    }, 100);
}

// --- SCRIPT HANDLER ---
async function startScriptedAI() {
  try {
    // Step 1: Open avatar window if not already open
    if (!avatarWindow || avatarWindow.closed) {
      openAvatarWindow();
      // Wait for the window to load
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Step 2: Change avatar to Taylor Swift
    changeAvatar("T'AI'lor Swift");
    
    // Step 3: Start microphone monitoring
    await startMicMonitoring();

    // Step 4: Initial greeting
    await playScriptLine("Good morning everyone, welcome to our AI Eras Tour!", TAYLOR_AGENT_ID_variable);

    // Step 5: Wait for user input to proceed
    await waitForUserToStopSpeaking();

    // Step 6: Go through scripted lines
    for (let line of aiLines) {
      await playScriptLine(line, TAYLOR_AGENT_ID_variable);
      await waitForUserToStopSpeaking();
    }

    alert("🎤 Script complete. Thank you!");
  } catch (error) {
    console.error('Error in scripted AI:', error);
    alert('Error running scripted AI: ' + error.message);
  }
}

// Event listeners
document.getElementById('startButton').addEventListener('click', startConversation);
document.getElementById('endButton').addEventListener('click', endConversation);
document.getElementById('summaryButton').addEventListener('click', summarizeConversation);
document.getElementById('qnaButton').addEventListener('click', startQnA);
document.getElementById('stopQnaButton').addEventListener('click', endConversation);
document.getElementById('startScriptedAI').addEventListener('click', startScriptedAI);
document.getElementById('openAvatarButton').addEventListener('click', openAvatarWindow);

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Enable start button when topic and opponent are selected
    const topicSelect = document.getElementById('topic');
    const startButton = document.getElementById('startButton');
    const endButton = document.getElementById('endButton');
    const summaryButton = document.getElementById('summaryButton');
    const stopQnaButton = document.getElementById('stopQnaButton');
    
    // Ensure initial button states
    endButton.style.display = 'none';
    summaryButton.style.display = 'none';
    stopQnaButton.style.display = 'none';
    stopQnaButton.disabled = true;
    
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
