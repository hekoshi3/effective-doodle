"use client";

import { useState, useEffect } from "react";

const API_HOST = process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api";

export function useGetTags() {
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_HOST}/tags/`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setAllTags(data.map((t: string) => t)); //typeof t === "string" ? t : t.name));
        }
      })
      .catch(() => {});
  }, []);

  return { allTags };
}
