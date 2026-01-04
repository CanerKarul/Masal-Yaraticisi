import React, { useState, useEffect, useRef } from 'react';
import StoryPage from './StoryPage';
import { type Story } from '../types';
import { generatePageAssets } from '../services/geminiService';

interface StoryReaderProps {
  story: Story;
  onReset: () => void;
  onUpdatePageAssets: (pageIndex: number, assets: { image?: string | null, audio?: string | null }) => void;
}

const speedOptions = [
    { label: 'Yavaş', value: 0.85 },
    { label: 'Normal', value: 1 },
    { label: 'Hızlı', value: 1.25 },
];

const StoryReader: React.FC<StoryReaderProps> = ({ story, onReset, onUpdatePageAssets }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // Track generation status to avoid duplicate calls
  const generatingPagesRef = useRef<Set<number>>(new Set());

  // Just-in-Time Asset Generation Logic
  const loadAssetsForPage = async (index: number) => {
    if (index < 0 || index >= story.pages.length) return;
    
    const page = story.pages[index];
    // Check if assets are already present
    const hasAssets = page.image_url && page.audio_url;
    
    if (hasAssets || generatingPagesRef.current.has(index)) return;

    generatingPagesRef.current.add(index);
    // Force a re-render to potentially show loading states if we were tracking it locally,
    // but here we rely on the asset being null in the 'story' prop to show skeleton.

    try {
        console.log(`Generating assets for page ${index + 1}...`);
        const assets = await generatePageAssets(page.tts_text, page.image_prompt);
        onUpdatePageAssets(index, assets);
    } catch (e) {
        console.error(`Failed to load assets for page ${index}`, e);
    } finally {
        generatingPagesRef.current.delete(index);
    }
  };

  useEffect(() => {
    // Strategy:
    // 1. Load current page assets (Priority High)
    loadAssetsForPage(currentPageIndex);

    // 2. Pre-load next page assets (Priority Medium) - "Look-ahead"
    const nextIndex = currentPageIndex + 1;
    if (nextIndex < story.pages.length) {
        // Small delay to let the UI settle / current page request start first
        const timer = setTimeout(() => loadAssetsForPage(nextIndex), 500);
        return () => clearTimeout(timer);
    }
  }, [currentPageIndex, story.pages]); 

  const goToNextPage = () => {
    setCurrentPageIndex((prev) => Math.min(prev + 1, story.pages.length - 1));
  };

  const goToPreviousPage = () => {
    setCurrentPageIndex((prev) => Math.max(prev - 1, 0));
  };
  
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === story.pages.length - 1;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-2xl border-2 border-blue-100">
        <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 drop-shadow-sm">{story.title}</h2>
            <h3 className="text-lg md:text-xl text-blue-600 font-medium mt-1">{story.subtitle}</h3>
        </div>
        
        <div className="relative min-h-[500px]">
          <StoryPage 
            key={currentPageIndex} 
            page={story.pages[currentPageIndex]} 
            playbackRate={playbackRate} 
          />
          
          {!isFirstPage && (
            <button 
              onClick={goToPreviousPage} 
              className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-2 md:-translate-x-6 bg-yellow-400 text-blue-900 rounded-full p-4 shadow-xl hover:bg-yellow-300 transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-200 z-10 border-4 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {!isLastPage && (
            <button 
              onClick={goToNextPage} 
              className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-2 md:translate-x-6 bg-yellow-400 text-blue-900 rounded-full p-4 shadow-xl hover:bg-yellow-300 transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-200 z-10 border-4 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 bg-blue-50 p-4 rounded-xl gap-4">
            <div className="flex items-center gap-3">
                <span className="text-blue-800 font-bold text-sm uppercase tracking-wide">Ses Hızı</span>
                <div className="flex gap-1 bg-white p-1 rounded-lg shadow-sm border border-blue-100">
                {speedOptions.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setPlaybackRate(opt.value)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                            playbackRate === opt.value
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-blue-400 hover:bg-blue-50'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
                </div>
            </div>
            <div className="text-blue-800 font-bold bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-100">
                Sayfa {currentPageIndex + 1} / {story.pages.length}
            </div>
        </div>
      </div>
      
      <button 
        onClick={onReset}
        className="mt-8 py-3 px-8 bg-white border-2 border-red-100 text-red-500 text-lg font-bold rounded-2xl shadow-sm hover:bg-red-50 hover:border-red-200 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
        Başa Dön
      </button>
    </div>
  );
};

export default StoryReader;