
import { useEffect, useState } from 'react';

interface AnimatedOtterProps {
  speaking: boolean;
}

const AnimatedOtter: React.FC<AnimatedOtterProps> = ({ speaking }) => {
  const [mouthState, setMouthState] = useState('M130,180 Q150,185 170,180');
  
  useEffect(() => {
    let mouthInterval: NodeJS.Timeout | null = null;
    
    if (speaking) {
      // Create mouth animation when speaking
      mouthInterval = setInterval(() => {
        setMouthState(prev => 
          prev === 'M130,180 Q150,185 170,180' 
            ? 'M130,180 Q150,195 170,180' 
            : 'M130,180 Q150,185 170,180'
        );
      }, 200);
    } else {
      setMouthState('M130,180 Q150,185 170,180');
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
          {/* Otter body */}
          <ellipse cx="150" cy="240" rx="70" ry="110" fill="#9B7B55" />
          
          {/* Otter lighter belly/chest */}
          <ellipse cx="150" cy="240" rx="40" ry="95" fill="#D8BFA0" />
          
          {/* Tail */}
          <path d="M100,320 Q80,350 100,380 Q130,390 150,350" fill="#9B7B55" />
          
          {/* Legs/Paws */}
          <ellipse cx="120" cy="330" rx="20" ry="15" fill="#9B7B55" />
          <ellipse cx="180" cy="330" rx="20" ry="15" fill="#9B7B55" />
          
          {/* Otter head */}
          <circle cx="150" cy="145" r="65" fill="#9B7B55" />
          
          {/* Lighter face area */}
          <path d="M120,160 Q150,190 180,160 Q180,120 150,110 Q120,120 120,160" fill="#D8BFA0" />
          
          {/* Eyes */}
          <g className="animate-blink">
            <circle cx="125" cy="135" r="14" fill="#000000" />
            <circle cx="175" cy="135" r="14" fill="#000000" />
            
            <circle cx="130" cy="130" r="5" fill="white" />
            <circle cx="180" cy="130" r="5" fill="white" />
          </g>
          
          {/* Nose */}
          <ellipse cx="150" cy="160" rx="15" ry="10" fill="#000000" />
          
          {/* Small whiskers */}
          <path d="M120,165 L100,160" stroke="#333333" strokeWidth="1.5" />
          <path d="M120,170 L100,170" stroke="#333333" strokeWidth="1.5" />
          <path d="M180,165 L200,160" stroke="#333333" strokeWidth="1.5" />
          <path d="M180,170 L200,170" stroke="#333333" strokeWidth="1.5" />
          
          {/* Mouth - this will animate */}
          <path 
            d={mouthState}
            stroke="#333333" 
            strokeWidth="3" 
            fill="none"
          />
          
          {/* Small round ears */}
          <circle cx="110" cy="100" r="20" fill="#9B7B55" />
          <circle cx="190" cy="100" r="20" fill="#9B7B55" />
          <circle cx="110" cy="100" r="10" fill="#D8BFA0" />
          <circle cx="190" cy="100" r="10" fill="#D8BFA0" />
        </svg>
      </div>
    </div>
  );
};

export default AnimatedOtter;
