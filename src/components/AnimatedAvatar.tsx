import { useEffect, useState } from 'react';

interface AnimatedAvatarProps {
  speaking: boolean;
}

const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({ speaking }) => {  const [mouthState, setMouthState] = useState('M130,170 Q150,175 170,170');
    useEffect(() => {
    let mouthInterval: NodeJS.Timeout | null = null;
    let animationFrame: number | null = null;
    
    if (speaking) {
      // Create randomized mouth animation when speaking - oval shape when open
      const animateMouth = () => {
        // Random probability to change mouth state - creates natural speaking pattern
        const shouldChangeMouth = Math.random() > 0.4; // 60% chance to change on each frame
        
        if (shouldChangeMouth) {
          setMouthState(prev => 
            prev === 'M130,170 Q150,175 170,170' 
              ? 'M130,170 Q150,195 170,170' 
              : 'M130,170 Q150,175 170,170'
          );
        }
        
        // Schedule next animation with variable timing (100-300ms)
        mouthInterval = setTimeout(() => {
          animationFrame = requestAnimationFrame(animateMouth);
        }, Math.random() * 200 + 100);
      };
      
      // Start the animation
      animationFrame = requestAnimationFrame(animateMouth);
    } else {
      setMouthState('M130,170 Q150,175 170,170');
    }
    
    return () => {
      if (mouthInterval) clearInterval(mouthInterval);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [speaking]);  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="w-full h-full max-w-[300px]">
        <svg 
          viewBox="0 0 300 400" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          
          {/* Body/torso - T-shirt under coat */}
          <path d="M110,220 Q150,200 190,220 L190,350 L110,350 Z" fill="#3B82F6" />
          
          {/* Doctor's white coat */}
          <path d="M100,220 Q150,195 200,220 L200,360 L100,360 Z" fill="white" stroke="#E5E7EB" />
          <path d="M100,220 L200,220" stroke="#E5E7EB" strokeWidth="1" />
          
          {/* Coat lapels */}
          <path d="M135,220 L130,260 L150,230 L170,260 L165,220" fill="#F9FAFB" />
            {/* Coat buttons */}
          <circle cx="150" cy="270" r="3" fill="#D1D5DB" />
          <circle cx="150" cy="300" r="3" fill="#D1D5DB" />
          <circle cx="150" cy="330" r="3" fill="#D1D5DB" />
          
          {/* Coat pockets */}
          <path d="M115,290 L135,290 L135,320 L115,320 Z" stroke="#E5E7EB" />
          <path d="M165,290 L185,290 L185,320 L165,320 Z" stroke="#E5E7EB" />
            {/* Arms */}
          <path d="M110,220 Q90,240 85,280 Q84,300 90,320" stroke="#E8C4A2" strokeWidth="16" strokeLinecap="round" />
          <path d="M190,220 Q210,240 215,280 Q216,300 210,320" stroke="#E8C4A2" strokeWidth="16" strokeLinecap="round" />
          
          {/* White coat sleeves */}
          <path d="M110,220 Q90,240 85,280 Q84,300 90,320" stroke="white" strokeWidth="20" strokeLinecap="round" opacity="0.9" />
          <path d="M190,220 Q210,240 215,280 Q216,300 210,320" stroke="white" strokeWidth="20" strokeLinecap="round" opacity="0.9" />
          
          {/* Hands */}
          <ellipse cx="90" cy="320" rx="10" ry="12" fill="#E8C4A2" />
          <ellipse cx="210" cy="320" rx="10" ry="12" fill="#E8C4A2" />
            {/* Neck - more natural shape - widened by 5 units */}
          <path d="M135,190 Q150,195 165,190 L165,220 L135,220 Z" fill="#E8C4A2" />
          
          {/* Head shape - completely bald with slightly shinier scalp */}
          <ellipse cx="150" cy="140" rx="55" ry="65" fill="#E8C4A2" />

          {/* Face features */}
          
          {/* Eyebrows - natural boyish shape */}
          <path d="M115,115 Q130,110 140,115" stroke="#3F2305" strokeWidth="2.5" fill="none" />
          <path d="M160,115 Q170,110 185,115" stroke="#3F2305" strokeWidth="2.5" fill="none" />
          
          {/* Eyes with natural blinking animation */}
          <g className="animate-blink">
            {/* Eye whites with better shape */}
            <path d="M115,130 Q125,125 135,130 Q125,135 115,130 Z" fill="white" />
            <path d="M165,130 Q175,125 185,130 Q175,135 165,130 Z" fill="white" />
            
            {/* Realistic pupils */}
            <circle cx="125" cy="130" r="3.5" fill="#594A3C" />
            <circle cx="175" cy="130" r="3.5" fill="#594A3C" />
            
            {/* Eye highlights for realism */}
            <circle cx="123" cy="128" r="1" fill="white" />
            <circle cx="173" cy="128" r="1" fill="white" />
            
            {/* Lower eyelids for more natural look */}
            <path d="M118,133 Q125,135 132,133" stroke="#E5A282" strokeWidth="1" opacity="0.5" />
            <path d="M168,133 Q175,135 182,133" stroke="#E5A282" strokeWidth="1" opacity="0.5" />
          </g>
        
            {/* Mouth - with oval animation when speaking */}
          <path 
            d={mouthState}
            stroke="#C27D7D" 
            strokeWidth="1.5" 
            fill={speaking ? "#8B4513" : "none"}
            opacity={speaking ? "0.7" : "1"}
          />          
            {/* Natural cheek shading */}
          <path d="M120,150 Q130,160 120,165" stroke="#D4B08C" strokeWidth="3" opacity="0.2" />
          <path d="M180,150 Q170,160 180,165" stroke="#D4B08C" strokeWidth="3" opacity="0.2" />
          
          {/* Mouth area subtle shading */}
          <path d="M140,170 Q150,175 160,170" stroke="#D4B08C" strokeWidth="1" opacity="0.3" />
          
          {/* Square glasses */}
          <path d="M105,130 L135,130 L135,145 L105,145 Z" fill="none" stroke="#31363F" strokeWidth="2" />
          <path d="M165,130 L195,130 L195,145 L165,145 Z" fill="none" stroke="#31363F" strokeWidth="2" />
          <path d="M135,137 L165,137" stroke="#31363F" strokeWidth="2" />
          <path d="M105,130 L95,125" stroke="#31363F" strokeWidth="2" />
          <path d="M195,130 L205,125" stroke="#31363F" strokeWidth="2" />
            {/* Ears with more detail */}
          <path d="M90,135 Q85,145 90,155 Q100,160 105,155 L102,135 Z" fill="#E8C4A2" />
          <path d="M95,140 Q93,145 95,150" stroke="#D4B08C" strokeWidth="1" opacity="0.6" />
          
          <path d="M210,135 Q215,145 210,155 Q200,160 195,155 L198,135 Z" fill="#E8C4A2" />
          <path d="M205,140 Q207,145 205,150" stroke="#D4B08C" strokeWidth="1" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
};

export default AnimatedAvatar;