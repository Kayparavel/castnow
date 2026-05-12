import { useNews, fetchNewsForce } from "~/hooks/useNews"
import { useIsFetching, useQueryClient } from "@tanstack/react-query"
import { useAtom, useAtomValue } from "jotai"
import { NewsCard } from "./NewsCard"
import { NavBar } from "./NavBar"
import { useCallback, useRef } from "react"
import { currentTabAtom, focusSourcesAtom } from "~/atoms"

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
      <span className="justify-self-center">
        <span className="hidden md:inline-block">
          <NavBar />
        </span>
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
  const { data: sources, isLoading } = useNews()
  const queryClient = useQueryClient()
  const gridRef = useRef<HTMLDivElement>(null)
  const [currentTab] = useAtom(currentTabAtom)
  const focusList = useAtomValue(focusSourcesAtom)

  const handleRefresh = useCallback(async () => {
    const data = await fetchNewsForce()
    queryClient.setQueryData(["news"], data)
  }, [queryClient])

  const filtered = sources?.filter(s => {
    if (currentTab === "focus") return focusList.includes(s.sourceId)
    return true
  })

  return (
    <div className="h-full overflow-x-auto px-4 md:px-10 lg:px-24">
      <Header onRefresh={handleRefresh} />

      <div className="flex justify-center md:hidden mb-4">
        <NavBar />
      </div>

      <main className="mt-2 min-h-[calc(100vh-180px)] md:min-h-[calc(100vh-175px)] lg:min-h-[calc(100vh-194px)]">
        {isLoading && (
          <div className="text-center py-20 op-50">加载中...</div>
        )}

        {sources && sources.length === 0 && (
          <div className="text-center py-20 op-50">暂无新闻数据，请检查 MySQL 连接配置</div>
        )}

        {filtered && filtered.length === 0 && !isLoading && (
          <div className="text-center py-20 op-50">
            {currentTab === "focus" ? "还没有关注任何新闻源，点击卡片上的星标关注" : "暂无数据"}
          </div>
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
