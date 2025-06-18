
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface VoiceInterfaceProps {
  onTranscription: (text: string) => void;
  autoSpeak?: boolean;
  lastMessage?: string;
}

export default function VoiceInterface({ onTranscription, autoSpeak = false, lastMessage }: VoiceInterfaceProps) {
  const { speak, stop: stopSpeaking, isSpeaking, voices } = useTextToSpeech();
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  
  const [voiceSettings, setVoiceSettings] = useState({
    voice: '',
    rate: 0.9,
    pitch: 1,
    volume: 0.8
  });

  // Auto-speak AI responses when enabled
  useEffect(() => {
    if (autoSpeak && lastMessage && lastMessage.trim()) {
      // Small delay to ensure message is fully rendered
      setTimeout(() => {
        speak(lastMessage, voiceSettings);
      }, 500);
    }
  }, [lastMessage, autoSpeak, speak, voiceSettings]);

  // Handle transcript changes
  useEffect(() => {
    if (transcript && !isListening) {
      onTranscription(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, onTranscription, resetTranscript]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSpeakToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak("Hello! I'm Dekolzee Bot, ready to assist you!", voiceSettings);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleVoiceToggle}
        className={`h-11 w-11 p-0 rounded-xl ${
          isListening 
            ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 animate-pulse' 
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSpeakToggle}
        className={`h-11 w-11 p-0 rounded-xl ${
          isSpeaking 
            ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 animate-pulse' 
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        title={isSpeaking ? 'Stop speaking' : 'Test voice output'}
      >
        {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-11 w-11 p-0 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Voice settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h4 className="font-medium leading-none">Voice Settings</h4>
            
            <div className="space-y-2">
              <Label htmlFor="voice">Voice</Label>
              <Select value={voiceSettings.voice} onValueChange={(value) => 
                setVoiceSettings(prev => ({ ...prev, voice: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Speed: {voiceSettings.rate}</Label>
              <Slider
                value={[voiceSettings.rate]}
                onValueChange={([value]) => 
                  setVoiceSettings(prev => ({ ...prev, rate: value }))
                }
                min={0.5}
                max={2}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <Label>Pitch: {voiceSettings.pitch}</Label>
              <Slider
                value={[voiceSettings.pitch]}
                onValueChange={([value]) => 
                  setVoiceSettings(prev => ({ ...prev, pitch: value }))
                }
                min={0.5}
                max={2}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <Label>Volume: {voiceSettings.volume}</Label>
              <Slider
                value={[voiceSettings.volume]}
                onValueChange={([value]) => 
                  setVoiceSettings(prev => ({ ...prev, volume: value }))
                }
                min={0}
                max={1}
                step={0.1}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
