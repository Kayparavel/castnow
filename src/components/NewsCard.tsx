import type { NewsItem, SourceResponse } from "@shared/types"
import { useState, useRef, useCallback } from "react"
import { useTTS } from "~/hooks/useTTS"

function useRelativeTime(ts?: number | string) {
  if (!ts) return ""
  const d = new Date(typeof ts === "number" ? ts : Number(ts))
  if (isNaN(d.getTime())) return ""
  const diff = Date.now() - d.getTime()
  if (diff < 60_000) return "刚刚"
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}分钟前`
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}小时前`
  return `${Math.floor(diff / 86400_000)}天前`
}

function UpdatedTime({ updatedTime }: { updatedTime: number }) {
  const text = useRelativeTime(updatedTime)
  return <span className="text-xs op-70">{text ? `${text}更新` : "加载中..."}</span>
}

function NewsUpdatedTime({ date }: { date: string | number }) {
  const text = useRelativeTime(date)
  return <>{text}</>
}

function ExtraInfo({ item }: { item: NewsItem }) {
  const hasIcon = item?.extra?.icon
  const hasInfo = item?.extra?.info
  return (
    <>
      {hasIcon && (() => {
        const { url, scale } = typeof item.extra!.icon === "string" ? { url: item.extra!.icon, scale: undefined } : item.extra!.icon as any
        return (
          <img
            src={url}
            style={{ transform: `scale(${scale ?? 1})` }}
            className="h-4 inline mt--1 mr-1"
            onError={e => e.currentTarget.style.display = "none"}
          />
        )
      })()}
      {hasInfo && <span>{item.extra!.info}</span>}
    </>
  )
}

function NewsListHot({ items, color }: { items: NewsItem[]; color: string }) {
  return (
    <ol className="flex flex-col gap-2">
      {items.map((item, i) => (
        <a
          href={item.url}
          target="_blank"
          key={String(item.id)}
          title={item.extra?.hover}
          className={`flex gap-2 items-stretch cursor-pointer transition-all hover:bg-neutral-400/10 rounded-md pr-1 visited:(text-neutral-400)`}
        >
          <span className={`bg-neutral-400/10 min-w-6 flex justify-center items-center rounded-md text-sm`}>
            {i + 1}
          </span>
          <span className="self-start line-height-none">
            <span className="mr-2 text-base whitespace-pre-line">{item.title}</span>
            <span className="text-xs text-neutral-400/80 truncate align-middle">
              <ExtraInfo item={item} />
            </span>
          </span>
        </a>
      ))}
    </ol>
  )
}

function NewsListTimeLine({ items }: { items: NewsItem[] }) {
  return (
    <ol className="border-s border-neutral-400/50 flex flex-col ml-1">
      {items.map(item => (
        <li key={`${item.id}-${item.pubDate || item?.extra?.date || ""}`} className="flex flex-col">
          <span className="flex items-center gap-1 text-neutral-400/50 ml--1px">
            <span>-</span>
            <span className="text-xs text-neutral-400/80">
              {(item.pubDate || item?.extra?.date) && <NewsUpdatedTime date={(item.pubDate || item?.extra?.date)!} />}
            </span>
            <span className="text-xs text-neutral-400/80">
              <ExtraInfo item={item} />
            </span>
          </span>
          <a
            className="ml-2 px-1 hover:bg-neutral-400/10 rounded-md visited:(text-neutral-400/80) cursor-pointer transition-all"
            href={item.url}
            title={item.extra?.hover}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="whitespace-pre-line">{item.title}</span>
          </a>
        </li>
      ))}
    </ol>
  )
}

function buildTTSContent(items: NewsItem[], name: string): string {
  const titles = items.map((item, i) => `${i + 1}，${item.title}`)
  return titles.join("。") + `。以上就是${name}最新新闻。`
}

export function NewsCard({ source }: { source: SourceResponse }) {
  const { sourceId, updatedTime, items, meta } = source
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ttsMutation = useTTS()

  const handlePlay = useCallback(() => {
    if (isPlaying) {
      audioRef.current?.pause()
      audioRef.current = null
      setIsPlaying(false)
      return
    }
    const text = buildTTSContent(items, meta.name)
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
  }, [isPlaying, items, ttsMutation])

  const isHottest = meta.type === "hottest"
  const isTTSLoading = ttsMutation.isPending

  return (
    <div
      className={`flex flex-col h-500px rounded-2xl p-4 transition-opacity-300 bg-${meta.color}-500 dark:bg-${meta.color} bg-op-40!`}
    >
      <div className="flex justify-between mx-2 mt-0 mb-2 items-center">
        <div className="flex gap-2 items-center">
          {meta.home ? (
            <a
              className="w-8 h-8 rounded-full bg-cover"
              target="_blank"
              href={meta.home}
              title={meta.name}
              style={{ backgroundImage: `url(/icons/${sourceId.split("-")[0]}.png)` }}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full bg-cover"
              title={meta.name}
              style={{ backgroundImage: `url(/icons/${sourceId.split("-")[0]}.png)` }}
            />
          )}
          <span className="flex flex-col">
            <span className="flex items-center gap-2">
              <span className="text-xl font-bold">{meta.name}</span>
              {meta.title && (
                <span className={`text-sm color-${meta.color} bg-base op-80 bg-op-50! px-1 rounded`}>
                  {meta.title}
                </span>
              )}
            </span>
            <UpdatedTime updatedTime={updatedTime} />
          </span>
        </div>
        <div className={`flex gap-2 text-lg color-${meta.color}`}>
          <button
            type="button"
            disabled={isTTSLoading}
            className={`btn w-6 h-6 ${isPlaying ? "i-ph:speaker-simple-slash-fill" : "i-ph:speaker-simple-high-duotone"} ${isTTSLoading ? "animate-pulse" : ""}`}
            onClick={handlePlay}
            title={isTTSLoading ? "合成中..." : isPlaying ? "停止" : "语音播报"}
          />
        </div>
      </div>

      <div
        className={`h-full p-2 overflow-y-auto rounded-2xl bg-base bg-op-70! sprinkle-${meta.color}`}
      >
        <div className="transition-opacity-500">
          {items.length > 0 ? (
            isHottest ? <NewsListHot items={items} color={meta.color} /> : <NewsListTimeLine items={items} />
          ) : (
            <div className="text-center py-8 op-40 text-sm">暂无数据</div>
          )}
        </div>
      </div>
    </div>
  )
}
