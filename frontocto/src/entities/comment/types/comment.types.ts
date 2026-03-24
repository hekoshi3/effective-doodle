export interface Comment {
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