import { useNews } from "~/hooks/useNews"
import { NewsCard } from "./NewsCard"

export default function App() {
  const { data: sources, isLoading } = useNews()

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen">
      <header className="flex items-center gap-3 py-6">
        <span className="text-3xl">🦗</span>
        <div>
          <h1 className="text-2xl font-bold">知了</h1>
          <p className="text-sm opacity-60">CastNow - 新闻语音播报</p>
        </div>
      </header>

      {isLoading && (
        <div className="text-center py-20 opacity-50">加载中...</div>
      )}

      {sources && sources.length === 0 && (
        <div className="text-center py-20 opacity-50">暂无新闻数据，请检查 MySQL 连接配置</div>
      )}

      <div className="space-y-3">
        {sources?.map(source => (
          <NewsCard key={source.sourceId} source={source} />
        ))}
      </div>
    </div>
  )
}
