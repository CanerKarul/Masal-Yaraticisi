import React, { useState } from 'react';
import StoryPage from './StoryPage';
import { type Story } from '../types';

interface StoryReaderProps {
  story: Story;
  onReset: () => void;
}

const speedOptions = [
    { label: 'Yavaş', value: 0.75 },
    { label: 'Normal', value: 1 },
    { label: 'Hızlı', value: 1.5 },
];

const StoryReader: React.FC<StoryReaderProps> = ({ story, onReset }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

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
      <div className="w-full bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-xl border border-blue-200">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-800">{story.title}</h2>
        <h3 className="text-md md:text-lg text-center text-blue-600 mb-4">{story.subtitle}</h3>
        
        <div className="relative">
          <StoryPage key={currentPageIndex} page={story.pages[currentPageIndex]} playbackRate={playbackRate} />
          
          {!isFirstPage && (
            <button 
              onClick={goToPreviousPage} 
              className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-yellow-400 text-blue-800 rounded-full p-3 shadow-lg hover:bg-yellow-500 transition transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-300 z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {!isLastPage && (
            <button 
              onClick={goToNextPage} 
              className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-yellow-400 text-blue-800 rounded-full p-3 shadow-lg hover:bg-yellow-500 transition transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-300 z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
                <span className="text-blue-700 font-semibold">Okuma Hızı:</span>
                <div className="flex gap-1 bg-blue-200 p-1 rounded-full">
                {speedOptions.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setPlaybackRate(opt.value)}
                        className={`px-3 py-1 text-sm font-bold rounded-full transition-colors ${
                            playbackRate === opt.value
                            ? 'bg-yellow-400 text-blue-900 shadow'
                            : 'bg-transparent text-blue-600 hover:bg-blue-300'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
                </div>
            </div>
            <div className="text-blue-700 font-semibold">
                Sayfa {currentPageIndex + 1} / {story.pages.length}
            </div>
        </div>
      </div>
      
      <button 
        onClick={onReset}
        className="mt-6 py-3 px-8 bg-green-500 text-white text-xl font-bold rounded-xl shadow-md hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 transform hover:scale-105 transition-all">
        Yeni Masal Yarat
      </button>
    </div>
  );
};

export default StoryReader;