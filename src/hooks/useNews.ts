import { useQuery } from "@tanstack/react-query"
import { ofetch } from "ofetch"
import type { SourceResponse } from "@shared/types"

export function useNews() {
  return useQuery({
    queryKey: ["news"],
    queryFn: () => ofetch<SourceResponse[]>("/api/news"),
  })
}
