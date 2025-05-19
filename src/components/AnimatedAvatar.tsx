
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
          
          {/* Head shape - more rounded like the reference */}
          <circle cx="150" cy="145" r="70" fill="#F4C2A6" />
          
          {/* Hair - styled more like the reference image with more volume on top */}
          <path d="M90,120 Q100,65 150,55 Q200,65 210,120 L210,140 Q190,120 150,120 Q110,120 90,140 Z" fill="#4B5563" />
          
          {/* Hair details - spiky top */}
          <path d="M110,80 L120,65 L130,75 L140,60 L150,70 L160,55 L170,70 L180,60 L190,75" stroke="#4B5563" strokeWidth="8" fill="#4B5563" />
          
          {/* Side hair */}
          <path d="M80,140 Q75,150 80,170 Q85,190 90,180 L95,140 Z" fill="#4B5563" />
          <path d="M220,140 Q225,150 220,170 Q215,190 210,180 L205,140 Z" fill="#4B5563" />
          
          {/* Glasses - rounder frames like the reference */}
          <path d="M105,135 Q115,130 125,135 Q135,140 145,135 Q155,130 165,135 Q175,140 185,135 Q195,130 195,135" 
                stroke="#333333" 
                strokeWidth="2" 
                fill="none" />
          {/* Left lens - rounder */}
          <circle cx="125" cy="135" r="15" stroke="#333333" strokeWidth="1.5" fill="none" />
          {/* Right lens - rounder */}
          <circle cx="175" cy="135" r="15" stroke="#333333" strokeWidth="1.5" fill="none" />
          {/* Temple arms */}
          <path d="M90,135 L110,135" stroke="#333333" strokeWidth="1.5" />
          <path d="M190,135 L210,135" stroke="#333333" strokeWidth="1.5" />
          
          {/* Eyes - slightly larger like the reference */}
          <g className="animate-blink">
            <ellipse cx="125" cy="135" rx="12" ry="7" fill="#FFFFFF" />
            <ellipse cx="175" cy="135" rx="12" ry="7" fill="#FFFFFF" />
            
            <circle cx="125" cy="135" r="5" fill="#000000" />
            <circle cx="175" cy="135" r="5" fill="#000000" />
            
            <circle cx="127" cy="133" r="1.5" fill="white" />
            <circle cx="177" cy="133" r="1.5" fill="white" />
          </g>
          
          {/* Eyebrows - fuller and more expressionable */}
          <path d="M110,118 Q125,112 140,118" stroke="#4B5563" strokeWidth="3" fill="none" />
          <path d="M160,118 Q175,112 190,118" stroke="#4B5563" strokeWidth="3" fill="none" />
          
          {/* Nose - smaller, cuter */}
          <path d="M150,145 Q153,158 150,160" stroke="#E5A282" strokeWidth="2" fill="none" />
          
          {/* Mouth - this will animate */}
          <path 
            d={mouthState}
            stroke="#D24545" 
            strokeWidth="3" 
            fill="none"
          />
          
          {/* Cheeks - slight blush like the reference */}
          <circle cx="120" cy="155" r="10" fill="#E5A282" opacity="0.4" />
          <circle cx="180" cy="155" r="10" fill="#E5A282" opacity="0.4" />
          
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
