import { User } from "./user.types";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  role: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean }>;
  logout: () => void;
  refreshAccessToken: () => Promise<string>;
  makeAuthenticatedRequest: (url: string, options?: RequestInit) => Promise<Response>;
}