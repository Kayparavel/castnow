import { useMutation } from "@tanstack/react-query"

export function useTTS() {
  return useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error(`TTS failed: ${res.status}`)
      return res.blob()
    },
  })
}
