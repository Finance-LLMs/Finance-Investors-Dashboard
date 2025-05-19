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
          {/* Background shadow for depth */}
          <ellipse cx="150" cy="380" rx="70" ry="10" fill="#E5E7EB" opacity="0.5" />
          
          {/* Feet/shoes */}
          <path d="M100,388 Q105,378 120,378 Q130,383 130,388 Z" fill="#4B5563" />
          <path d="M170,388 Q175,378 190,378 Q200,383 200,388 Z" fill="#4B5563" />
          
          {/* Legs with proper jeans */}
          <path d="M110,350 L105,388 L125,388 L130,350 Z" fill="#2563EB" />
          <path d="M190,350 L195,388 L175,388 L170,350 Z" fill="#2563EB" />
          
          {/* Jean details */}
          <path d="M110,350 L130,350" stroke="#1E40AF" strokeWidth="1" />
          <path d="M170,350 L190,350" stroke="#1E40AF" strokeWidth="1" />
          <path d="M113,360 L127,360" stroke="#1E40AF" strokeWidth="0.5" opacity="0.5" />
          <path d="M173,360 L187,360" stroke="#1E40AF" strokeWidth="0.5" opacity="0.5" />
          
          {/* Body/torso - realistic boy t-shirt */}
          <path d="M110,220 Q150,200 190,220 L190,350 L110,350 Z" fill="#3B82F6" />
          <path d="M110,220 L190,220 L190,350 L110,350 Z" stroke="#2563EB" strokeWidth="0.5" />
          
          {/* T-shirt details */}
          <path d="M135,240 L165,240 L160,260 L140,260 Z" fill="#60A5FA" opacity="0.6" />
          <path d="M130,220 L150,235 L170,220" stroke="#2563EB" strokeWidth="1.5" fill="none" />
          <path d="M110,270 Q130,260 150,270 Q170,260 190,270" stroke="#2563EB" strokeWidth="0.5" opacity="0.3" />
          
          {/* Arms */}
          <path d="M110,220 Q90,240 85,280 Q84,300 90,320" stroke="#C9A887" strokeWidth="16" strokeLinecap="round" />
          <path d="M190,220 Q210,240 215,280 Q216,300 210,320" stroke="#C9A887" strokeWidth="16" strokeLinecap="round" />
          
          {/* Hands */}
          <ellipse cx="90" cy="320" rx="10" ry="12" fill="#C9A887" />
          <ellipse cx="210" cy="320" rx="10" ry="12" fill="#C9A887" />          {/* Neck - more natural shape */}
          <path d="M140,190 Q150,195 160,190 L160,220 L140,220 Z" fill="#C9A887" />
              {/* Head shape - completely bald with slightly shinier scalp */}
          <ellipse cx="150" cy="140" rx="55" ry="65" fill="#C9A887" />

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
        
          
          {/* Mouth - with better animation */}
          <path 
            d={mouthState}
            stroke="#C27D7D" 
            strokeWidth="1.5" 
            fill="none"
          />          {/* Natural cheek shading */}
          <path d="M120,150 Q130,160 120,165" stroke="#B39578" strokeWidth="3" opacity="0.2" />
          <path d="M180,150 Q170,160 180,165" stroke="#B39578" strokeWidth="3" opacity="0.2" />
          
          {/* Mouth area subtle shading */}
          <path d="M140,170 Q150,175 160,170" stroke="#B39578" strokeWidth="1" opacity="0.3" />
          
          {/* Square glasses */}
          <path d="M105,130 L135,130 L135,145 L105,145 Z" fill="none" stroke="#31363F" strokeWidth="2" />
          <path d="M165,130 L195,130 L195,145 L165,145 Z" fill="none" stroke="#31363F" strokeWidth="2" />
          <path d="M135,137 L165,137" stroke="#31363F" strokeWidth="2" />
          <path d="M105,130 L95,125" stroke="#31363F" strokeWidth="2" />
          <path d="M195,130 L205,125" stroke="#31363F" strokeWidth="2" />
          
          {/* Ears with more detail */}
          <path d="M90,135 Q85,145 90,155 Q100,160 105,155 L102,135 Z" fill="#C9A887" />
          <path d="M95,140 Q93,145 95,150" stroke="#B39578" strokeWidth="1" opacity="0.6" />
          
          <path d="M210,135 Q215,145 210,155 Q200,160 195,155 L198,135 Z" fill="#C9A887" />
          <path d="M205,140 Q207,145 205,150" stroke="#B39578" strokeWidth="1" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
};

export default AnimatedAvatar;