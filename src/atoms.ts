import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export type TabId = "all" | "focus" | string

export const currentTabAtom = atomWithStorage<TabId>("castnow:tab", "all")
export const focusSourcesAtom = atomWithStorage<string[]>("castnow:focus", [])
