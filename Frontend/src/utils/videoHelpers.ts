export function isYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
}

export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function getVideoType(url: string): 'youtube' | 'direct' | 'unknown' {
  if (!url || !url.trim()) {
    return 'unknown';
  }

  // Check for YouTube first
  if (isYouTubeUrl(url)) {
    return 'youtube';
  }
  
  // Check for direct video file extensions
  if (url.match(/\.(mp4|m3u8|webm|mov|avi)(\?|$)/i)) {
    return 'direct';
  }
  
  // If it's not YouTube and not a direct video file, return unknown
  return 'unknown';
}
