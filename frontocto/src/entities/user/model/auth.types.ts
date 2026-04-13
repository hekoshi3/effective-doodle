import { User } from "./user.types";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  role: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; user?: User }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; user?: User }>;
  logout: () => void;
  refreshAccessToken: () => Promise<string>;
  makeAuthenticatedRequest: (url: string, options?: RequestInit) => Promise<Response>;
}