import { GoogleGenAI, Modality, Type } from "@google/genai";
import { type Story } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const storySchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Kısa başlık (en fazla 10 karakter)." },
        subtitle: { type: Type.STRING, description: "Bir cümlelik alt başlık." },
        pages: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    page_number: { type: Type.INTEGER },
                    text: { type: Type.STRING, description: "Sayfanın metni, en fazla 60 kelime. Akıcı ve masalsı bir dil." },
                    tts_text: { type: Type.STRING, description: "TTS için metin versiyonu. Noktalama işaretlerine dikkat et." },
                    image_prompt: { type: Type.STRING, description: "Görüntü oluşturma için detaylı, İngilizce prompt. Stil: 'Pixar style 3D render, vivid colors, cute'." },
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
    
    const systemPrompt = `You are an expert children's book author using the Gemini 3 engine. 
    Target Audience: Ages 3-8. 
    Language: Turkish.
    Structure: Output strictly valid JSON matching the schema.
    Content Rules:
    1. Create exactly ${pageCount} pages.
    2. Keep sentences simple but engaging.
    3. Ensure a clear beginning, middle, and happy ending.
    4. Provide highly descriptive English image prompts optimized for Gemini Image generation.`;

    const userPrompt = `Write a story about: '${prompt}'. 
    Protagonist name: '${childName || 'Bir çocuk'}'.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `${systemPrompt}\n\nUSER REQUEST:\n${userPrompt}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: storySchema,
                temperature: 0.7, // Balanced creativity
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