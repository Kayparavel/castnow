import { useQuery } from "@tanstack/react-query"
import { ofetch } from "ofetch"
import type { NewsItem } from "@shared/types"

export interface SourceResponse {
  sourceId: string
  updatedTime: number
  items: NewsItem[]
}

export function useNews() {
  return useQuery({
    queryKey: ["news"],
    queryFn: () => ofetch<SourceResponse[]>("/api/news"),
  })
}
