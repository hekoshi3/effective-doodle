export interface Notification {
  id: number;
  AuthorId: number;
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
  results: Notification[];
}