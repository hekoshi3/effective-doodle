"use client"

import { useAuth } from "@/entities/user";
import { useState } from "react";

const API_HOST = process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api";

export function SettingsProfile() {
    const auth = useAuth();
    const makeAuthenticatedRequest = auth.makeAuthenticatedRequest as (url: string, options?: RequestInit) => Promise<Response>;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAvatarImage, setselectedAvatarImage] = useState<File | null>(null);
    const [selectedBannerImage, setSelectedBannerImage] = useState<File | null>(null);

    const avatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setselectedAvatarImage(files[0]);
        }
    };

    const bannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setSelectedBannerImage(files[0]);
        }
    };

    const removeSelectedAvatarImage = () => {
        setselectedAvatarImage(null);
    };
    const removeSelectedBannerImage = () => {
        setSelectedBannerImage(null);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAvatarImage && !selectedBannerImage && isSubmitting) return;

        setIsSubmitting(true);
        const form = new FormData();
        if (selectedAvatarImage) form.append("avatar", selectedAvatarImage);
        if (selectedBannerImage) form.append("banner", selectedBannerImage);

        try {
            const res = await makeAuthenticatedRequest(`${API_HOST}/users/me/`, {
                method: "PATCH",
                body: form,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error("Server error:", errorData);
                throw new Error("Upload failed");
            }

            /*const data = await res.json();

            if (data && data.id) {
                router.push(`/image/edit/${data.id}`);
            } else {
                console.error("ID not found in response:", data);
                throw new Error("Server did not return image ID");
            }*/

        } catch (e) {
            console.error("|| error:", e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="flex border min-w-7xl pt-20 justify-center">
                <ul className="list">
                    <li className="tracking-wide text-2xl">Profile</li>
                    <li className="list-row flex justify-between items-center min-w-xl">
                        <div><p className="text-xl">Avatar</p></div>
                        {selectedAvatarImage ?
                            <button onClick={removeSelectedAvatarImage} className="btn">Remove {selectedAvatarImage.name}</button> 
                            : <input type="file" className="file-input text-xs bg-neutral-800" onChange={avatarChange} />}
                    </li>
                    <li className="list-row flex justify-between items-center min-w-xl">
                        <div><p className="text-xl">Banner</p></div>
                        {selectedBannerImage ?
                            <button onClick={removeSelectedBannerImage} className="btn"> Remove {selectedBannerImage.name}</button> 
                            : <input type="file" className="file-input text-xs bg-neutral-800" onChange={bannerChange} />}
                    </li>
                    <li className="list-row flex justify-between items-center min-w-xl">
                        <div><p className="text-xl">reserved</p></div>
                        <input type="file" className="file-input text-xs bg-neutral-800" onChange={bannerChange} disabled />
                    </li>
                </ul>
                <div className="">
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedAvatarImage && !selectedBannerImage && !isSubmitting}
                        className={`btn btn-lg w-full ${isSubmitting ? 'btn-disabled' : 'btn-accent'}`}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="loading loading-spinner"></span>
                                Saving...
                            </>
                        ) : (
                            "Save"
                        )}
                    </button>
                </div>
            </div>
        </>
    )
}