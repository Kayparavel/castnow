import process from "node:process"
import { ofetch } from "ofetch"

const DEFAULT_TTS_BASE_URL = "https://api.xiaomimimo.com/v1"

export async function synthesizeSpeech(text: string, voicePrompt?: string): Promise<Buffer> {
  const apiKey = process.env.MIMO_API_KEY
  if (!apiKey) throw new Error("MIMO_API_KEY not configured")

  const baseUrl = process.env.TTS_BASE_URL || DEFAULT_TTS_BASE_URL

  const res = await ofetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: {
      model: "mimo-v2.5-tts-voicedesign",
      messages: [
        { role: "user" as const, content: voicePrompt || "用自然流畅的中文播报新闻" },
        { role: "assistant" as const, content: text },
      ],
      audio: { format: "wav" },
    },
  })

  const audioData = res?.choices?.[0]?.message?.audio?.data
  if (!audioData) throw new Error("No audio data in TTS response")

  return Buffer.from(audioData, "base64")
}
