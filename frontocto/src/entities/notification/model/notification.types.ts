import { ReactNode } from "react";

export interface Notif {
  id: number;
  actor: {
    // !!!
    id: number;
    username: string;
    profile: {
      avatar: string | null;
    };
    avatar: string;
    followers_count: number;
    is_following: boolean;
  }; // !!!
  type: "LIKE" | "COMMENT" | "FOLLOW" | "NEW_POST";
  is_read: boolean;
  created_at: string;
  recipient: number;
  image: number | null;
  aimodel: number | null;
  comment: number | null;
}

export interface NotificationList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notif[];
}

export interface NotificationProps {
    unreadCount: number;
    notifications: ReactNode[];
}