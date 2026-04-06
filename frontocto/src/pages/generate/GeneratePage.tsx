"use client"

import Image from "next/image";
import { useGenerate } from "./model/useGenerate";
import { usePushToLogin } from "../user/lib/usePushToLogin";

export function GeneratePage() {
  const { state, actions, func, imageInfo } = useGenerate()

  const { isLoading } = usePushToLogin()

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
          <form onSubmit={func.generate} className="w-full">
            <textarea
              //id="up-p"
              name="up-prompt"
              className="rounded-sm bg-[#222] w-full h-37.5 px-3 py-5 box-border resize-none "
              placeholder="Prompt"
              onChange={(e) => actions.setUpPrompt(e.target.value)}>
            </textarea>
            <textarea
              //id="down-p"
              name="down-prompt"
              className="rounded-sm bg-[#222] w-full h-37.5 px-3 py-5 box-border resize-none"
              placeholder="Negative Prompt"
              onChange={(e) => actions.setDownPrompt(e.target.value)}
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
                    onChange={(e) => actions.setImgWidth(parseInt(e.target.value))}
                  />
                  <p>x</p>
                  <input
                    type="number"
                    //id="height_input"
                    name="height_input"
                    className="rounded-sm bg-[#222] w-1/3 px-3 py-1 box-border resize-none"
                    placeholder="Height"
                    defaultValue={1216}
                    onChange={(e) => actions.setImgHeight(parseInt(e.target.value))}
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
                  onChange={(e) => actions.setGenSteps(parseInt(e.target.value))}
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
                  onChange={(e) => actions.setGenCfg(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div>
              <button type="submit" className="btn btn-neutral bg-neutral-800 border-0 outline-0" disabled={state.isGenerating}>
                {state.isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </form>
          <div className="absolute bottom-11">
            <button type="button" className="btn btn-neutral bg-neutral-800 border-0 " disabled={state.isGenerating || !imageInfo.imgUrl} onClick={func.handleUpload}>
              {imageInfo.imgUrl ? 'Send to draft' : 'Waiting for an image'}
            </button>
          </div>
          {state.error && <p className="error">{state.error}</p>}
        </div>

        <div className="flex-col min-w-[33%] p-4 box-border rounded-lg h-[90vh] overflow-hidden center-column justify-center items-center flex w-full bg-neutral-900">
          {imageInfo.imgUrl && (
            <Image
              src={imageInfo.imgUrl}
              alt="Generated"
              width={imageInfo.imgWidth}
              height={imageInfo.imgHeight}
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
