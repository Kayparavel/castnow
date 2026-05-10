import type { NewsItem } from "@shared/types"
import { useState, useRef } from "react"
import { useTTS } from "~/hooks/useTTS"
import type { SourceResponse } from "~/hooks/useNews"

function formatTime(ts?: number | string) {
  if (!ts) return ""
  const d = new Date(typeof ts === "number" ? ts : Number(ts))
  if (isNaN(d.getTime())) return ""
  const now = Date.now()
  const diff = now - d.getTime()
  if (diff < 60_000) return "刚刚"
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}分钟前`
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}小时前`
  return `${Math.floor(diff / 86400_000)}天前`
}

function buildTTSContent(items: NewsItem[]): string {
  const titles = items.slice(0, 10).map((item, i) => `${i + 1}，${item.title}`)
  return titles.join("。") + "。以上就是最新新闻。"
}

export function NewsCard({ source }: { source: SourceResponse }) {
  const [expanded, setExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ttsMutation = useTTS()

  const displayItems = expanded ? source.items : source.items.slice(0, 10)

  function handlePlay() {
    if (isPlaying) {
      audioRef.current?.pause()
      audioRef.current = null
      setIsPlaying(false)
      return
    }

    const text = buildTTSContent(source.items)
    ttsMutation.mutate(text, {
      onSuccess: (blob) => {
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audioRef.current = audio
        audio.play()
        setIsPlaying(true)
        audio.onended = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(url)
        }
      },
    })
  }

  const isTTSLoading = ttsMutation.isPending

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-lg">{source.sourceId}</h2>
          <span className="text-xs opacity-40">{formatTime(source.updatedTime)}</span>
        </div>
        <button
          onClick={handlePlay}
          disabled={isTTSLoading}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isPlaying
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-blue-500 text-white hover:bg-blue-600"
          } ${isTTSLoading ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
        >
          {isTTSLoading ? "合成中..." : isPlaying ? "⏹ 停止" : "🔊 播报"}
        </button>
      </div>

      <ul className="space-y-1.5">
        {displayItems.map((item) => (
          <li key={String(item.id)} className="flex items-start gap-2 group">
            <span className="text-xs opacity-30 mt-1 shrink-0">•</span>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm leading-relaxed hover:text-blue-400 transition-colors line-clamp-2"
            >
              {item.title}
            </a>
            <span className="text-xs opacity-30 shrink-0 mt-0.5 ml-auto">{formatTime(item.pubDate)}</span>
          </li>
        ))}
      </ul>

      {source.items.length > 10 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs opacity-50 hover:opacity-80 cursor-pointer transition-opacity"
        >
          {expanded ? "收起" : `展开全部 ${source.items.length} 条`}
        </button>
      )}
    </div>
  )
}
