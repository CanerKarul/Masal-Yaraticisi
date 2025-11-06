import React, { useState } from 'react';
import { generateStoryWithAssets } from '../services/geminiService';
import { type Story } from '../types';

interface StoryGeneratorProps {
  onStoryGenerated: (story: Story) => void;
  onGenerationStart: () => void;
  onGenerationError: (error: string) => void;
  isLoading: boolean;
}

const StoryGenerator: React.FC<StoryGeneratorProps> = ({ 
  onStoryGenerated, 
  onGenerationStart, 
  onGenerationError,
  isLoading 
}) => {
  const [prompt, setPrompt] = useState('');
  const [childName, setChildName] = useState('');
  const [pageCount, setPageCount] = useState(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      onGenerationError("Lütfen bir masal konusu girin.");
      return;
    }
    onGenerationStart();
    try {
      const story = await generateStoryWithAssets(prompt, childName, pageCount);
      onStoryGenerated(story);
    } catch (error) {
      if (error instanceof Error) {
        onGenerationError(error.message);
      } else {
        onGenerationError("Bilinmeyen bir hata oluştu.");
      }
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg border border-blue-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="prompt" className="block text-lg font-bold text-blue-800 mb-2">
            Nasıl bir masal hayal ediyorsun?
          </label>
          <input
            type="text"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Örn: Uçan bir fil ve arkadaşı tavşan"
            className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:ring-4 focus:ring-yellow-300 focus:border-yellow-500 transition text-gray-800 bg-white"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="childName" className="block text-lg font-bold text-blue-800 mb-2">
                    Kahramanın Adı (isteğe bağlı)
                </label>
                <input
                    type="text"
                    id="childName"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Örn: Ada"
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:ring-4 focus:ring-yellow-300 focus:border-yellow-500 transition text-gray-800 bg-white"
                    disabled={isLoading}
                />
            </div>
            <div>
              <label htmlFor="pageCount" className="block text-lg font-bold text-blue-800 mb-2">
                Sayfa Sayısı: {pageCount}
              </label>
              <input
                type="range"
                id="pageCount"
                min="3"
                max="10"
                value={pageCount}
                onChange={(e) => setPageCount(Number(e.target.value))}
                className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                disabled={isLoading}
              />
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 bg-red-500 text-white text-2xl font-extrabold rounded-xl shadow-md hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 transform hover:scale-105 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? 'Oluşturuluyor...' : 'Masalı Yarat!'}
        </button>
      </form>
    </div>
  );
};

export default StoryGenerator;