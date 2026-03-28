"use client";

import { GalleryImage } from "@/entities/AIimage";
import { useAuth } from "@/entities/user";
import { useRouter } from "next/navigation";

const API_HOST = process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api";

export function PushToUser() {
    const { makeAuthenticatedRequest } = useAuth();
    const router = useRouter();

    const fetchUserId = async (): Promise<number | null> => {
        try {
            const makeRequest = makeAuthenticatedRequest as (url: string, options?: RequestInit) => Promise<Response>;

            const meResponse = await makeRequest(`${API_HOST}/users/me/`);
            if (meResponse.ok) {
                const userData = await meResponse.json();
                if (userData.username) {
                    router.push(`/user/${userData.username}`);
                }

                const imagesResponse = await makeRequest(`${API_HOST}/images/`);
                if (imagesResponse.ok) {
                    const imagesData = await imagesResponse.json();
                    const userImage = imagesData.results?.find(
                        (img: GalleryImage) => img.author.id === userData.id
                    );
                    if (userImage?.author?.username) {
                        router.push(`/user/${userImage.author.username}`);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching user ID:", error);
        }
        return null;
    };

    fetchUserId()
    return (
        <>
        <div className="min-h-screen"></div>
        </>
    );
}