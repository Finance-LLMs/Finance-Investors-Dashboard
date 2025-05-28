import { useState, useEffect, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Loader } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import AnimatedAvatar from './AnimatedAvatar';
import { fetchVoices, transcribeAudio, getDebateResponse, textToSpeech, Voice } from '@/lib/api';


const debateTopics = [
  { id: 'ai-decisions', value: 'Allowing AI to override human decisions' },
];

const stanceOptions = [
  { id: 'for', value: 'For the motion' },
  { id: 'against', value: 'Against the motion' },
];

interface Message {
  role: 'user' | 'ai';
  text: string;
  audio?: string;
}

const DebateInterface = () => {
  const [topic, setTopic] = useState<string | undefined>();
  const [stance, setStance] = useState<string | undefined>();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debateText, setDebateText] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);    // Load available voices when component mounts
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const availableVoices = await fetchVoices();
        setVoices(availableVoices);
        
        // Set default male voice ID
        setSelectedVoice("iP95p4xoKVk53GoZ742B");
      } catch (error) {
        console.error('Failed to load voices:', error);
        toast({
          title: "Error loading voices",
          description: "Could not load available voices. Please try again later.",
          variant: "destructive",
        });
      }
    };
    
    loadVoices();
  }, [toast]);
  
  const startRecording = async () => {
    if (!topic || !stance) {
      toast({
        title: "Missing information",
        description: "Please select a topic and your stance before starting the debate.",
        variant: "destructive",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processUserInput(audioBlob);
        
        // Stop the audio tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Speak your argument and click 'Stop Recording' when finished.",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access failed",
        description: "Could not access your microphone. Please check your browser permissions.",
        variant: "destructive",
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const processUserInput = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      
      // Step 1: Transcribe audio to text
      const userText = await transcribeAudio(audioBlob);
      if (!userText) {
        throw new Error("Transcription returned empty text");
      }
      
      // Create a URL for the audio blob for playback
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Add user message to chat history
      const userMessage: Message = {
        role: 'user', 
        text: userText,
        audio: audioUrl
      };
      
      setChatHistory(prev => [...prev, userMessage]);
      setDebateText(userText);
      
      // Step 2: Generate AI debate response
      const debateRound = Math.floor(chatHistory.length / 2) + 1;
      const aiSide = stance === 'for' ? 'against' : 'for';
      
      // Prepare history for the API in the format expected by the backend
      const historyPairs: [string, string][] = [];
      for (let i = 0; i < chatHistory.length; i += 2) {
        if (i + 1 < chatHistory.length) {
          historyPairs.push([
            chatHistory[i].text,
            chatHistory[i + 1].text
          ]);
        }
      }
      
      // Get AI response
      const aiResponse = await getDebateResponse(
        userText,
        historyPairs,
        aiSide,
        debateRound
      );
      
      // Step 3: Convert AI response to speech
      const aiAudioUrl = await textToSpeech(aiResponse, selectedVoice);
        // Add AI message to chat history
      const aiMessage: Message = {
        role: 'ai',
        text: aiResponse,
        audio: aiAudioUrl
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
      setDebateText(aiResponse);
      
      console.log('🔊 [DEBUG] Playing AI response audio...');
      
      // Play the audio response
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = aiAudioUrl;
        audioPlayerRef.current.onplay = () => {
          console.log('🔊 [DEBUG] Audio playback started');
          setIsSpeaking(true);
        };
        audioPlayerRef.current.onended = () => {
          console.log('🔊 [DEBUG] Audio playback ended');
          setIsSpeaking(false);
        };
        audioPlayerRef.current.play();
      }
      
      console.log('✅ [DEBUG] User input processing completed successfully');
      
    } catch (error) {
      console.error('❌ [DEBUG] Error processing user input:', error);
      toast({
        title: "Processing error",
        description: "An error occurred while processing your input. Please try again.",
        variant: "destructive",
      });
    } finally {      setIsProcessing(false);
    }
  };
  // Reset the debate
  const resetDebate = () => {
    setChatHistory([]);
    setDebateText('');
    
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    
    toast({
      title: "Debate reset",
      description: "Starting a new debate. Select a topic and stance to begin.",
    });  };  return (
    <div className="h-screen w-screen flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 scale-150 origin-center overflow-hidden fixed inset-0">
      {/* Hidden audio player for AI speech */}
      <audio ref={audioPlayerRef} className="hidden" />
      
      <Card className="w-full max-w-[380px] p-5 bg-debater-primary rounded-2xl shadow-lg">        <div className="flex items-center gap-4 mb-5">
          <div className="bg-debater-button text-white p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
              <path d="M12 14l-6.16-3.422a12.083 12.083 0 00-.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 006.824-2.998 12.078 12.078 0 00-.665-6.479L12 14z"></path>
            </svg>
          </div>          <div>
            <h2 className="text-2xl font-bold text-white">AI Debater</h2>
            <p className="text-debater-secondary text-base">Engage in a formal debate with AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-5"><div>
            <label htmlFor="topic" className="block text-white text-sm mb-2">Debate Topic</label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger id="topic" className="border-debater-secondary bg-white text-sm h-10">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {debateTopics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>{topic.value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>          <div>
            <label htmlFor="stance" className="block text-white text-sm mb-2">Your Stance</label>
            <Select value={stance} onValueChange={setStance}>
              <SelectTrigger id="stance" className="border-debater-secondary bg-white text-sm h-10">
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

        {!isRecording ? (
          <Button 
            onClick={startRecording} 
            disabled={isSpeaking || isProcessing}
            className="w-full flex items-center justify-center gap-2 bg-debater-button hover:bg-opacity-90 text-white py-3 px-6 rounded-full transition-all text-sm"
          >            <Mic size={20} />
            Start Recording
          </Button>
        ) : (
          <Button 
            onClick={stopRecording} 
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 bg-destructive hover:bg-opacity-90 text-white py-3 px-6 rounded-full transition-all text-sm"
          >            <StopCircle size={20} />
            Stop Recording
          </Button>
        )}
      </Card>

      <div className="bg-debater-secondary w-full max-w-[280px] h-[320px] rounded-2xl overflow-hidden shadow-lg">
        <AnimatedAvatar speaking={isSpeaking} />
      </div>
    </div>
  );
};

export default DebateInterface;
