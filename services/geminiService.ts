import { GoogleGenAI, Modality, Type } from "@google/genai";
import { type Story } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set. Please check your .env file.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const storySchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Kısa ve çekici başlık (en fazla 15 karakter)." },
        subtitle: { type: Type.STRING, description: "İki cümlelik ilgi çekici alt başlık." },
        pages: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    page_number: { type: Type.INTEGER },
                    text: {
                        type: Type.STRING,
                        description: "Sayfanın metni, 120-150 kelime arası. Detaylı, akıcı ve masalsı bir dil kullan. Çocukların hayal gücünü harekete geçirecek betimlemeler ekle. Diyaloglar ve duygusal ifadeler kullan."
                    },
                    tts_text: {
                        type: Type.STRING,
                        description: "TTS için metin versiyonu. Noktalama işaretlerine dikkat et. Doğal okuma akışı için virgül ve nokta kullan. Diyaloglarda tonlamayı belirt."
                    },
                    image_prompt: {
                        type: Type.STRING,
                        description: "Görüntü oluşturma için çok detaylı, İngilizce prompt. Stil: 'Pixar style 3D render, vivid colors, cute characters, magical atmosphere, detailed background, warm lighting, child-friendly'. Karakterlerin duruşunu, ortamı, renkleri ve atmosferi detaylıca tanımla."
                    },
                    image_metadata: {
                        type: Type.OBJECT,
                        properties: {
                            style: { type: Type.STRING, description: "3d render" },
                            aspect_ratio: { type: Type.STRING, description: "4:3" },
                            seed: { type: Type.INTEGER, nullable: true },
                        },
                        required: ["style", "aspect_ratio"]
                    },
                    audio_url: { type: Type.STRING, nullable: true },
                },
                required: ["page_number", "text", "tts_text", "image_prompt", "image_metadata"]
            },
        },
        meta: {
            type: Type.OBJECT,
            properties: {
                page_count: { type: Type.INTEGER },
                estimated_duration_seconds: { type: Type.INTEGER },
            },
            required: ["page_count", "estimated_duration_seconds"]
        },
    },
    required: ["title", "subtitle", "pages", "meta"],
};

/**
 * Phase 1: Generate Story Structure (Text Only)
 * Uses Gemini 3 Pro for superior creative writing logic.
 */
export const generateStoryStructure = async (prompt: string, childName: string, pageCount: number): Promise<Story> => {
    // Upgrade to Gemini 3 Pro Preview for complex structure and creativity
    const model = 'gemini-3-pro-preview';

    const systemPrompt = `You are an expert children's book author and storyteller using the Gemini 3 engine. 
    
Target Audience: Ages 3-8 years old.
Language: Turkish (Türkçe).
Output Format: Strictly valid JSON matching the provided schema.

CONTENT REQUIREMENTS:
1. Create exactly ${pageCount} pages with rich, engaging content.
2. Each page should be 120-150 words long with detailed descriptions.
3. Use vivid imagery, emotions, and sensory details (colors, sounds, feelings).
4. Include dialogue between characters to make the story more engaging.
5. Create a clear story arc:
   - Beginning: Introduce the main character and setting (pages 1-2)
   - Middle: Present a challenge or adventure (middle pages)
   - End: Resolve the story with a positive, educational message (last page)
6. Use age-appropriate vocabulary with some new words to expand learning.
7. Include educational elements naturally (friendship, courage, kindness, problem-solving).

IMAGE PROMPT REQUIREMENTS:
1. Write detailed English prompts for Gemini Image generation.
2. Always include: "Pixar style 3D render, vivid colors, cute characters, magical atmosphere, detailed background, warm lighting, child-friendly"
3. Describe: character positions, facial expressions, environment details, colors, mood, lighting.
4. Keep consistency across pages (same character appearance, similar art style).

TTS TEXT REQUIREMENTS:
1. Add proper punctuation for natural speech rhythm.
2. Use commas for pauses, exclamation marks for excitement.
3. Make dialogue sound natural when read aloud.`;

    const userPrompt = `Write a magical children's story about: "${prompt}".
    
Main character name: "${childName || 'Bir çocuk'}".

Make this story:
- Engaging and full of wonder
- Educational with a positive message
- Rich in descriptive language
- Perfect for bedtime or learning time
- Memorable and heartwarming

Remember: Each page should be 120-150 words with detailed, vivid descriptions that bring the story to life!`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `${systemPrompt}\n\nUSER REQUEST:\n${userPrompt}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: storySchema,
                temperature: 0.8, // Increased for more creativity
            },
        });

        const storyJson = response.text;
        if (!storyJson) throw new Error("Empty response from model");

        return JSON.parse(storyJson) as Story;
    } catch (error) {
        console.error("Error generating story structure:", error);
        throw new Error("Hikaye iskeleti oluşturulurken bir sorun oluştu.");
    }
};

/**
 * Generates an image using Gemini 2.5 Flash Image model.
 */
export const generateImage = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "4:3",
                }
            },
        });

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};

/**
 * Generates audio using Gemini 2.5 Flash TTS.
 */
export const generateAudio = async (text: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating audio:", error);
        return null;
    }
};

/**
 * Phase 2: Orchestrator to generate assets for a single page on demand.
 */
export const generatePageAssets = async (pageText: string, imagePrompt: string): Promise<{ image: string | null, audio: string | null }> => {
    // Run in parallel for speed
    const [image, audio] = await Promise.all([
        generateImage(imagePrompt),
        generateAudio(pageText)
    ]);
    return { image, audio };
};