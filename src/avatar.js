// --- src/avatar.js ---

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

// Create celebrity avatar with video
function createCelebrityAvatar(opponent) {
    // Map for character videos - primary content
    const videoMap = {
    'saurabh': 'abhay.mp4',
    'parag': 'akshat.mp4',
    'mohnish': 'tanmay.mp4',
    'aswath': 'vikranth.mp4',
        // 'singapore_uncle': 'singapore_uncle.mp4'
    };
    
    // Fallback image map - only used if video fails completely
    const imageMap = {
        'saurabh': 'saurabh.jpg',
    'parag': 'parag.jpg',
    'mohnish': 'mohnish.jpg',
    'aswath': 'aswath.jpg',
        'singapore_uncle': 'singapore_uncle.jpg'
    };
    
    const videoSrc = videoMap[opponent];
    const imageSrc = imageMap[opponent];
    
    if (!videoSrc && !imageSrc) return createAvatarSVG(); // fallback to doctor avatar
    
    return `
        <div class="celebrity-avatar-container">
            <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                ${videoSrc ? 
                    `<video 
                        src="/static/videos/${videoSrc}" 
                        class="celebrity-video centered-video preserve-aspect-ratio"
                        muted
                        loop
                        playsinline
                        preload="auto"
                        id="avatarVideo"
                    ></video>` : ''}
                <div class="fallback-avatar" style="display: none;">
                    ${createAvatarSVG()}
                </div>
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
function initializeAvatar(opponent = null) {
    const avatarWrapper = document.getElementById('animatedAvatar');
    
    if (avatarWrapper) {
        if (opponent) {
            avatarWrapper.innerHTML = createCelebrityAvatar(opponent);
            
            // Get the video element if it exists
            const videoElement = document.getElementById('avatarVideo');
            if (videoElement) {
                console.log(`Setting up video for ${opponent}`);
                
                // Set critical video properties
                videoElement.muted = true;
                videoElement.loop = true;
                videoElement.playsInline = true;
                videoElement.controls = false;
                videoElement.autoplay = false; // Don't autoplay on load
                
                // Force load and prime the video
                videoElement.load();
                videoElement.currentTime = 0;
                
                // Apply explicit styles to ensure visibility, centering, and aspect ratio preservation
                videoElement.style.display = 'block';
                videoElement.style.visibility = 'visible';
                videoElement.style.opacity = '1';
                videoElement.style.zIndex = '10';
                videoElement.style.position = 'absolute';
                videoElement.style.top = '50%';
                videoElement.style.left = '50%';
                videoElement.style.transform = 'translate(-50%, -50%)';
                videoElement.style.width = 'auto';
                videoElement.style.height = 'auto';
                videoElement.style.maxWidth = '100%';
                videoElement.style.maxHeight = '100%';
                videoElement.style.objectFit = 'contain';
                
                // Add events for debugging
                videoElement.addEventListener('loadeddata', () => {
                    console.log(`Video data loaded for ${opponent}`);
                });
                
                videoElement.addEventListener('error', (e) => {
                    console.error(`Error with video for ${opponent}:`, e);
                    
                    // Show fallback avatar on error
                    const fallbackAvatar = avatarWrapper.querySelector('.fallback-avatar');
                    if (fallbackAvatar) {
                        fallbackAvatar.style.display = 'block';
                        videoElement.style.display = 'none';
                    }
                });
                
                // Try to prime the video by playing briefly
                setTimeout(() => {
                    videoElement.play().then(() => {
                        setTimeout(() => {
                            videoElement.pause();
                            videoElement.currentTime = 0;
                        }, 50);
                    }).catch(e => {
                        console.log(`Couldn't prime video: ${e} - will try again when speaking`);
                    });
                }, 100);
            }
        } else {
            avatarWrapper.innerHTML = createAvatarSVG();
        }
    }
}

