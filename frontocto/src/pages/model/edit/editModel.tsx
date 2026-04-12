"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useGetTags } from "@/entities/tag";
import { useTags } from "@/entities/tag";
import { useManageModel } from "@/features/upload";
import { useCallback } from "react";

export function ModelEditPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id
    const { allTags } = useGetTags()
    const tagLogic = useTags(allTags)
    const { setTags } = tagLogic

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDataLoaded = useCallback((data: any) => {
        if (data.tags) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const normalized = data.tags.map((t: any) => typeof t === "string" ? t : t.name);
            setTags(normalized)
        }
    }, [setTags]
    )

    const {
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
        setDescription } = useManageModel(id, {
            tags: tagLogic.tags,
            onSuccess: handleDataLoaded
        })

    if (isLoading) return <main className="flex min-h-screen items-center justify-center bg-neutral-900"><span className="loading loading-ring loading-xl text-accent"></span></main>;
    if (error || !modelData) return <main className="flex min-h-screen items-center justify-center bg-neutral-900 text-red-400">{error || "Model not found"}</main>;

    return (
        <main className="bg-neutral-900 min-h-screen text-white font-sans">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <button onClick={() => router.back()} className="mb-6 text-neutral-400 hover:text-white flex items-center gap-2">
                    ← Back to Upload
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="flex flex-col gap-4">
                        <div className="relative aspect-video bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-700">
                            {modelData.featured_image ? (
                                <Image src={modelData.featured_image_url} alt="Model preview" fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-neutral-500">No Preview Image</div>
                            )}
                        </div>
                        <div className="p-4 bg-neutral-800 rounded-xl border border-neutral-700">
                            <p className="text-sm text-neutral-400">File attached:</p>
                            <p className="truncate font-mono text-accent">{modelData.file?.split('/').pop() || "model_file.safetensors"}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <h1 className="text-2xl font-bold text-accent">Finalize Your Model</h1>

                        <div>
                            <label className="text-sm text-neutral-400 block mb-1">Model Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter model name..."
                                className="w-full bg-neutral-800 text-white rounded-lg p-3 border border-neutral-700 focus:border-accent outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-neutral-400 block mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                placeholder="What makes this model special?"
                                className="w-full bg-neutral-800 text-white rounded-lg p-3 resize-none border border-neutral-700 focus:border-accent outline-none"
                            />
                        </div>

                        <div className="relative">
                            <label className="text-sm text-neutral-400 block mb-1">Tags</label>
                            <input
                                value={tagLogic.tagInput}
                                onChange={(e) => tagLogic.setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === ",") {
                                        e.preventDefault();
                                        tagLogic.addTag(tagLogic.tagInput);
                                    }
                                }}
                                placeholder="Add tags (style, character, etc)..."
                                className="w-full bg-neutral-800 text-white rounded-lg p-3 border border-neutral-700 focus:border-accent outline-none"
                            />

                            {tagLogic.tagSuggestions.length > 0 && (
                                <div className="absolute z-20 w-full bg-neutral-800 border border-neutral-700 rounded-lg mt-1 shadow-2xl overflow-hidden">
                                    {tagLogic.tagSuggestions.map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => tagLogic.addTag(t)}
                                            className="block w-full text-left px-4 py-2 hover:bg-neutral-700 transition-colors"
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 mt-4">
                                {tagLogic.tags.map((t) => (
                                    <span key={t} className="flex items-center gap-1 bg-accent/20 text-accent border border-accent/30 px-3 py-1 rounded-full text-sm">
                                        #{t}
                                        <button
                                            type="button"
                                            onClick={() => tagLogic.removeTag(t)}
                                            className="hover:text-white ml-1 font-bold"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleSaveDraft}
                                disabled={isSaving}
                                className="flex-1 bg-neutral-700 hover:bg-neutral-600 py-3 rounded-xl transition-all disabled:opacity-50"
                            >
                                {isSaving ? "Saving..." : "Update Draft"}
                            </button>

                            <button
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="flex-1 bg-accent hover:bg-opacity-80 text-black font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                            >
                                {isPublishing ? "Publishing..." : "Publish Model"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}