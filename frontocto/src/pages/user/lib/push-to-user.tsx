"use client";

import { useAuth } from "@/entities/user";
import { LoadingScreen } from "@/shared/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function UserRedirect() {
    const { user, isLoading, token } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return

        if (!token) {
            router.replace("/auth"); return;
        }

        if (user?.username) {
            router.replace(`/user/${user.username}`)
        } else {
            console.warn("User data found, but username is missing")
            router.replace("/")
        }
    }, [user, isLoading, token, router])

    return (
        <>
            <LoadingScreen/>
        </>
    );
}