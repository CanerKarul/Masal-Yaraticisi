import React, { useState, useEffect, useRef } from 'react';
import { type Page } from '../types';
import { decode, decodeAudioData } from '../utils/audioUtils';

interface StoryPageProps {
  page: Page;
  playbackRate: number;
}

const AssetError: React.FC<{ message: string }> = ({ message }) => (
    <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-700 p-4 text-center">
        {message}
    </div>
);

const StoryPage: React.FC<StoryPageProps> = ({ page, playbackRate }) => {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<{audio?: string, image?: string}>({});
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Initialize AudioContext on first component mount
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    // Set image error if URL is missing
    if (!page.image_url) {
        setError(prev => ({ ...prev, image: 'Resim oluşturulamadı.'}));
    }

    const processAudio = async () => {
      setIsProcessingAudio(true);
      setAudioBuffer(null);
      setError(prev => ({...prev, audio: undefined}));
      setIsPlaying(false);

      if (!page.audio_url) {
        setError(prev => ({...prev, audio: 'Ses verisi bulunamadı.'}));
        setIsProcessingAudio(false);
        return;
      }
      
      try {
        const base64Audio = page.audio_url;
        const decodedBytes = decode(base64Audio);
        if (!audioContextRef.current) throw new Error("AudioContext not initialized");
        const buffer = await decodeAudioData(decodedBytes, audioContextRef.current, 24000, 1);
        setAudioBuffer(buffer);
      } catch (e) {
         setError(prev => ({...prev, audio: 'Ses verisi işlenemedi.'}));
         console.error(e);
      } finally {
         setIsProcessingAudio(false);
      }
    };

    processAudio();
    
    // Cleanup function to stop audio when page changes
    return () => {
      if (audioSourceRef.current) {
        try {
            audioSourceRef.current.stop();
        } catch (e) {
            // Ignore error if audio has already stopped
        }
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
        setIsPlaying(false);
      }
    };
  }, [page]);

  const handlePlayPause = () => {
    if (!audioContextRef.current || !audioBuffer) return;

    // Resume context if it was suspended
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }

    if (isPlaying && audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
      setIsPlaying(false);
    } else {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = playbackRate; // Set playback speed
      source.connect(audioContextRef.current.destination);
      source.start();
      source.onended = () => {
        setIsPlaying(false);
        audioSourceRef.current = null;
      };
      audioSourceRef.current = source;
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-[4/3] w-full bg-blue-200 rounded-lg overflow-hidden shadow-inner border-4 border-white">
        {page.image_url ? (
          <img src={page.image_url} alt={page.image_prompt} className="w-full h-full object-cover" />
        ) : (
          <AssetError message={error.image || 'Resim yükleniyor...'} />
        )}
      </div>
      <div className="flex items-center gap-4 bg-blue-100 p-4 rounded-lg">
          <button 
            onClick={handlePlayPause}
            disabled={isProcessingAudio || !audioBuffer}
            className="flex-shrink-0 bg-red-500 text-white rounded-full p-3 shadow-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-wait transition transform hover:scale-110"
            aria-label={isPlaying ? "Sesi Durdur" : "Sesi Oynat"}
          >
            {isProcessingAudio ? (
                 <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <p className="text-lg md:text-xl text-blue-900 leading-relaxed font-medium" style={{ fontFamily: "'Comic Neue', cursive" }}>
            {error.audio ? <span className="text-red-600">({error.audio})</span> : page.text}
          </p>
      </div>
    </div>
  );
};

export default StoryPage;