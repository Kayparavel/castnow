export interface NewsItem {
  id: string | number
  title: string
  url: string
  mobileUrl?: string
  pubDate?: number | string
  extra?: {
    hover?: string
    date?: number | string
    info?: false | string
    diff?: number
    icon?: false | string | { url: string; scale: number }
  }
}

export interface SourceResponse {
  sourceId: string
  updatedTime: number
  items: NewsItem[]
}
