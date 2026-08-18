import { VideoResult } from '../types';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      high: { url: string };
    };
  };
}

interface YouTubeVideoItem {
  id: string;
  contentDetails: {
    duration: string;
  };
}

function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export async function searchVideos(
  query: string,
  maxResults: number = 5
): Promise<VideoResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  const searchParams = new URLSearchParams({
    part: 'snippet',
    q: `${query} tutorial`,
    type: 'video',
    maxResults: maxResults.toString(),
    order: 'relevance',
    videoDuration: 'medium',
    key: apiKey,
  });

  const searchResponse = await fetch(`${YOUTUBE_API_BASE}/search?${searchParams}`);
  if (!searchResponse.ok) {
    throw new Error(`YouTube search failed: ${searchResponse.statusText}`);
  }

  const searchData = (await searchResponse.json()) as { items?: YouTubeSearchItem[] };
  const items: YouTubeSearchItem[] = searchData.items || [];

  if (items.length === 0) return [];

  const videoIds = items.map((item) => item.id.videoId).join(',');
  const detailParams = new URLSearchParams({
    part: 'contentDetails',
    id: videoIds,
    key: apiKey,
  });

  const detailResponse = await fetch(`${YOUTUBE_API_BASE}/videos?${detailParams}`);
  const detailData = (await detailResponse.json()) as { items?: YouTubeVideoItem[] };
  const details: YouTubeVideoItem[] = detailData.items || [];

  const durationMap = new Map(
    details.map((d) => [d.id, parseDuration(d.contentDetails.duration)])
  );

  return items.map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnailUrl: item.snippet.thumbnails.high.url,
    channelName: item.snippet.channelTitle,
    duration: durationMap.get(item.id.videoId) || '',
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  }));
}
