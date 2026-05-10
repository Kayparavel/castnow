import { Hono } from "hono"
import { synthesizeSpeech } from "../services/tts"

export const ttsRoutes = new Hono()

ttsRoutes.post("/tts", async (c) => {
  const body = await c.req.json()
  const text = body?.text as string
  if (!text) return c.json({ error: "Missing text" }, 400)

  try {
    const audioBuffer = await synthesizeSpeech(text, body?.voicePrompt)
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-cache",
      },
    })
  } catch (e: any) {
    return c.json({ error: `TTS failed: ${e.message}` }, 500)
  }
})
