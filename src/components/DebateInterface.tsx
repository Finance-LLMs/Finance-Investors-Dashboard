
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import AnimatedOtter from './AnimatedOtter';

const debateTopics = [
  { id: 'ai-decisions', value: 'Allowing AI to override human decisions' },
  { id: 'universal-income', value: 'Universal Basic Income is necessary' },
  { id: 'social-media', value: 'Social media does more harm than good' },
  { id: 'remote-work', value: 'Remote work should be the new normal' },
  { id: 'climate-action', value: 'Climate action should take priority over economic growth' },
];

const stanceOptions = [
  { id: 'for', value: 'For the motion' },
  { id: 'against', value: 'Against the motion' },
];

const DebateInterface = () => {
  const [topic, setTopic] = useState<string | undefined>();
  const [stance, setStance] = useState<string | undefined>();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [debateText, setDebateText] = useState<string>('');
  const { toast } = useToast();

  const handleStartSpeaking = () => {
    if (!topic || !stance) {
      toast({
        title: "Missing information",
        description: "Please select a topic and your stance before starting the debate.",
        variant: "destructive",
      });
      return;
    }

    setIsSpeaking(true);
    
    // Simulate AI generating debate text
    setDebateText('');
    const fullText = getDebateText(topic, stance);
    let index = 0;
    
    const textInterval = setInterval(() => {
      if (index < fullText.length) {
        setDebateText((prev) => prev + fullText.charAt(index));
        index++;
      } else {
        clearInterval(textInterval);
        setTimeout(() => {
          setIsSpeaking(false);
        }, 1000);
      }
    }, 30);
  };

  // Simple mock debate text generator
  const getDebateText = (topicId: string, stanceId: string): string => {
    const selectedTopic = debateTopics.find(t => t.id === topicId)?.value;
    const isFor = stanceId === 'for';
    
    const intros = [
      `As a debater ${isFor ? 'for' : 'against'} the motion that "${selectedTopic}", I would like to present several key points.`,
      `When considering whether ${selectedTopic}, we must ${isFor ? 'acknowledge the benefits' : 'consider the drawbacks'}.`,
      `I stand ${isFor ? 'firmly for' : 'strongly against'} the notion that ${selectedTopic}.`,
    ];
    
    const randomIntro = intros[Math.floor(Math.random() * intros.length)];
    
    if (isFor) {
      return `${randomIntro} First, this position leads to more efficient outcomes. Second, there are numerous examples of success when implementing this approach. Third, the ethical considerations strongly favor this stance. In conclusion, the evidence clearly supports being for this motion.`;
    } else {
      return `${randomIntro} First, this position presents significant risks we cannot ignore. Second, historical precedent shows the dangers of this approach. Third, there are better alternatives we should consider. To conclude, I firmly believe we should stand against this motion.`;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
      <Card className="w-full max-w-md p-6 md:p-8 bg-debator-primary rounded-2xl shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-debator-button text-white p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
              <path d="M12 14l-6.16-3.422a12.083 12.083 0 00-.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 006.824-2.998 12.078 12.078 0 00-.665-6.479L12 14z"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Debator</h2>
            <p className="text-debator-secondary text-sm">Engage in a formal debate with AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="topic" className="block text-white text-sm mb-2">Debate Topic</label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger id="topic" className="border-debator-secondary bg-white">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {debateTopics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>{topic.value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="stance" className="block text-white text-sm mb-2">Your Stance</label>
            <Select value={stance} onValueChange={setStance}>
              <SelectTrigger id="stance" className="border-debator-secondary bg-white">
                <SelectValue placeholder="Select stance" />
              </SelectTrigger>
              <SelectContent>
                {stanceOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>{option.value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-6 min-h-[100px] flex items-center">
          {debateText ? (
            <p className="text-debator-text">{debateText}</p>
          ) : (
            <div className="flex items-center justify-center w-full text-gray-400">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <span>Click "Start Speaking" to begin the debate...</span>
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={handleStartSpeaking} 
          disabled={isSpeaking}
          className="w-full md:w-auto mx-auto flex items-center justify-center gap-2 bg-debator-button hover:bg-opacity-90 text-white py-2 px-6 rounded-full transition-all"
        >
          <Mic size={20} />
          Start Speaking
        </Button>
      </Card>

      <div className="bg-debator-secondary w-full max-w-[300px] h-[350px] rounded-2xl overflow-hidden shadow-lg">
        <AnimatedOtter speaking={isSpeaking} />
      </div>
    </div>
  );
};

export default DebateInterface;
