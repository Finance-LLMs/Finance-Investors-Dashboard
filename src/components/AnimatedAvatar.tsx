
import { useEffect, useState } from 'react';

interface AnimatedAvatarProps {
  speaking: boolean;
}

const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({ speaking }) => {
  const [mouthState, setMouthState] = useState('M130,170 Q150,175 170,170');
  
  useEffect(() => {
    let mouthInterval: NodeJS.Timeout | null = null;
    
    if (speaking) {
      // Create mouth animation when speaking
      mouthInterval = setInterval(() => {
        setMouthState(prev => 
          prev === 'M130,170 Q150,175 170,170' 
            ? 'M130,170 Q150,190 170,170' 
            : 'M130,170 Q150,175 170,170'
        );
      }, 200);
    } else {
      setMouthState('M130,170 Q150,175 170,170');
    }
    
    return () => {
      if (mouthInterval) clearInterval(mouthInterval);
    };
  }, [speaking]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="animate-float w-full h-full max-w-[300px]">
        <svg 
          viewBox="0 0 300 400" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Human body/torso */}
          <path d="M110,220 Q150,200 190,220 L190,350 L110,350 Z" fill="#6B7280" />
          
          {/* Neck */}
          <rect x="140" y="190" width="20" height="30" fill="#F4C2A6" />
          
          {/* Head shape */}
          <circle cx="150" cy="145" r="70" fill="#F4C2A6" />
          
          {/* Hair */}
          <path d="M90,120 Q100,80 150,70 Q200,80 210,120 L210,160 Q190,130 150,130 Q110,130 90,160 Z" fill="#4B5563" />
          
          {/* Eyes */}
          <g className="animate-blink">
            <ellipse cx="125" cy="135" rx="12" ry="6" fill="#FFFFFF" />
            <ellipse cx="175" cy="135" rx="12" ry="6" fill="#FFFFFF" />
            
            <circle cx="125" cy="135" r="5" fill="#000000" />
            <circle cx="175" cy="135" r="5" fill="#000000" />
            
            <circle cx="127" cy="133" r="2" fill="white" />
            <circle cx="177" cy="133" r="2" fill="white" />
          </g>
          
          {/* Eyebrows */}
          <path d="M115,120 Q125,115 135,120" stroke="#4B5563" strokeWidth="2" fill="none" />
          <path d="M165,120 Q175,115 185,120" stroke="#4B5563" strokeWidth="2" fill="none" />
          
          {/* Nose */}
          <path d="M150,145 Q155,160 150,165" stroke="#E5A282" strokeWidth="2" fill="none" />
          
          {/* Mouth - this will animate */}
          <path 
            d={mouthState}
            stroke="#D24545" 
            strokeWidth="3" 
            fill="none"
          />
          
          {/* Ears */}
          <path d="M80,140 Q75,150 80,160 Q90,165 95,160 L95,140 Z" fill="#F4C2A6" />
          <path d="M220,140 Q225,150 220,160 Q210,165 205,160 L205,140 Z" fill="#F4C2A6" />
          
          {/* Shoulders */}
          <path d="M110,220 Q90,230 80,260" stroke="#6B7280" strokeWidth="3" fill="none" />
          <path d="M190,220 Q210,230 220,260" stroke="#6B7280" strokeWidth="3" fill="none" />
        </svg>
      </div>
    </div>
  );
};

export default AnimatedAvatar;
