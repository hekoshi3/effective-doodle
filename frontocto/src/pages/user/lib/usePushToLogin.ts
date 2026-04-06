import { useAuth } from "@/entities/user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function usePushToLogin() {
  const auth = useAuth();
  const router = useRouter();

  const isLoading = !auth.token;

  useEffect(() => {
    if (auth.isLoading && auth.token !== "/auth"){
      router.push("/auth");
    }
  }, [auth.token, auth.isLoading, router]);

  return { isLoading };
}
