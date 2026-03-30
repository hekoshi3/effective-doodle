export interface User {
  id: number;
  role: "User" | "Admin";
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  avatar: string;
  profile: {
    // !!!
    id: number;
    username: string;
    profile: {
      avatar: string | null;
    };
    avatar: string;
    followers_count: number;
    is_following: boolean;
    banner: string;
  };
  
  stats: {
    total_downloads: number;
    total_likes: number;
    followers: number;
    models_count: number;
    images_count: number;
  };
  followers_count: number;
  is_following: boolean;
}

export interface Analytics {
  top_models: [
    {
      id: number;
      name: string;
      downloads_count: number;
      likes_count: number;
    }
  ];
  top_images: [
    {
      id: number;
      likes_count: number;
      created_at: Date;
    }
  ];
  activity_graph: [
    {
      date: string;
      count: number;
    }
  ];
}