// Preload videos for better performance
function preloadVideos(opponent) {
    // Map for character videos
    const videoMap = {
    'kedia': 'kedia.mp4',
    'rakesh': 'rakesh.mp4',
    'radhakishan': 'radhakishan.mp4'
    };
    
    const videoSrc = videoMap[opponent];
    if (videoSrc) {
        // Check if this video is already preloaded
        const existingPreloader = document.querySelector(`[data-preload-opponent="${opponent}"]`);
        if (existingPreloader) {
            console.log(`Video for ${opponent} already preloaded`);
            return;
        }
        
        console.log(`Preloading video for ${opponent}: ${videoSrc}`);
        
        // Create a video element for preloading
        const preloader = document.createElement('video');
        
        // Set all attributes before setting src
        preloader.style.position = 'absolute';
        preloader.style.left = '-9999px';
        preloader.style.top = '-9999px';
        preloader.style.display = 'block'; // Actually display it but off-screen
        preloader.muted = true;
        preloader.playsInline = true;
        preloader.autoplay = false;
        preloader.controls = false;
        preloader.preload = 'auto';
        preloader.loop = true;
        
        // Set data attribute for identification
        preloader.setAttribute('data-preload-opponent', opponent);
        
        // Add to DOM for preloading
        document.body.appendChild(preloader);
        
        // Add event listeners
        preloader.addEventListener('loadeddata', () => {
            console.log(`Video data preloaded for ${opponent}`);
            
            // Try to play and pause to prime the video
            preloader.play().then(() => {
                setTimeout(() => {
                    preloader.pause();
                    preloader.currentTime = 0;
                    console.log(`Video for ${opponent} primed and ready`);
                }, 100);
            }).catch(err => {
                console.log(`Error during preload play: ${err}`);
                // This is expected in some browsers due to autoplay restrictions
            });
        });
        
        preloader.addEventListener('error', (error) => {
            console.error(`Error preloading video for ${opponent}:`, error);
        });
        
        // Set source after all listeners are attached
        preloader.src = `/static/videos/${videoSrc}`;
        preloader.load(); // Start loading the video
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
        
        // Handle video playback if available
        const videoElement = document.getElementById('avatarVideo');
        if (videoElement) {
            // Ensure the video is visible
            videoElement.style.display = 'block';
            videoElement.style.visibility = 'visible';
            videoElement.style.opacity = '1';
            videoElement.style.zIndex = '10';
            
            console.log('Starting video playback for speaking animation');
            try {
                // Reset video to beginning
                videoElement.currentTime = 0;
                
                // Ensure required attributes are set
                videoElement.muted = true;
                videoElement.loop = true;
                videoElement.playsInline = true;
                
                // Play with retries
                let retryCount = 0;
                const maxRetries = 3;
                
                const attemptPlay = () => {
                    console.log(`Attempt #${retryCount + 1} to play video`);
                    const playPromise = videoElement.play();
                    
                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => {
                                console.log('Video started playing successfully');
                                // Double check to make sure video is visible
                                videoElement.style.display = 'block';
                            })
                            .catch(error => {
                                console.error(`Error playing video (attempt ${retryCount + 1}):`, error);
                                retryCount++;
                                
                                if (retryCount < maxRetries) {
                                    console.log(`Retrying video play in ${retryCount * 200}ms...`);
                                    // Try again with increasing delay
                                    setTimeout(attemptPlay, retryCount * 200);
                                } else {
                                    console.error('Max video play retries reached. Showing fallback if available.');
                                    // If video fails to play after all retries, show fallback
                                    const fallbackAvatar = avatarWrapper.querySelector('.fallback-avatar');
                                    if (fallbackAvatar) {
                                        fallbackAvatar.style.display = 'block';
                                    }
                                }
                            });
                    } else {
                        console.log('Play promise was undefined, video may already be playing');
                    }
                };
                
                // Start first attempt with a slight delay
                setTimeout(attemptPlay, 100);
            } catch (error) {
                console.error('Video playback error:', error);
                // Show fallback avatar on errors
                const fallbackAvatar = avatarWrapper.querySelector('.fallback-avatar');
                if (fallbackAvatar) {
                    fallbackAvatar.style.display = 'block';
                }
            }
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
        
        // Handle video pause but keep showing it
        const videoElement = document.getElementById('avatarVideo');
        if (videoElement) {
            console.log('Pausing video and resetting to first frame');
            
            try {
                // Ensure the video is paused
                videoElement.pause();
                
                // Reset to first frame (using a short timeout to ensure pause completes)
                setTimeout(() => {
                    videoElement.currentTime = 0;
                    
                    // Double-check that the video is at frame 0
                    setTimeout(() => {
                        if (videoElement.currentTime > 0.1) {
                            console.log('Video not at frame 0, forcing reset');
                            videoElement.currentTime = 0;
                        }
                    }, 50);
                }, 50);
                
                // Keep video visible, just paused at first frame
                videoElement.style.display = 'block';
                videoElement.style.visibility = 'visible';
                videoElement.style.opacity = '1';
            } catch (error) {
                console.error('Error pausing video:', error);
            }
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

// Handle messages from control window
window.addEventListener('message', (event) => {
    // Verify origin for security
    if (event.origin !== window.location.origin) {
        return;
    }
    
    const { action, data } = event.data;
    
    console.log(`Received message: ${action}`, data);
    
    switch (action) {
        case 'updateAvatar':
            console.log('Updating avatar to:', data.opponent);
            
            // Preload video for this opponent if needed
            preloadVideos(data.opponent);
            
            // Initialize avatar with the new opponent
            initializeAvatar(data.opponent);
            break;
            
        case 'updateSpeaking':
            console.log('Updating speaking status:', data.speaking);
            if (data.speaking) {
                startMouthAnimation();
            } else {
                stopMouthAnimation();
            }
            break;
            
        case 'startSpeaking':
            console.log('Starting speaking animation');
            startMouthAnimation();
            break;
            
        case 'stopSpeaking':
            console.log('Stopping speaking animation');
            stopMouthAnimation();
            break;
            
        case 'preloadVideo':
            if (data && data.opponent) {
                console.log('Preloading video for:', data.opponent);
                preloadVideos(data.opponent);
            }
            break;
            
        default:
            console.log('Unknown action received:', action);
    }
});

// Initialize avatar when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Avatar window loaded, initializing...');
    
    // Preload all potential videos in advance
    preloadVideos('nelson');
    preloadVideos('michelle');
    preloadVideos('taylor');
    preloadVideos('rakesh');
    preloadVideos('radhakishan');
    preloadVideos('kedia');
    // preloadVideos('singapore_uncle');
    
    // Initialize avatar with default
    initializeAvatar();
    
    // Add fullscreen toggle on click
    const avatarCard = document.querySelector('.avatar-card');
    if (avatarCard) {
        avatarCard.addEventListener('click', () => {
            document.body.classList.toggle('fullscreen');
        });
    }
    
    // Add escape key to exit fullscreen
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.body.classList.remove('fullscreen');
        }
    });
    
    // Log that we're ready for messages
    console.log('Avatar initialization complete, ready for messages');
});

window.addEventListener('error', function(event) {
    console.error('Avatar window error:', event.error);
});
