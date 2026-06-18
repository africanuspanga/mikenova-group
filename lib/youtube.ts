import { XMLParser } from "fast-xml-parser"

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  duration?: string
  viewCount?: number
}

interface ApiVideoDetails {
  id: string
  duration?: string
  viewCount?: number
}

const CHANNEL_ID = "UCKOCG6Ayd4dtHMR7izgTG2Q"

export async function fetchChannelVideos(): Promise<{
  videos: YouTubeVideo[]
  error?: string
}> {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`
    const response = await fetch(rssUrl, {
      next: { revalidate: 3600 },
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    })

    if (!response.ok) {
      throw new Error(`RSS feed returned ${response.status}`)
    }

    const xml = await response.text()
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      parseAttributeValue: false,
      trimValues: true,
    })

    const parsed = parser.parse(xml)
    const entries = parsed.feed?.entry || []

    const videos: YouTubeVideo[] = entries.map((entry: any) => {
      const videoId = entry["yt:videoId"] || ""
      const mediaGroup = entry["media:group"] || {}
      const thumbnail =
        mediaGroup["media:thumbnail"]?.["@_url"] ||
        `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
      const description = mediaGroup["media:description"] || entry.summary || ""

      return {
        id: videoId,
        title: entry.title || "Untitled Video",
        description: typeof description === "string" ? description : "",
        thumbnail,
        publishedAt: entry.published || entry.updated || new Date().toISOString(),
      }
    })

    // Enrich with duration and view count if API key is available
    const apiKey = process.env.YOUTUBE_API_KEY
    if (apiKey && videos.length > 0) {
      const details = await fetchVideoDetails(videos.map((v) => v.id), apiKey)
      details.forEach((detail) => {
        const video = videos.find((v) => v.id === detail.id)
        if (video) {
          video.duration = detail.duration
          video.viewCount = detail.viewCount
        }
      })
    }

    return { videos }
  } catch (error) {
    console.error("Error fetching YouTube videos:", error)
    return {
      videos: [],
      error: "Unable to load videos right now. Please try again later.",
    }
  }
}

async function fetchVideoDetails(ids: string[], apiKey: string): Promise<ApiVideoDetails[]> {
  try {
    // YouTube Data API allows up to 50 IDs per request
    const chunks = chunkArray(ids, 50)
    const results: ApiVideoDetails[] = []

    for (const chunk of chunks) {
      const url = new URL("https://www.googleapis.com/youtube/v3/videos")
      url.searchParams.set("part", "contentDetails,statistics")
      url.searchParams.set("id", chunk.join(","))
      url.searchParams.set("key", apiKey)

      const response = await fetch(url.toString(), {
        next: { revalidate: 3600 },
      })

      if (!response.ok) {
        console.error(`YouTube API returned ${response.status}`)
        continue
      }

      const data = await response.json()
      const items = data.items || []

      items.forEach((item: any) => {
        results.push({
          id: item.id,
          duration: formatDuration(item.contentDetails?.duration),
          viewCount: Number.parseInt(item.statistics?.viewCount || "0", 10),
        })
      })
    }

    return results
  } catch (error) {
    console.error("Error fetching video details:", error)
    return []
  }
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

function formatDuration(isoDuration: string | undefined): string | undefined {
  if (!isoDuration) return undefined

  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return undefined

  const hours = Number.parseInt(match[1] || "0", 10)
  const minutes = Number.parseInt(match[2] || "0", 10)
  const seconds = Number.parseInt(match[3] || "0", 10)

  const paddedSeconds = seconds.toString().padStart(2, "0")
  const paddedMinutes = minutes.toString().padStart(2, "0")

  if (hours > 0) {
    return `${hours}:${paddedMinutes}:${paddedSeconds}`
  }
  return `${minutes}:${paddedSeconds}`
}

export function formatViewCount(count: number | undefined): string {
  if (count === undefined) return ""
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M views`
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K views`
  }
  return `${count} views`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
