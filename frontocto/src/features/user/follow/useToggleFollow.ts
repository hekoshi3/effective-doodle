import { AuthContextType, User } from "@/entities/user";
import { useState, useRef, useEffect } from "react";

const API_HOST = process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api";

export function useToggleFollow(
  userProfile: User | null,
  auth: AuthContextType,
) {
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [optimisticFollow, setOptimisticFollow] = useState<boolean | null>(
    null,
  );
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null);
  const pendingFollowRef = useRef<boolean | null>(null);
  const makeAuthenticatedRequest = auth.makeAuthenticatedRequest as (
    url: string,
    options?: RequestInit,
  ) => Promise<Response>;

  useEffect(() => {
    if (userProfile && userProfile.is_following === optimisticFollow) {
      setOptimisticFollow(null);
    }
    if (userProfile && userProfile.followers_count === optimisticCount) {
      setOptimisticCount(null);
    }
  }, [
    optimisticCount,
    optimisticFollow,
    userProfile,
    userProfile?.is_following,
    userProfile?.followers_count,
  ]);

  const displayFollow =
    pendingFollowRef.current !== null
      ? pendingFollowRef.current
      : optimisticFollow !== null
        ? optimisticFollow
        : (userProfile?.is_following ?? false);

  const displayCount =
    optimisticCount !== null
      ? optimisticCount
      : (userProfile?.followers_count ?? 0);

  const toggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!auth.token || !userProfile || isUpdatingFollow) return;

    setIsUpdatingFollow(true);

    const nextFollow = !displayFollow;
    const nextCount = nextFollow ? displayCount + 1 : displayCount - 1;

    pendingFollowRef.current = nextFollow;
    setIsUpdatingFollow(true);
    setOptimisticCount(nextCount);
    setOptimisticFollow(nextFollow);

    try {
      makeAuthenticatedRequest(`${API_HOST}/follows/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ following: userProfile.id }),
      });
    } catch (error) {
      console.error("Error updating: " + error);
      setOptimisticCount(null);
      setOptimisticFollow(null);
      pendingFollowRef.current = null;
    } finally {
      setTimeout(() => {
        pendingFollowRef.current = null;
        setIsUpdatingFollow(false);
      }, 200);
    }
  };
  return {
    displayFollow,
    displayCount,
    isUpdatingFollow,
    toggleFollow,
  };
}