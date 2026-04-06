import { MouseEventHandler } from "react";
import { AuthContextType, User } from ".";

export interface userSideProps {
  userProfile: User;
  displayCount: number;
  displayFollow: boolean;
  toggleFollow: MouseEventHandler<HTMLButtonElement>;
  auth: AuthContextType;
  isOwnProfile: boolean;
  isUpdatingFollow: boolean;
  currentUserProfile: User | null;
}
