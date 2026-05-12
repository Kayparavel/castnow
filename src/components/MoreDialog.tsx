import { useMemo, useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { useAtom } from "jotai"
import { focusSourcesAtom } from "~/atoms"
import { useSourceDefinitions, type SourceDefinition } from "~/hooks/useSourceDefinitions"

function groupByColumn(defs: SourceDefinition[]) {
  const map = new Map<string, { id: string; name: string; title?: string }[]>()
  for (const d of defs) {
    const col = d.column || "other"
    if (!map.has(col)) map.set(col, [])
    map.get(col)!.push({ id: d.id, name: d.name, title: d.title })
  }
  return Array.from(map.entries())
    .map(([column, sources]) => ({ column, sources }))
    .sort((a, b) => {
      if (a.column === "other") return 1
      if (b.column === "other") return -1
      return a.column.localeCompare(b.column)
    })
}

interface MoreDialogProps {
  open: boolean
  onClose: () => void
}

export function MoreDialog({ open, onClose }: MoreDialogProps) {
  const [query, setQuery] = useState("")
  const [focusList, setFocusList] = useAtom(focusSourcesAtom)
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: definitions } = useSourceDefinitions()

  const groups = useMemo(() => definitions ? groupByColumn(definitions) : [], [definitions])

  const filtered = useMemo(() => {
    if (!query) return groups
    const q = query.toLowerCase()
    return groups.map(g => ({
      ...g,
      sources: g.sources.filter(s =>
        s.name.toLowerCase().includes(q)
        || (s.title && s.title.toLowerCase().includes(q))
        || s.id.toLowerCase().includes(q)
      ),
    })).filter(g => g.sources.length > 0)
  }, [groups, query])

  useEffect(() => {
    if (open) {
      setQuery("")
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  const toggleFocus = (id: string) => {
    setFocusList(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-99 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-dark-600 rounded-2xl shadow-2xl w-full max-w-500px max-h-60vh flex flex-col overflow-hidden mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索新闻源..."
            className="w-full bg-transparent outline-none text-base placeholder:op-40"
          />
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          {filtered.length === 0 && (
            <div className="text-center py-8 op-40 text-sm">没有找到</div>
          )}
          {filtered.map(group => (
            <div key={group.column} className="mb-2">
              <div className="text-xs font-bold op-40 px-2 py-1 uppercase tracking-wide">
                {group.column}
              </div>
              {group.sources.map(item => {
                const isFocused = focusList.includes(item.id)
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-neutral-400/10 cursor-pointer transition-all"
                    onClick={() => toggleFocus(item.id)}
                  >
                    <span className="flex gap-2 items-center">
                      <span
                        className="w-4 h-4 rounded-md bg-cover flex-shrink-0"
                        style={{ backgroundImage: `url(/icons/${item.id.split("-")[0]}.png)` }}
                      />
                      <span className="text-sm">{item.name}</span>
                      {item.title && (
                        <span className="text-xs op-40">{item.title}</span>
                      )}
                    </span>
                    <span className={isFocused ? "i-ph:star-fill text-primary op-70" : "i-ph:star-duotone op-40"} />
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="p-3 pt-2 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center text-xs op-40">
          <span>点击星标关注 / 取消关注</span>
          <span>ESC 关闭</span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
