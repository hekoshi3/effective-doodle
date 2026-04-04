"use client"

import "./static/GeneratePage.css"
import { sendGeneratePost } from "@/features/generate";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export function GeneratePage() {
  const [upprompt, setUpPrompt] = useState('');
  const [downprompt, setDownPrompt] = useState('');
  const [imgWidth, setImgWidth] = useState<number>(0);
  const [imgHeight, setImgHeight] = useState<number>(0);
  const [genSteps, setGenSteps] = useState<number>(0);
  const [genCfg, setGenCfg] = useState<number>(0.0);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imgUrl, setImgUrl] = useState<string>('');

  useEffect(() => {
    return () => {
      if (imgUrl && imgUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imgUrl); // 
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
        const url = URL.createObjectURL(gen_response.bufferImage)
        setImgUrl(url)
      }
    } catch (e) {
      setError("Something went wrong: " + e)
    } finally { setIsGenerating(false) }
  }
  return (
    <>
      <div className="main-container">
        <div className="column left-column">
          <form onSubmit={generate}>
            <textarea
              id="up-p"
              name="up-prompt"
              className="text_input prompt"
              placeholder="Prompt"
              onChange={(e) => setUpPrompt(e.target.value)}>
            </textarea>
            <textarea
              id="down-p"
              name="down-prompt"
              className="text_input prompt"
              placeholder="Negative Prompt"
              onChange={(e) => setDownPrompt(e.target.value)}
            />
            <div className="resolution_box">
              <input
                type="number"
                id="width_input"
                name="width_input"
                className="text_input resolution"
                placeholder="Width"
                defaultValue={832}
                onChange={(e) => setImgWidth(parseInt(e.target.value))}
              />
              <input
                type="number"
                id="height_input"
                name="height_input"
                className="text_input resolution"
                placeholder="Height"
                defaultValue={1216}
                onChange={(e) => setImgHeight(parseInt(e.target.value))}
              />
            </div>
            <input
              type="number"
              id="steps_input"
              name="steps_input"
              className="text_input"
              placeholder="Steps"
              defaultValue={20}
              onChange={(e) => setGenSteps(parseInt(e.target.value))}
            />
            <input
              type="number"
              id="cfg_input"
              name="cfg_input"
              className="text_input"
              placeholder="CGF Scale"
              defaultValue={4.5}
              min={0}
              max={10}
              step="any"
              onChange={(e) => setGenCfg(parseInt(e.target.value))}
            />
            <div>
              <button type="submit" className="btn bg-neutral-950" disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </form>
          <div className="pt-20">
            <button type="submit" className="btn bg-neutral-950" disabled={isGenerating || !imgUrl}>
              {imgUrl ? 'Send to draft' : 'Waiting for an image'}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </div>

        <div className="column center-column justify-center items-center flex w-full">
          {imgUrl && (
            <Image
              src={imgUrl}
              alt="Generated"
              width={imgWidth}
              height={imgHeight}
              style={{ maxHeight: "90%", width: "auto" }}
              className=""
              unoptimized
            />
          )}
        </div>
      </div>
    </>
  );
}
