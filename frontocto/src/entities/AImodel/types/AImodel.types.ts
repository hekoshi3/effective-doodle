export interface BackdendResMODEL {
  count: number;
  next: undefined;
  previous: undefined;
  results: Model[];
}

export interface Model {
  tags: string[];
  id: number;
  authorId: number;
  is_liked: boolean;
  name: string;
  model_type: string;
  description: string;
  file: string;
  file_hash: string;
  downloads_count: number;
  likes_count: number;
  is_published: boolean;
  created_at: Date;
  featured_image: number;
  featured_image_url: string;
}