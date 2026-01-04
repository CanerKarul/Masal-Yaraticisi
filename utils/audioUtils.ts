
// This function decodes a base64 string into a Uint8Array of bytes.
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// This function decodes raw PCM audio data into an AudioBuffer that can be played.
// FIX: Added padding to the end of the buffer to prevent the last word from being cut off.
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // IMPORTANT: Use byteOffset and byteLength to handle cases where 'data' is a view of a larger buffer.
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  
  // ADDED: 0.5 seconds of silence padding at the end to prevent cutoff
  const paddingFrames = Math.ceil(sampleRate * 0.5); 
  const totalFrames = frameCount + paddingFrames;
  
  const buffer = ctx.createBuffer(numChannels, totalFrames, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert PCM Int16 to Float32 [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    // The rest of the buffer (paddingFrames) is automatically initialized to 0 (silence)
  }
  return buffer;
}