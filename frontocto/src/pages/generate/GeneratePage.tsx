"use client"

import { useAuth } from "@/entities/user";
import { sendGeneratePost } from "@/features/generate";
import { useUploadToDraft } from "@/features/upload";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export function GeneratePage() {
  const auth = useAuth();
  const router = useRouter();
  const { upload } = useUploadToDraft();

  const [upprompt, setUpPrompt] = useState('');
  const [downprompt, setDownPrompt] = useState('');
  const [imgWidth, setImgWidth] = useState<number>(832);
  const [imgHeight, setImgHeight] = useState<number>(1216);
  const [genSteps, setGenSteps] = useState<number>(20);
  const [genCfg, setGenCfg] = useState<number>(4.0);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imgUrl, setImgUrl] = useState<string>('');
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)

  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.token) {
      router.push("/login");
      return;
    }
    setIsLoading(false);
  }, [auth.token, auth.isLoading, router]);

  useEffect(() => {
    return () => {
      if (imgUrl && imgUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imgUrl);
        console.log("Memory cleaned up")
      }
    }
  }, [imgUrl])

  const generate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsGenerating(true);
    setError("")

    try {
      const gen_response = await sendGeneratePost(
        upprompt,
        downprompt,
        imgWidth || 832,
        imgHeight || 1216,
        genSteps || 20,
        genCfg || 4.0,
        setError
      );

      if (gen_response?.bufferImage) {
        setImageBlob(gen_response?.bufferImage)
        const url = URL.createObjectURL(gen_response.bufferImage)
        setImgUrl(url)
      }
    } catch (e) {
      setError("Something went wrong: " + e)
    } finally { setIsGenerating(false) }
  }

  const handleUpload = async () => {
    if (!imageBlob) return;
    if (isUploading) return;

    setIsUploading(true);
    setError("")

    try {
      const form = new FormData();

      form.append("image", imageBlob, Date.now().toString() + ".png");

      const imageId = await upload(form)
      if (imageId) { router.push(`/image/edit/${imageId}`); }

    } catch (e) {
      console.error("Redirect error:", e); alert("Upload successful, but failed to redirect. Check console.");
    } finally {
      setIsUploading(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-900">
        <span className="loading loading-ring loading-xl text-accent"></span>
      </main>
    );
  }

  return (
    <>
      <div className="flex h-[95vh] gap-4 p-4">
        <div className="flex-col min-w-xl p-4 box-border rounded-lg h-[90vh] overflow-hidden bg-neutral-900">
          <form onSubmit={generate} className="w-full">
            <textarea
              //id="up-p"
              name="up-prompt"
              className="rounded-sm bg-[#222] w-full h-37.5 px-3 py-5 box-border resize-none "
              placeholder="Prompt"
              onChange={(e) => setUpPrompt(e.target.value)}>
            </textarea>
            <textarea
              //id="down-p"
              name="down-prompt"
              className="rounded-sm bg-[#222] w-full h-37.5 px-3 py-5 box-border resize-none"
              placeholder="Negative Prompt"
              onChange={(e) => setDownPrompt(e.target.value)}
            />
            <div className="flex gap-3">
              <div className="">
                <p>Resolution</p>
                <div className="flex justify-between">
                  <input
                    type="number"
                    //id="width_input"
                    name="width_input"
                    className="rounded-sm bg-[#222] w-1/3 px-3 py-1 box-border resize-none"
                    placeholder="Width"
                    defaultValue={832}
                    onChange={(e) => setImgWidth(parseInt(e.target.value))}
                  />
                  <p>x</p>
                  <input
                    type="number"
                    //id="height_input"
                    name="height_input"
                    className="rounded-sm bg-[#222] w-1/3 px-3 py-1 box-border resize-none"
                    placeholder="Height"
                    defaultValue={1216}
                    onChange={(e) => setImgHeight(parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="">
                <p>Steps</p>
                <input
                  type="number"
                  //id="steps_input"
                  name="steps_input"
                  className="rounded-sm bg-[#222] px-3 py-1 mb-1 box-border resize-none"
                  placeholder="Steps"
                  defaultValue={20}
                  onChange={(e) => setGenSteps(parseInt(e.target.value))}
                />
                <p>CFG</p>
                <input
                  type="number"
                  //id="cfg_input"
                  name="cfg_input"
                  className="rounded-sm bg-[#222] px-3 py-1 box-border resize-none"
                  placeholder="CGF Scale"
                  defaultValue={4.5}
                  min={0}
                  max={10}
                  step="any"
                  onChange={(e) => setGenCfg(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div>
              <button type="submit" className="btn btn-neutral bg-neutral-800 border-0 outline-0" disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </form>
          <div className="absolute bottom-11">
            <button type="button" className="btn btn-neutral bg-neutral-800 border-0 " disabled={isGenerating || !imgUrl} onClick={handleUpload}>
              {imgUrl ? 'Send to draft' : 'Waiting for an image'}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </div>

        <div className="flex-col min-w-[33%] p-4 box-border rounded-lg h-[90vh] overflow-hidden center-column justify-center items-center flex w-full bg-neutral-900">
          {imgUrl && (
            <Image
              src={imgUrl}
              alt="Generated"
              width={imgWidth}
              height={imgHeight}
              style={{ maxHeight: "90%", width: "auto" }}
              className="rounded-xl"
              unoptimized
            />
          )}
        </div>
      </div>
    </>
  );
}
