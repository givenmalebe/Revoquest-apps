interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  relevance: number;
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  timestamp: Date;
}

export class WebSearchService {
  private static readonly SEARCH_API_URL = 'https://api.duckduckgo.com/';
  private static readonly BACKUP_SEARCH_URL = 'https://serpapi.com/search';
  
  /**
   * Search the web for information about a topic
   */
  static async searchTopic(query: string): Promise<SearchResponse> {
    try {
      // Try DuckDuckGo first (free API)
      const response = await this.searchWithDuckDuckGo(query);
      return response;
    } catch (error) {
      console.error('Web search failed:', error);
      throw new Error('Web search service is currently unavailable. Please try again later.');
    }
  }

  /**
   * Search using DuckDuckGo Instant Answer API
   */
  private static async searchWithDuckDuckGo(query: string): Promise<SearchResponse> {
    const searchUrl = `${this.SEARCH_API_URL}?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    
    try {
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      const results: SearchResult[] = [];
      
      // Parse DuckDuckGo results
      if (data.AbstractText) {
        results.push({
          title: data.Heading || query,
          snippet: data.AbstractText,
          url: data.AbstractURL || '',
          relevance: 0.9
        });
      }
      
      // Add related topics
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        data.RelatedTopics.slice(0, 3).forEach((topic: any, index: number) => {
          if (topic.Text) {
            results.push({
              title: topic.FirstURL ? this.extractTitleFromUrl(topic.FirstURL) : `Related: ${query}`,
              snippet: topic.Text,
              url: topic.FirstURL || '',
              relevance: 0.8 - (index * 0.1)
            });
          }
        });
      }
      
      // If no results, return empty response
      if (results.length === 0) {
        return {
          query,
          results: [],
          timestamp: new Date()
        };
      }
      
      return {
        query,
        results,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`DuckDuckGo search failed: ${error}`);
    }
  }


  /**
   * Extract a readable title from a URL
   */
  private static extractTitleFromUrl(url: string): string {
    try {
      const urlParts = new URL(url).pathname.split('/');
      const lastPart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
      return lastPart.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, '').replace(/\b\w/g, l => l.toUpperCase());
    } catch {
      return 'Related Information';
    }
  }

  /**
   * Search for diagram-specific information
   */
  static async searchForDiagramData(topic: string): Promise<{
    processSteps: string[];
    components: string[];
    relationships: string[];
    visualElements: string[];
  }> {
    const searchResults = await this.searchTopic(`${topic} process diagram components`);
    
    return this.extractDiagramDataFromResults(searchResults, topic);
  }

  /**
   * Extract diagram-relevant information from search results
   */
  private static extractDiagramDataFromResults(searchResults: SearchResponse, topic: string): {
    processSteps: string[];
    components: string[];
    relationships: string[];
    visualElements: string[];
  } {
    const text = searchResults.results.map(r => r.snippet).join(' ').toLowerCase();
    
    // Extract process-related keywords
    const processWords = ['process', 'step', 'stage', 'phase', 'method', 'procedure', 'workflow', 'algorithm'];
    const componentWords = ['component', 'element', 'part', 'system', 'module', 'unit', 'structure'];
    const relationshipWords = ['connects', 'leads to', 'results in', 'causes', 'affects', 'influences', 'transforms'];
    
    const processSteps = this.extractKeywords(text, processWords, topic);
    const components = this.extractKeywords(text, componentWords, topic);
    const relationships = this.extractKeywords(text, relationshipWords, topic);
    
    // Generate visual elements based on topic
    const visualElements = this.generateVisualElements(topic);
    
    return {
      processSteps: processSteps.length > 0 ? processSteps : this.getDefaultProcessSteps(topic),
      components: components.length > 0 ? components : this.getDefaultComponents(topic),
      relationships: relationships.length > 0 ? relationships : this.getDefaultRelationships(topic),
      visualElements
    };
  }

  private static extractKeywords(text: string, keywords: string[], topic: string): string[] {
    const found: string[] = [];
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        found.push(keyword);
      }
    });
    return found.slice(0, 3); // Limit to 3 items
  }

  private static getDefaultProcessSteps(topic: string): string[] {
    const lowerTopic = topic.toLowerCase();
    if (lowerTopic.includes('machine learning') || lowerTopic.includes('ai')) {
      return ['Data Collection', 'Training', 'Prediction'];
    } else if (lowerTopic.includes('photosynthesis')) {
      return ['Light Absorption', 'Chemical Reaction', 'Glucose Production'];
    } else {
      return ['Input', 'Processing', 'Output'];
    }
  }

  private static getDefaultComponents(topic: string): string[] {
    const lowerTopic = topic.toLowerCase();
    if (lowerTopic.includes('machine learning')) {
      return ['Algorithm', 'Data', 'Model'];
    } else if (lowerTopic.includes('photosynthesis')) {
      return ['Chloroplast', 'Sunlight', 'Carbon Dioxide'];
    } else {
      return ['System', 'Process', 'Result'];
    }
  }

  private static getDefaultRelationships(topic: string): string[] {
    return ['transforms', 'produces', 'enables'];
  }

  private static generateVisualElements(topic: string): string[] {
    const lowerTopic = topic.toLowerCase();
    if (lowerTopic.includes('machine learning')) {
      return ['🤖', '📊', '🧠', '⚡'];
    } else if (lowerTopic.includes('photosynthesis')) {
      return ['🌱', '☀️', '💧', '🍃'];
    } else if (lowerTopic.includes('blockchain')) {
      return ['🔗', '🔒', '💎', '🌐'];
    } else {
      return ['⚡', '🔄', '📈', '🎯'];
    }
  }
}
