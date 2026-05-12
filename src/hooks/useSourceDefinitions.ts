import { useQuery } from "@tanstack/react-query"
import { ofetch } from "ofetch"

export interface SourceDefinition {
  id: string
  name: string
  title?: string
  color?: string
  column?: string
  home?: string
}

export function useSourceDefinitions() {
  return useQuery({
    queryKey: ["source-definitions"],
    queryFn: () => ofetch<SourceDefinition[]>("/api/source-definitions"),
    staleTime: 60_000,
  })
}
