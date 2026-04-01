"use client"

import { GalleryImage } from "@/entities/AIimage";
import { sendGeneratePost } from "@/features/generate";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function GeneratePage() {
  const [upprompt, setUpPrompt] = useState('');
  const [downprompt, setDownPrompt] = useState('');
  const [imgWidth, setImgWidth] = useState<number>(0);
  const [imgHeight, setImgHeight] = useState<number>(0);
  const [genSteps, setGenSteps] = useState<number>(0);
  const [genCfg, setGenCfg] = useState<number>(0.0);
  const [error, setError] = useState('');
  const [MainImagePath, setMainImagePath] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  //const apiHost = process.env.NEXT_PUBLIC_API_HOST;

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch("/api/scan");
        if (!res.ok) throw new Error("Failed to fetch images");
        const images: GalleryImage[] = await res.json();
        setGallery(images.reverse());
      } catch (error) {
        console.error("Error loading gallery:", error);
      }
    };

    fetchGallery();
  }, []);

  const generate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsGenerating(true);

    const gen_response = await sendGeneratePost(
      upprompt,
      downprompt,
      imgWidth || 832,
      imgHeight || 1216,
      genSteps || 20,
      genCfg || 4.0,
      setError
    );

    const base64_image = gen_response.images[0];

    const response = await fetch('/api/save-on-server', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_image: base64_image,
        parameters: gen_response.info,
      }),
    });

    if (gen_response.parameters.width) {
      setImgWidth(parseInt(gen_response.parameters.width))
    }
    if (gen_response.parameters.height) {
      setImgHeight(parseInt(gen_response.parameters.height))
    }

    const image_path = await response.json();
    /*if (image_path.path) {
      setMainImagePath(image_path.path);
      setGallery(prev => [
        {
          image: image_path.path,
          width: parseInt(gen_response.parameters.width),
          height: parseInt(gen_response.parameters.height),
        },
        ...prev
      ]);
    } else {
      console.log(image_path);
    }*/
    setIsGenerating(false);
  };

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
            <button type="submit" className="btn" disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </form>

          {error && <p className="error">{error}</p>}
        </div>

        <div className="column center-column">
          {MainImagePath && (
            <Image
              src={MainImagePath}
              alt="Generated"
              width={imgWidth}
              height={imgHeight}
              style={{ maxWidth: "90%", height: "auto" }}
              unoptimized
            />
          )}
        </div>
        <div className="column right-column">
          <div className="gallery-list gallery">
            {gallery.map((img, index) => (
              <a key={index} href={img.path} target="_blank" rel="noopener noreferrer">
                <div className="gallery-image-wrapper">
                  <Image
                    src={img.path}
                    alt={`Generated ${index}`}
                    width={190}
                    height={Math.round(190 * (img.height / img.width))}
                    unoptimized
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}