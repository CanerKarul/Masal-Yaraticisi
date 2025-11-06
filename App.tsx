
import React, { useState } from 'react';
import StoryGenerator from './components/StoryGenerator';
import StoryReader from './components/StoryReader';
import { type Story } from './types';

function App() {
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStoryGenerated = (generatedStory: Story) => {
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

  return (
    <div className="min-h-screen bg-blue-100 text-gray-800 flex flex-col items-center p-4">
      <header className="w-full max-w-4xl text-center mb-6">
        <h1 className="text-4xl md:text-6xl font-extrabold text-yellow-500" style={{ textShadow: '2px 2px 0 #4A90E2, -2px -2px 0 #4A90E2, 2px -2px 0 #4A90E2, -2px 2px 0 #4A90E2' }}>
          Masal Yaratıcısı
        </h1>
        <p className="text-lg text-blue-700 mt-2">Yapay zeka ile kendi masalını yarat!</p>
      </header>
      <main className="w-full max-w-4xl flex-grow">
        {!story && (
          <StoryGenerator
            onStoryGenerated={handleStoryGenerated}
            onGenerationStart={handleGenerationStart}
            onGenerationError={handleGenerationError}
            isLoading={isLoading}
          />
        )}
        {isLoading && !story && (
          <div className="flex flex-col items-center justify-center bg-white/70 rounded-2xl p-8 mt-4 shadow-lg">
             <div className="w-16 h-16 border-8 border-yellow-400 border-dotted rounded-full animate-spin"></div>
             <p className="mt-4 text-blue-800 text-xl font-semibold text-center">
                Masalınız hazırlanıyor...<br/>Resimler ve sesler oluşturuluyor, bu işlem biraz zaman alabilir.
            </p>
          </div>
        )}
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mt-4" role="alert">
                <p className="font-bold">Bir hata oluştu!</p>
                <p>{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-2 px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
                >
                  Tekrar Dene
                </button>
            </div>
        )}
        {story && <StoryReader story={story} onReset={handleReset} />}
      </main>
       <footer className="w-full max-w-4xl text-center mt-8 text-sm text-blue-500">
        <p>Çocuklar için sevgiyle yapılmıştır.</p>
      </footer>
    </div>
  );
}

export default App;
