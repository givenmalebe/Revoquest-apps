export interface YouTubeVideoResult {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  viewCount: string;
  publishedAt: string;
  channelTitle: string;
  url: string;
}

export interface YouTubeSearchResponse {
  videos: YouTubeVideoResult[];
  totalResults: number;
}

class YouTubeService {
  private readonly API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  private readonly BASE_URL = 'https://www.googleapis.com/youtube/v3';

  /**
   * Search for YouTube videos based on a query
   */
  async searchVideos(query: string, maxResults: number = 5): Promise<YouTubeVideoResult[]> {
    if (!this.API_KEY) {
      console.warn('YouTube API key not found. Using mock data.');
      return this.getMockVideos(query);
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatVideoResults(data.items);
    } catch (error) {
      console.error('Error searching YouTube videos:', error);
      return this.getMockVideos(query);
    }
  }

  /**
   * Get video details including duration
   */
  async getVideoDetails(videoId: string): Promise<YouTubeVideoResult | null> {
    if (!this.API_KEY) {
      return null;
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        return this.formatVideoResult(data.items[0]);
      }
      return null;
    } catch (error) {
      console.error('Error getting video details:', error);
      return null;
    }
  }

  /**
   * Generate search query based on lesson title and topic
   */
  generateSearchQuery(lessonTitle: string, courseTopic: string, lessonType: string = 'video'): string {
    const baseQuery = `${courseTopic} ${lessonTitle}`;
    
    // Add type-specific keywords
    const typeKeywords = {
      video: 'tutorial guide',
      reading: 'explanation guide article',
      quiz: 'quiz test questions',
      project: 'project tutorial build',
      practice: 'practice exercises hands-on'
    };

    const keywords = typeKeywords[lessonType as keyof typeof typeKeywords] || 'tutorial';
    return `${baseQuery} ${keywords}`;
  }

  /**
   * Format YouTube API response to our interface
   */
  private formatVideoResults(items: any[]): YouTubeVideoResult[] {
    return items.map(item => this.formatVideoResult(item));
  }

  private formatVideoResult(item: any): YouTubeVideoResult {
    return {
      id: item.id.videoId || item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      duration: this.formatDuration(item.contentDetails?.duration),
      viewCount: item.statistics?.viewCount || '0',
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.id.videoId || item.id}`
    };
  }

  /**
   * Format ISO 8601 duration to readable format
   */
  private formatDuration(isoDuration: string): string {
    if (!isoDuration) return 'Unknown';
    
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 'Unknown';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Get mock videos for development/testing
   */
  private getMockVideos(query: string): YouTubeVideoResult[] {
    const mockVideos: YouTubeVideoResult[] = [
      {
        id: 'mock-1',
        title: `${query} - Complete Tutorial for Beginners`,
        description: `Learn ${query} from scratch with this comprehensive tutorial. Perfect for beginners who want to understand the fundamentals.`,
        thumbnail: 'https://via.placeholder.com/320x180?text=Video+Thumbnail',
        duration: '15:30',
        viewCount: '125000',
        publishedAt: '2024-01-15T10:00:00Z',
        channelTitle: 'Tech Tutorials',
        url: `https://www.youtube.com/watch?v=mock-1`
      },
      {
        id: 'mock-2',
        title: `${query} - Advanced Concepts Explained`,
        description: `Deep dive into advanced ${query} concepts with practical examples and real-world applications.`,
        thumbnail: 'https://via.placeholder.com/320x180?text=Advanced+Video',
        duration: '25:45',
        viewCount: '89000',
        publishedAt: '2024-01-10T14:30:00Z',
        channelTitle: 'Advanced Learning',
        url: `https://www.youtube.com/watch?v=mock-2`
      },
      {
        id: 'mock-3',
        title: `${query} - Hands-on Project Tutorial`,
        description: `Build a real project using ${query}. Step-by-step guide with code examples and best practices.`,
        thumbnail: 'https://via.placeholder.com/320x180?text=Project+Video',
        duration: '45:20',
        viewCount: '156000',
        publishedAt: '2024-01-05T09:15:00Z',
        channelTitle: 'Project Builders',
        url: `https://www.youtube.com/watch?v=mock-3`
      }
    ];

    return mockVideos;
  }

  /**
   * Extract video ID from YouTube URL
   */
  extractVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Generate embed URL for YouTube video
   */
  getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }
}

export const youtubeService = new YouTubeService();