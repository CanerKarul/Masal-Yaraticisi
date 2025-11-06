
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
                    text: { type: Type.STRING, description: "Sayfanın metni, en fazla 60 kelime." },
                    tts_text: { type: Type.STRING, description: "TTS için metin versiyonu." },
                    image_prompt: { type: Type.STRING, description: "Görüntü oluşturma için detaylı prompt." },
                    image_metadata: {
                        type: Type.OBJECT,
                        properties: {
                            style: { type: Type.STRING, description: "çizgi film stili" },
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

export const generateStory = async (prompt: string, childName: string, pageCount: number): Promise<Story> => {
    const systemPrompt = `You are a children's story composer for ages 3-8 and a UX-aware content generator. Output MUST strictly follow the JSON schema provided. Language: Turkish. Max 60 words per page. Ensure all content is safe, positive, and child-friendly. The story should have a clear beginning, a simple middle part with a small challenge or discovery, and a happy ending. Generate image prompts in a bright, playful cartoon style.`;
    const userPrompt = `Generate a ${pageCount}-page story about: '${prompt}'. If provided, include the child's name: '${childName || ''}'. Include detailed image_prompt and tts_text for each page. Output only the JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${systemPrompt}\n\nUSER:\n${userPrompt}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: storySchema,
            },
        });
        const storyJson = response.text.trim();
        return JSON.parse(storyJson) as Story;
    } catch (error) {
        console.error("Error generating story:", error);
        throw new Error("Failed to generate story. The model might be unable to create content for this prompt.");
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: '4:3',
            },
        });
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        throw new Error("No image was generated.");
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image.");
    }
};

export const generateAudio = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A friendly, neutral voice
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return base64Audio;
        }
        throw new Error("No audio data received.");

    } catch (error) {
        console.error("Error generating audio:", error);
        throw new Error("Failed to generate audio.");
    }
};

export const generateStoryWithAssets = async (prompt: string, childName: string, pageCount: number): Promise<Story> => {
    // 1. Generate story structure
    const story = await generateStory(prompt, childName, pageCount);

    // 2. Create promises for all assets (images and audio for each page)
    const assetGenerationPromises = story.pages.map(page => {
        const imagePromise = generateImage(page.image_prompt)
            .catch(err => {
                console.error(`Failed to generate image for prompt: "${page.image_prompt}"`, err);
                return null; // Return null on failure to not fail the whole batch
            });
        const audioPromise = generateAudio(page.tts_text)
            .catch(err => {
                console.error(`Failed to generate audio for text: "${page.tts_text}"`, err);
                return null; // Return null on failure
            });
        return Promise.all([imagePromise, audioPromise]);
    });

    // 3. Wait for all assets to be generated in parallel
    const generatedAssets = await Promise.all(assetGenerationPromises);

    // 4. Populate the story object with the generated asset data
    const updatedPages = story.pages.map((page, index) => {
        const [imageUrl, audioData] = generatedAssets[index];
        return {
            ...page,
            image_url: imageUrl,
            audio_url: audioData,
        };
    });

    return {
        ...story,
        pages: updatedPages,
    };
};
