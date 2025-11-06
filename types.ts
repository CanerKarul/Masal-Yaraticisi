
export interface Page {
  page_number: number;
  text: string;
  tts_text: string;
  image_prompt: string;
  image_metadata: {
    style: string;
    aspect_ratio: "4:3";
    seed: number | null;
  };
  audio_url: string | null;
  image_url?: string | null;
}

export interface Story {
  title: string;
  subtitle: string;
  pages: Page[];
  meta: {
    page_count: number;
    estimated_duration_seconds: number;
  };
}
