import { Hono } from "hono"
import { synthesizeSpeech } from "../services/tts"
import { logger } from "../logger"

export const ttsRoutes = new Hono()

ttsRoutes.post("/tts", async (c) => {
  const body = await c.req.json()
  const text = body?.text as string
  if (!text) return c.json({ error: "Missing text" }, 400)

  logger.info(`[tts] request received, text length: ${text.length}`)
  try {
    const audioBuffer = await synthesizeSpeech(text)
    logger.success(`[tts] synthesized ${audioBuffer.length} bytes`)
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-cache",
      },
    })
  } catch (e: any) {
    logger.error(`[tts] failed:`, e.message)
    return c.json({ error: `TTS failed: ${e.message}` }, 500)
  }
})
