"use client";

import { useAuth } from "@/entities/user";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useAuthForm() {
  const { login, register } = useAuth();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleLogin = () => {
    setIsLogin((prev) => !prev);
    setError("");
  };

  const handleSubmit = async (formData: FormData) => {
    setError("");
    setIsLoading(true);

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const email = formData.get("email") as string;

    try {
      const result = isLogin
        ? await login(username, password)
        : await register(username, email, password);

      if (result.success && result.user?.username) {
        router.push(`/user/${result.user?.username}`);
      } else {
        router.push("/");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    state: { isLogin, error, isLoading },
    functions: { toggleLogin, handleSubmit },
  };
}
