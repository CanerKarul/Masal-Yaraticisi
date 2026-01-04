import React, { useState, useCallback } from 'react';
import StoryGenerator from './components/StoryGenerator';
import StoryReader from './components/StoryReader';
import { type Story } from './types';

function App() {
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Called when the TEXT structure is ready. Assets (images/audio) might still be null.
  const handleStoryStructureGenerated = (generatedStory: Story) => {
    setStory(generatedStory);
    setIsLoading(false);
    setError(null);
  };

  const handleGenerationStart = () => {
    setIsLoading(true);
    setStory(null);
    setError(null);
  };

  const handleGenerationError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };
  
  const handleReset = () => {
    setStory(null);
    setError(null);
    setIsLoading(false);
  };

  // Callback to update specific page assets when they are lazy-loaded by the Reader
  const handleUpdatePageAssets = useCallback((pageIndex: number, assets: { image?: string | null, audio?: string | null }) => {
    setStory(prevStory => {
      if (!prevStory) return null;
      
      // Create a shallow copy of the pages array
      const newPages = [...prevStory.pages];
      
      // Update the specific page safely
      if (newPages[pageIndex]) {
        newPages[pageIndex] = {
          ...newPages[pageIndex],
          // Only update if value is provided and not null/undefined
          image_url: assets.image !== undefined ? assets.image : newPages[pageIndex].image_url,
          audio_url: assets.audio !== undefined ? assets.audio : newPages[pageIndex].audio_url,
        };
      }
      
      return {
        ...prevStory,
        pages: newPages
      };
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-200 text-gray-800 flex flex-col items-center p-4 md:p-8 font-sans">
      <header className="w-full max-w-5xl text-center mb-8 md:mb-12 pt-4">
        <h1 className="text-5xl md:text-7xl font-extrabold text-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)] tracking-tight font-comic" 
            style={{ WebkitTextStroke: '2px #2563EB' }}>
          Masal Yaratıcısı
        </h1>
        <p className="text-xl md:text-2xl text-blue-800 mt-3 font-medium opacity-90">Gemini 3 ile sihirli hikayeler oluşturun</p>
      </header>
      
      <main className="w-full max-w-4xl flex-grow flex flex-col items-center">
        {!story && (
          <div className="w-full transition-all duration-500 transform hover:scale-[1.01]">
            <StoryGenerator
              onStoryGenerated={handleStoryStructureGenerated}
              onGenerationStart={handleGenerationStart}
              onGenerationError={handleGenerationError}
              isLoading={isLoading}
            />
          </div>
        )}
        
        {isLoading && !story && (
          <div className="flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl p-10 mt-8 shadow-2xl animate-pulse border border-white/50 w-full max-w-md">
             <div className="relative">
                <div className="w-20 h-20 border-8 border-blue-200 border-t-yellow-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                </div>
             </div>
             <p className="mt-6 text-blue-900 text-2xl font-bold text-center">
                Masal Yazılıyor...
            </p>
             <p className="mt-2 text-blue-600 text-center font-medium">
                Gemini 3 hayal kuruyor.
            </p>
          </div>
        )}
        
        {error && (
            <div className="bg-red-50 border-l-8 border-red-500 text-red-800 p-6 rounded-xl mt-6 shadow-lg max-w-2xl w-full flex items-start gap-4" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-grow">
                    <h3 className="font-bold text-lg mb-1">Bir sorun oluştu</h3>
                    <p className="mb-4 text-red-700/80">{error}</p>
                    <button
                    onClick={handleReset}
                    className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors shadow-md focus:ring-4 focus:ring-red-200"
                    >
                    Tekrar Dene
                    </button>
                </div>
            </div>
        )}
        
        {story && (
            <StoryReader 
                story={story} 
                onReset={handleReset} 
                onUpdatePageAssets={handleUpdatePageAssets} 
            />
        )}
      </main>
      
       <footer className="w-full text-center mt-12 text-sm text-blue-600/70 pb-6 font-medium">
        <p>Google Gemini 3 API teknolojisi ile geliştirilmiştir.</p>
      </footer>
    </div>
  );
}

export default App;