"use client";

import { GalleryImage, BackdendResIMG } from "@/entities/AIimage";
import { Model, BackdendResMODEL } from "@/entities/AImodel";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { User, Analytics } from "./user.types";
import { AuthContextType } from "./auth.types";

const API_HOST = process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api";

export function useUserPageData(username: string, auth: AuthContextType) {
  const makeAuthenticatedRequest = auth.makeAuthenticatedRequest as (
    url: string,
    options?: RequestInit,
  ) => Promise<Response>;

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [currentUserProfile, setCurUserProfile] = useState<User | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);
  const [, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!username || auth.isLoading) return;

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const userRes = auth.token
          ? await makeAuthenticatedRequest(`${API_HOST}/users/${username}/`)
          : await fetch(`${API_HOST}/users/${username}/`);

        if (!userRes.ok) notFound();

        const userData: User = await userRes.json();
        setUserProfile(userData);

        const analyticsRes = auth.token
          ? await makeAuthenticatedRequest(`${API_HOST}/users/analytics/`)
          : await fetch(`${API_HOST}/users/analytics/`);

        if (analyticsRes.ok) {
          const analyticsData: Analytics = await analyticsRes.json();
          setAnalytics(analyticsData);
        }

        if (auth.token) {
          try {
            const meRes = await makeAuthenticatedRequest(
              `${API_HOST}/users/me/`,
            );
            if (meRes.ok) {
              const meData = await meRes.json();
              setCurUserProfile(meData);
              setCurrentUsername(meData.username);
              setIsOwnProfile(meData.username === userData.username);
            }
          } catch {}
        }

        const imagesRes = auth.token
          ? await makeAuthenticatedRequest(`${API_HOST}/images/`)
          : await fetch(`${API_HOST}/images/`);

        if (imagesRes.ok) {
          const imagesData: BackdendResIMG = await imagesRes.json();
          const userImages = imagesData.results.filter(
            (img) => img.author.id === userData.id,
          );
          setGallery(userImages.reverse());
        }

        const modelsRes = auth.token
          ? await makeAuthenticatedRequest(`${API_HOST}/models/`)
          : await fetch(`${API_HOST}/models/`);

        if (modelsRes.ok) {
          const modelsData: BackdendResMODEL = await modelsRes.json();
          const userModels = modelsData.results.filter(
            (model) => model.author.id === userData.id,
          );
          setModels(userModels.reverse());
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Error loading user data:", err);
        setError(err.message || "Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [username, auth.token, auth.isLoading, makeAuthenticatedRequest]);

  return {
    userProfile,
    currentUserProfile,
    analytics,
    gallery,
    models,
    isLoading,
    error,
    isOwnProfile,
  };
}
