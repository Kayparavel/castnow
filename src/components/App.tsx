import { useNews } from "~/hooks/useNews"
import { useIsFetching } from "@tanstack/react-query"
import { NewsCard } from "./NewsCard"
import { useCallback, useState, useRef } from "react"

function Header({ onRefresh }: { onRefresh: () => void }) {
  const isFetching = useIsFetching({ queryKey: ["news"] })

  return (
    <header
      className="grid items-center py-4 px-5 lg:py-6 sticky top-0 z-10 backdrop-blur-md"
      style={{ gridTemplateColumns: "50px auto 50px" }}
    >
      <span className="flex justify-self-start">
        <a href="/" className="flex gap-2 items-center">
          <span className="text-3xl">🦗</span>
          <span className="text-2xl font-bold line-height-none!">
            <p>知了</p>
            <p className="mt--1 text-sm op-50 font-normal">CastNow</p>
          </span>
        </a>
      </span>
      <span className="justify-self-center text-sm op-50 hidden md:block">
        新闻语音播报
      </span>
      <span className="justify-self-end flex gap-2 items-center text-xl">
        <button
          type="button"
          title="Refresh"
          className={`btn ${isFetching ? "animate-spin i-ph:circle-dashed-duotone" : "i-ph:arrow-counter-clockwise-duotone"}`}
          onClick={onRefresh}
        />
      </span>
    </header>
  )
}

export default function App() {
  const { data: sources, isLoading, refetch } = useNews()
  const [search, setSearch] = useState("")
  const gridRef = useRef<HTMLDivElement>(null)

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  const filtered = search
    ? sources?.filter(s =>
        s.meta.name.toLowerCase().includes(search.toLowerCase())
        || s.sourceId.toLowerCase().includes(search.toLowerCase())
        || s.items.some(item => item.title.toLowerCase().includes(search.toLowerCase())),
      )
    : sources

  return (
    <div className="h-full overflow-x-auto px-4 md:px-10 lg:px-24">
      <Header onRefresh={handleRefresh} />

      <main className="mt-2 min-h-[calc(100vh-180px)] md:min-h-[calc(100vh-175px)] lg:min-h-[calc(100vh-194px)]">
        {isLoading && (
          <div className="text-center py-20 op-50">加载中...</div>
        )}

        {sources && sources.length === 0 && (
          <div className="text-center py-20 op-50">暂无新闻数据，请检查 MySQL 连接配置</div>
        )}

        <div
          ref={gridRef}
          className="grid w-full gap-6"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))" }}
        >
          {filtered?.map(source => (
            <NewsCard key={source.sourceId} source={source} />
          ))}
        </div>
      </main>

      <footer className="py-6 flex flex-col items-center justify-center text-sm text-neutral-500 font-mono">
        <span>CastNow 知了 © 2025</span>
      </footer>
    </div>
  )
}
