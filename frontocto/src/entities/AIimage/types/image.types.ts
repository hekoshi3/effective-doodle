export interface BackdendResIMG {
  count: number;
  next: undefined;
  previous: undefined;
  results: GalleryImage[];
}

export interface GalleryImage {
  id: number;
  author: {
    // !!!
    id: number;
    username: string;
    profile: {
      avatar: string | null;
    };
    avatar: string;
    followers_count: number;
    is_following: boolean;
  };
  is_liked: boolean;
  image: string;
  path: string;
  height: number;
  width: number;
  tags: string[];
  description: string;
  generation_params: GenParams;
  is_published: boolean;
  likes_count: number;
  created_at: Date;
  linked_model: number;
  resources: undefined[];
}

export interface GenParams {
  raw: string;
  seed: string;
  size: string;
  model: string;
  steps: string;
  width: number;
  height: number;
  prompt: string;
  sampler: string;
  version: string;
  cfg_scale: string;
  fp8_weight: string;
  model_hash: string;
  hires_steps: string;
  hires_upscale: string;
  schedule_type: string;
  hires_upscaler: string;
  negative_prompt: string;
  denoising_strength: string;
  cache_fp16_weight_for_lora: string;
}

export interface API_Host_Response {
    images: string[];
    parameters: Record<string, string>;
    info: string;
}

export interface GenerationResponse {
    bufferImage: Blob;
    images: string[];
    parameters: Record<string, string>;
    info: string;
}