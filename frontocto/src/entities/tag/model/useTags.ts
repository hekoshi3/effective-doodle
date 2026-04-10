"use client";

import { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useTags(rawTags: any[]) {
    const allTags = (rawTags || []).map(t=>
        typeof t === "string" ? t : t?.name || ""
    ).filter(Boolean);

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const addTag = (value: string) => {
    const clean = value.replace(/,/g, "").trim();
    if (!clean || tags.includes(clean)) {
      setTagInput("");
      return;
    }
    setTags((prev) => [...prev, clean]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };
  const tagSuggestions =
    tagInput.trim() === ""
      ? []
      : allTags
          .filter(
            (t) =>
              t.toLowerCase().includes(tagInput.toLowerCase()) &&
              !tags.includes(t),
          )
          .slice(0, 8);

  return { addTag,removeTag, tagSuggestions, tags, setTags, tagInput, setTagInput };
}
