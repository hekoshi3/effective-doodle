export interface Comment {
  id: number;
  authorId: number;
  text: string;
  created_at: string;
  image?: number;
  aimodel?: number;
}

export interface CommentList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Comment[];
}