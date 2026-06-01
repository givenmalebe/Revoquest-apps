import { getOpenRouterApiKey, openRouterGenerateText } from '@/services/openRouterClient';

const hasKey = !!getOpenRouterApiKey();

export interface VisualizationData {
  type: 'bar' | 'pie' | 'line' | 'network' | 'flowchart' | 'timeline' | 'comparison' | 'infographic';
  title: string;
  data: any;
  config: {
    colors?: string[];
    showLabels?: boolean;
    showValues?: boolean;
    animated?: boolean;
  };
}

export class VisualizationService {
  /**
   * Generate professional visualization data using the configured OpenRouter model
   */
  static async generateVisualization(
    topic: string, 
    slideType: string, 
    content: string
  ): Promise<VisualizationData | null> {
    // Check if API key is available
    if (!hasKey) {
      console.warn('OpenRouter API key not found. Using fallback visualization.');
      return this.getFallbackVisualization(topic, slideType);
    }

    try {
      const prompt = `Create a professional visualization for a presentation slide about "${topic}".

Slide Type: ${slideType}
Content: ${content}

Generate appropriate visualization data based on the content. Choose the most suitable visualization type from:
- bar: For comparing quantities or categories
- pie: For showing proportions or percentages
- network: For showing relationships or connections
- timeline: For showing chronological events or processes
- comparison: For showing before/after or pros/cons
- infographic: For showing key statistics or facts

Return a JSON object with this structure:
{
  "type": "bar|pie|network|timeline|comparison|infographic",
  "title": "Descriptive title for the visualization",
  "data": {
    // Structure depends on type:
    // For bar/pie: { labels: ["Label1", "Label2"], values: [10, 20] }
    // For network: { nodes: [{id, label, x, y}], connections: [{from, to}] }
    // For timeline: { events: [{step, time, title, description}] }
    // For comparison: { comparisons: [{title, points: []}] }
  },
  "config": {
    "colors": ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
    "showLabels": true,
    "showValues": true,
    "animated": true
  }
}

Make the data relevant to the topic and content. Use professional, educational language.`;

      const text = await openRouterGenerateText({ user: prompt, temperature: 0.7, max_tokens: 4096 });
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const visualizationData = JSON.parse(jsonMatch[0]);
        return visualizationData as VisualizationData;
      }
      
      return null;
    } catch (error) {
      console.error('Error generating visualization:', error);
      return null;
    }
  }

  /**
   * Generate multiple visualizations for different slide types
   */
  static async generateSlideVisualizations(
    topic: string,
    slides: Array<{ type: string; content: string; title: string }>
  ): Promise<Map<string, VisualizationData | null>> {
    const visualizations = new Map<string, VisualizationData | null>();
    
    for (const slide of slides) {
      const visualization = await this.generateVisualization(
        topic,
        slide.type,
        slide.content
      );
      visualizations.set(slide.type, visualization);
    }
    
    return visualizations;
  }

  /**
   * Generate a flowchart for process-based content
   */
  static async generateFlowchart(topic: string, process: string): Promise<VisualizationData | null> {
    try {
      const prompt = `Create a flowchart visualization for the process: "${process}" related to "${topic}".

Return a JSON object with this structure:
{
  "type": "network",
  "title": "Process Flow: ${topic}",
  "data": {
    "nodes": [
      {"id": "start", "label": "Start", "x": 50, "y": 20},
      {"id": "step1", "label": "Step 1", "x": 50, "y": 50},
      {"id": "step2", "label": "Step 2", "x": 50, "y": 80},
      {"id": "end", "label": "End", "x": 50, "y": 110}
    ],
    "connections": [
      {"from": "start", "to": "step1"},
      {"from": "step1", "to": "step2"},
      {"from": "step2", "to": "end"}
    ]
  },
  "config": {
    "colors": ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
    "showLabels": true,
    "animated": true
  }
}

Create a logical flow with 4-6 steps that represents the process.`;

      const text = await openRouterGenerateText({ user: prompt, temperature: 0.7, max_tokens: 4096 });
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const visualizationData = JSON.parse(jsonMatch[0]);
        return visualizationData as VisualizationData;
      }
      
      return null;
    } catch (error) {
      console.error('Error generating flowchart:', error);
      return null;
    }
  }

  /**
   * Generate comparison data for before/after scenarios
   */
  static async generateComparison(topic: string, before: string, after: string): Promise<VisualizationData | null> {
    try {
      const prompt = `Create a comparison visualization for "${topic}".

Before: ${before}
After: ${after}

Return a JSON object with this structure:
{
  "type": "comparison",
  "title": "Comparison: ${topic}",
  "data": {
    "comparisons": [
      {
        "title": "Before",
        "points": ["Point 1", "Point 2", "Point 3"]
      },
      {
        "title": "After", 
        "points": ["Point 1", "Point 2", "Point 3"]
      }
    ]
  },
  "config": {
    "colors": ["#EF4444", "#10B981"],
    "animated": true
  }
}

Generate 3-4 key points for each side that highlight the differences.`;

      const text = await openRouterGenerateText({ user: prompt, temperature: 0.7, max_tokens: 4096 });
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const visualizationData = JSON.parse(jsonMatch[0]);
        return visualizationData as VisualizationData;
      }
      
      return null;
    } catch (error) {
      console.error('Error generating comparison:', error);
      return null;
    }
  }

  /**
   * Generate timeline data for chronological content
   */
  static async generateTimeline(topic: string, events: string[]): Promise<VisualizationData | null> {
    try {
      const prompt = `Create a timeline visualization for "${topic}" with these events: ${events.join(', ')}.

Return a JSON object with this structure:
{
  "type": "timeline",
  "title": "Timeline: ${topic}",
  "data": {
    "events": [
      {
        "step": "1",
        "time": "2020",
        "title": "Event Title",
        "description": "Event description"
      }
    ]
  },
  "config": {
    "colors": ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
    "animated": true
  }
}

Create 4-6 timeline events with appropriate years, titles, and descriptions.`;

      const text = await openRouterGenerateText({ user: prompt, temperature: 0.7, max_tokens: 4096 });
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const visualizationData = JSON.parse(jsonMatch[0]);
        return visualizationData as VisualizationData;
      }
      
      return null;
    } catch (error) {
      console.error('Error generating timeline:', error);
      return null;
    }
  }

  /**
   * Generate fallback visualization when API is not available
   */
  private static getFallbackVisualization(topic: string, slideType: string): VisualizationData {
    const fallbackData = {
      intro: {
        type: 'bar' as const,
        title: `Key Insights: ${topic}`,
        data: {
          labels: ['Concept', 'Application', 'Benefits', 'Impact'],
          values: [85, 92, 78, 88]
        },
        config: {
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
          showLabels: true,
          showValues: true,
          animated: true
        }
      },
      concept: {
        type: 'pie' as const,
        title: `Core Concepts: ${topic}`,
        data: {
          labels: ['Theory', 'Practice', 'Examples', 'Applications'],
          values: [30, 25, 25, 20]
        },
        config: {
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
          showLabels: true,
          showValues: true,
          animated: true
        }
      },
      example: {
        type: 'timeline' as const,
        title: `Implementation Timeline: ${topic}`,
        data: {
          events: [
            { step: '1', time: 'Week 1', title: 'Planning', description: 'Initial setup and planning phase' },
            { step: '2', time: 'Week 2', title: 'Development', description: 'Core development and implementation' },
            { step: '3', time: 'Week 3', title: 'Testing', description: 'Testing and quality assurance' },
            { step: '4', time: 'Week 4', title: 'Deployment', description: 'Final deployment and launch' }
          ]
        },
        config: {
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
          animated: true
        }
      },
      diagram: {
        type: 'network' as const,
        title: `Process Flow: ${topic}`,
        data: {
          nodes: [
            { id: 'start', label: 'Start', x: 50, y: 20 },
            { id: 'process1', label: 'Process 1', x: 50, y: 50 },
            { id: 'process2', label: 'Process 2', x: 50, y: 80 },
            { id: 'end', label: 'End', x: 50, y: 110 }
          ],
          connections: [
            { from: 'start', to: 'process1' },
            { from: 'process1', to: 'process2' },
            { from: 'process2', to: 'end' }
          ]
        },
        config: {
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
          showLabels: true,
          animated: true
        }
      },
      summary: {
        type: 'comparison' as const,
        title: `Before vs After: ${topic}`,
        data: {
          comparisons: [
            {
              title: 'Before',
              points: ['Limited understanding', 'Basic implementation', 'Manual processes']
            },
            {
              title: 'After',
              points: ['Deep knowledge', 'Advanced techniques', 'Automated workflows']
            }
          ]
        },
        config: {
          colors: ['#EF4444', '#10B981'],
          animated: true
        }
      }
    };

    return fallbackData[slideType as keyof typeof fallbackData] || fallbackData.intro;
  }
}
