import { useAtom, useAtomValue } from "jotai"
import { useState } from "react"
import { currentTabAtom, focusSourcesAtom, type TabId } from "~/atoms"
import { MoreDialog } from "./MoreDialog"

export function NavBar() {
  const [currentTab, setCurrentTab] = useAtom(currentTabAtom)
  const focusList = useAtomValue(focusSourcesAtom)
  const [showMore, setShowMore] = useState(false)

  const tabs: { id: TabId; label: string }[] = [
    { id: "focus", label: "关注" },
    { id: "all", label: "全部" },
  ]

  const focusCount = focusList.length

  return (
    <>
      <span className="flex p-3 rounded-2xl bg-primary/1 text-sm shadow shadow-primary/20 hover:shadow-primary/50 transition-shadow-500">
        <button
          type="button"
          onClick={() => setShowMore(true)}
          className="px-2 hover:(bg-primary/10 rounded-md) op-70 dark:op-90 cursor-pointer transition-all"
        >
          更多
        </button>
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCurrentTab(tab.id)}
            className={`px-2 hover:(bg-primary/10 rounded-md) cursor-pointer transition-all ${currentTab === tab.id ? "color-primary font-bold" : "op-70 dark:op-90"}`}
          >
            {tab.label}
            {tab.id === "focus" && focusCount > 0 && (
              <span className="ml-1 text-xs bg-primary/20 color-primary rounded-full px-1.5">{focusCount}</span>
            )}
          </button>
        ))}
      </span>

      <MoreDialog
        open={showMore}
        onClose={() => setShowMore(false)}
      />
    </>
  )
}
