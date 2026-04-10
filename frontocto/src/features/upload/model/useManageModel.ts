"use client"

import { Model } from "@/entities/AImodel";
import { useAuth } from "@/entities/user";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const API_HOST = process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api";

export function useManageModel(id: string | string[] | undefined, setTags: Dispatch<SetStateAction<string[]>>, tags: string[]) {
  const auth = useAuth();
  const router = useRouter();

  const makeAuthenticatedRequest = auth.makeAuthenticatedRequest as (
    url: string,
    options?: RequestInit,
  ) => Promise<Response>;

  const [modelData, setModelData] = useState<Model | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id || auth.isLoading) return;

    const loadModel = async () => {
      try {
        setIsLoading(true);
        const res = auth.token
          ? await makeAuthenticatedRequest(`${API_HOST}/models/${id}/`)
          : await fetch(`${API_HOST}/models/${id}/`);

        if (!res.ok) throw new Error("Failed to load model");

        const data = await res.json();
        setModelData(data);
        setName(data.name || "");
        setDescription(data.description || "");

        if (Array.isArray(data.tags)) {
          setTags(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.tags.map((t: any) => typeof t === "string" ? t : t.name));
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setError(e.message || "Error loading model");
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();
  }, [
    id,
    auth.token,
    auth.isLoading,
    makeAuthenticatedRequest,
    setIsLoading,
    setModelData,
    setName,
    setDescription,
    setTags,
    setError,
  ]);

  const handleSaveDraft = async () => {
    if (!auth.token || !modelData) return;

    setIsSaving(true);
    try {
      const res = await makeAuthenticatedRequest(
        `${API_HOST}/models/${modelData.id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            tags,
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to save");
      const updated = await res.json();
      setModelData(updated);
      if (updated.tags) {
        setTags(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          updated.tags.map((t: any) => typeof t === "string" ? t : t.name));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!auth.token || !modelData) return;

    setIsPublishing(true);
    try {
      const res = await makeAuthenticatedRequest(
        `${API_HOST}/models/${modelData.id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            is_published: true,
            name,
            description,
            tags,
          }),
        },
      );

      if (!res.ok) throw new Error("Publish failed");
      router.push(`/model/${modelData.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    handleSaveDraft,
    handlePublish,
    isPublishing,
    isSaving,
    isLoading,
    error,
    modelData,
    name,
    description,
    setName,
    setDescription
  };
}
