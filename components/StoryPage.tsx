import React, { useState, useEffect, useRef } from 'react';
import { type Page } from '../types';
import { decode, decodeAudioData } from '../utils/audioUtils';

interface StoryPageProps {
  page: Page;
  playbackRate: number;
}

const ImageSkeleton = () => (
    <div className="w-full h-full bg-slate-100 animate-pulse flex flex-col items-center justify-center text-slate-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[shimmer_1.5s_infinite]"></div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-semibold tracking-wider">RESİM ÇİZİLİYOR...</span>
    </div>
);

const StoryPage: React.FC<StoryPageProps> = ({ page, playbackRate }) => {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Re-initialize audio when the page content changes (specifically the audio_url)
  useEffect(() => {
    // 1. Setup Audio Context if needed
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    // 2. Reset local state
    setAudioBuffer(null);
    setIsPlaying(false);
    if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch(e) {}
        audioSourceRef.current = null;
    }

    // 3. Decode if URL exists
    if (page.audio_url) {
        const processAudio = async () => {
          setIsProcessingAudio(true);
          try {
            const base64Audio = page.audio_url!;
            const decodedBytes = decode(base64Audio);
            
            // Resume context if suspended (browser autoplay policy)
            if (audioContextRef.current?.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            if (!audioContextRef.current) return;
            
            const buffer = await decodeAudioData(decodedBytes, audioContextRef.current, 24000, 1);
            setAudioBuffer(buffer);
          } catch (e) {
             console.error("Audio decoding failed", e);
          } finally {
             setIsProcessingAudio(false);
          }
        };
        processAudio();
    }
    
    return () => {
      if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch (e) {}
        audioSourceRef.current = null;
      }
    };
  }, [page.audio_url]); // Only re-run if the audio data actually changes

  const handlePlayPause = async () => {
    if (!audioContextRef.current || !audioBuffer) return;

    if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
    }

    if (isPlaying && audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
      setIsPlaying(false);
    } else {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = playbackRate;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        setIsPlaying(false);
        audioSourceRef.current = null;
      };
      source.start();
      audioSourceRef.current = source;
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Image Container */}
      <div className="aspect-[4/3] w-full bg-white rounded-2xl overflow-hidden shadow-lg border-4 border-white ring-1 ring-blue-100 transform transition-all hover:scale-[1.01]">
        {page.image_url ? (
          <img 
            src={page.image_url} 
            alt={page.image_prompt} 
            className="w-full h-full object-cover animate-fade-in" 
            loading="lazy"
          />
        ) : (
          <ImageSkeleton />
        )}
      </div>

      {/* Text and Audio Control */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 shadow-sm">
          
          {/* Play Button */}
          <button 
            onClick={handlePlayPause}
            disabled={!audioBuffer} // Only disable if buffer is missing
            className={`flex-shrink-0 group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300
                ${!audioBuffer 
                    ? 'bg-slate-200 cursor-not-allowed' 
                    : isPlaying 
                        ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-200' 
                        : 'bg-green-500 hover:bg-green-600 ring-4 ring-green-200'
                }
            `}
            aria-label={isPlaying ? "Sesi Durdur" : "Sesi Oynat"}
          >
            {!audioBuffer ? (
                 // Loading Spinner for Audio
                 isProcessingAudio ? (
                    <svg className="animate-spin h-6 w-6 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                 ) : (
                    // Placeholder icon if no audio yet (waiting for generation)
                     <span className="h-2 w-2 bg-slate-400 rounded-full animate-pulse"></span>
                 )
            ) : isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          
          {/* Text Content */}
          <div className="flex-grow">
            <p className="text-xl md:text-2xl text-blue-900 leading-relaxed font-medium" style={{ fontFamily: "'Comic Neue', cursive" }}>
                {page.text}
            </p>
          </div>
      </div>
    </div>
  );
};

export default StoryPage;