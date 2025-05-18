
import { useEffect, useState } from 'react';

interface AnimatedOtterProps {
  speaking: boolean;
}

const AnimatedOtter: React.FC<AnimatedOtterProps> = ({ speaking }) => {
  const [waveClass, setWaveClass] = useState('');
  
  useEffect(() => {
    if (speaking) {
      setWaveClass('animate-wave');
    } else {
      setWaveClass('');
    }
  }, [speaking]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className={`animate-float ${waveClass} w-full h-full max-w-[300px]`}>
        <svg 
          viewBox="0 0 300 400" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Otter body */}
          <ellipse cx="150" cy="230" rx="100" ry="120" fill="#9B7B55" />
          
          {/* Otter face */}
          <circle cx="150" cy="150" r="70" fill="#BF9D7A" />
          
          {/* Otter ears */}
          <ellipse cx="100" cy="110" rx="25" ry="30" fill="#9B7B55" />
          <ellipse cx="200" cy="110" rx="25" ry="30" fill="#9B7B55" />
          
          {/* Eyes */}
          <g className="animate-blink">
            <circle cx="130" cy="140" r="12" fill="#333333" />
            <circle cx="170" cy="140" r="12" fill="#333333" />
            
            <circle cx="126" cy="136" r="4" fill="white" />
            <circle cx="166" cy="136" r="4" fill="white" />
          </g>
          
          {/* Nose */}
          <ellipse cx="150" cy="165" rx="15" ry="10" fill="#333333" />
          
          {/* Mouth */}
          <path 
            d={speaking ? "M130,180 Q150,195 170,180" : "M130,180 Q150,185 170,180"} 
            stroke="#333333" 
            strokeWidth="3" 
            fill="none"
          />
          
          {/* Paws */}
          <ellipse cx="100" cy="340" rx="25" ry="15" fill="#BF9D7A" />
          <ellipse cx="200" cy="340" rx="25" ry="15" fill="#BF9D7A" />
          
          {/* Bowtie or accessory */}
          <path d="M140,200 L130,210 L140,220 L160,220 L170,210 L160,200 Z" fill="#4A6FA5" />
          <circle cx="150" cy="210" r="5" fill="#FFD700" />
        </svg>
      </div>
    </div>
  );
};

export default AnimatedOtter;
