"use client";

import { useAuth } from "@/entities/user";
import { sendGeneratePost } from "@/features/generate";
import { useUploadToDraft } from "@/features/upload";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useGenerate() {
  const auth = useAuth();
  const router = useRouter();
  const { upload } = useUploadToDraft();

  const [upprompt, setUpPrompt] = useState("");
  const [downprompt, setDownPrompt] = useState("");
  const [imgWidth, setImgWidth] = useState<number>(832);
  const [imgHeight, setImgHeight] = useState<number>(1216);
  const [genSteps, setGenSteps] = useState<number>(20);
  const [genCfg, setGenCfg] = useState<number>(4.0);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imgUrl, setImgUrl] = useState<string>("");
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  useEffect(() => {
    return () => {
      if (imgUrl && imgUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imgUrl);
        console.log("Memory cleaned up");
      }
    };
  }, [imgUrl]);

  const generate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsGenerating(true);
    setError("");

    if (!auth.token) return;

    try {
      const gen_response = await sendGeneratePost(
        upprompt,
        downprompt,
        imgWidth,
        imgHeight,
        genSteps,
        genCfg,
        setError,
      );

      if (gen_response?.bufferImage) {
        setImageBlob(gen_response?.bufferImage);
        const url = URL.createObjectURL(gen_response.bufferImage);
        setImgUrl(url);
      }
    } catch (e) {
      setError("Something went wrong: " + e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpload = async () => {
    if (!imageBlob) return;
    if (isUploading) return;

    setIsUploading(true);
    setError("");

    if (!auth.token) return;

    try {
      const form = new FormData();

      form.append("image", imageBlob, Date.now().toString() + ".png");

      const imageId = await upload(form);
      if (imageId) {
        router.push(`/image/edit/${imageId}`);
      }
    } catch (e) {
      console.error("Redirect error:", e);
      alert("Upload successful, but failed to redirect. Check console.");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    state: {
      error,
      isGenerating,
    },
    imageInfo: {
      imgUrl,
      upprompt,
      downprompt,
      imgWidth,
      imgHeight,
      genSteps,
      genCfg,
      imageBlob,
    },
    actions: {
      setUpPrompt,
      setDownPrompt,
      setImgWidth,
      setImgHeight,
      setGenSteps,
      setGenCfg,
    },
    func: {
      generate,
      handleUpload,
    },
  };
}
