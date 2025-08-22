/**
 * Money Rain Animation for Indian Finance Dashboard
 * Creates falling Indian currency notes animation
 */

// Configuration for money notes
const moneyRainConfig = {
    notes: [
        '/static/images/rupee-500.png',  // You'll need to create or find these images
        '/static/images/rupee-2000.png'
    ],
    count: 20,            // Number of notes on screen
    minSpeed: 2,          // Minimum fall speed
    maxSpeed: 5,          // Maximum fall speed
    minSize: 40,          // Minimum note size
    maxSize: 80,          // Maximum note size
    rotation: true,       // Enable rotation
    container: document   // Where to append the notes
};

// Create container for money rain
const createMoneyRainContainer = () => {
    const container = document.createElement('div');
    container.className = 'money-rain-container';
    document.body.appendChild(container);
    return container;
};

// Create a single money note element
const createMoneyNote = (container, config) => {
    const note = document.createElement('div');
    note.className = 'money-note';
    
    // Random image from the available notes
    const imageIndex = Math.floor(Math.random() * config.notes.length);
    
    // Random size
    const size = Math.floor(Math.random() * (config.maxSize - config.minSize)) + config.minSize;
    
    // Random horizontal position
    const xPos = Math.floor(Math.random() * 100);
    
    // Random fall speed
    const fallSpeed = Math.floor(Math.random() * (config.maxSpeed - config.minSpeed)) + config.minSpeed;
    
    // Random delay
    const delay = Math.random() * 10;
    
    // Random rotation if enabled
    const rotation = config.rotation ? Math.floor(Math.random() * 360) : 0;
    
    // Set styles
    note.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size * 0.5}px;
        top: -${size}px;
        left: ${xPos}%;
        background-image: url('${config.notes[imageIndex]}');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center center;
        opacity: 0.85;
        z-index: 1000;
        pointer-events: none;
        animation: moneyFall ${fallSpeed}s linear ${delay}s infinite;
        transform: rotate(${rotation}deg);
    `;
    
    container.appendChild(note);
    return note;
};

// Start the money rain
const startMoneyRain = (config = moneyRainConfig) => {
    // Add CSS animation
    const styleSheet = document.createElement('style');
    styleSheet.id = 'money-rain-style';
    styleSheet.textContent = `
        @keyframes moneyFall {
            0% { transform: translateY(0) rotate(0deg); opacity: 0.85; }
            10% { opacity: 0.85; }
            90% { opacity: 0.85; }
            100% { transform: translateY(${window.innerHeight + 100}px) rotate(${config.rotation ? '20deg' : '0deg'}); opacity: 0.3; }
        }
    `;
    document.head.appendChild(styleSheet);
    
    // Create container
    const container = createMoneyRainContainer();
    
    // Create money notes
    for (let i = 0; i < config.count; i++) {
        createMoneyNote(container, config);
    }
};

// Initialize the money rain when page is loaded
document.addEventListener('DOMContentLoaded', () => {
    startMoneyRain();
});
