import { useAuth } from "@/entities/user";

const API_HOST =
  process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api";

export function useUploadToDraft() {
  const auth = useAuth();
  const makeAuthenticatedRequest = auth.makeAuthenticatedRequest as (
    url: string,
    options?: RequestInit,
  ) => Promise<Response>;

  const upload = async (form: FormData) => {
    try {
      const res = await makeAuthenticatedRequest(`${API_HOST}/images/`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Server error:", errorData);
        throw new Error("Upload failed");
      }

      const data = await res.json();

      if (data && data.id) {
        return data.id;
      } else {
        console.error("ID not found in response:", data);
        throw new Error("Server did not return image ID");
      }
    } catch (e) {
      console.error("Redirect error:", e);
      alert("Upload successful, but failed to redirect. Check console.");
    }
  };
  return {upload}
}
