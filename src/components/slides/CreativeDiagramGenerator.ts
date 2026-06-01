import { WebSearchService } from '../../services/webSearchService';

interface DiagramNode {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end' | 'concept';
  position: { x: number; y: number };
  color?: string;
  icon?: string;
}

interface DiagramConnection {
  from: string;
  to: string;
  label?: string;
}

interface CreativeDiagram {
  title: string;
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  theme: string;
  visualElements: string[];
  layout: 'horizontal' | 'vertical' | 'circular' | 'hierarchical' | 'grid';
}

export class CreativeDiagramGenerator {
  /**
   * Generate a creative diagram based on web search results
   */
  static async generateDiagram(topic: string): Promise<CreativeDiagram> {
    try {
      // Search for diagram-specific information
      const diagramData = await WebSearchService.searchForDiagramData(topic);
      
      // Generate diagram based on search results
      return this.createDiagramFromData(topic, diagramData);
    } catch (error) {
      console.log('Using fallback diagram generation');
      // Fallback to topic-based diagram generation
      return this.generateFallbackDiagram(topic);
    }
  }

  /**
   * Create diagram from web search data
   */
  private static createDiagramFromData(topic: string, data: {
    processSteps: string[];
    components: string[];
    relationships: string[];
    visualElements: string[];
  }): CreativeDiagram {
    const lowerTopic = topic.toLowerCase();
    
    // Determine diagram theme based on topic
    const theme = this.getDiagramTheme(lowerTopic);
    
    // Create nodes based on process steps and components
    const nodes: DiagramNode[] = [];
    const connections: DiagramConnection[] = [];
    
    // Generate creative layouts based on topic type
    if (lowerTopic.includes('machine learning') || lowerTopic.includes('ai')) {
      return this.createMLDiagram(topic, data);
    } else if (lowerTopic.includes('photosynthesis') || lowerTopic.includes('plant')) {
      return this.createPhotosynthesisDiagram(topic, data);
    } else if (lowerTopic.includes('blockchain') || lowerTopic.includes('crypto')) {
      return this.createBlockchainDiagram(topic, data);
    } else if (lowerTopic.includes('programming') || lowerTopic.includes('code')) {
      return this.createProgrammingDiagram(topic, data);
    } else if (lowerTopic.includes('business') || lowerTopic.includes('management')) {
      return this.createBusinessDiagram(topic, data);
    } else {
      return this.createGenericDiagram(topic, data);
    }
  }

  /**
   * Create Machine Learning specific diagram
   */
  private static createMLDiagram(topic: string, data: any): CreativeDiagram {
    return {
      title: 'AI/ML Process Flow',
      theme: 'technology',
      layout: 'hierarchical',
      visualElements: ['🤖', '📊', '🧠', '⚡', '🎯'],
      nodes: [
        { id: 'data', label: 'Raw Data', type: 'start', position: { x: 0, y: 0 }, icon: '📊' },
        { id: 'preprocess', label: 'Data Cleaning', type: 'process', position: { x: 0, y: 0 }, icon: '🔧' },
        { id: 'feature', label: 'Feature Extraction', type: 'process', position: { x: 0, y: 0 }, icon: '🎯' },
        { id: 'algorithm', label: 'ML Algorithm', type: 'concept', position: { x: 0, y: 0 }, icon: '🤖', color: 'bg-purple-100 text-purple-800' },
        { id: 'training', label: 'Model Training', type: 'process', position: { x: 0, y: 0 }, icon: '🧠' },
        { id: 'validation', label: 'Validation', type: 'decision', position: { x: 0, y: 0 }, icon: '✓' },
        { id: 'model', label: 'Trained Model', type: 'concept', position: { x: 0, y: 0 }, icon: '🎓', color: 'bg-green-100 text-green-800' },
        { id: 'prediction', label: 'Predictions', type: 'end', position: { x: 0, y: 0 }, icon: '🔮' }
      ],
      connections: [
        { from: 'data', to: 'preprocess', label: 'Clean' },
        { from: 'data', to: 'feature', label: 'Extract' },
        { from: 'preprocess', to: 'algorithm', label: 'Input' },
        { from: 'feature', to: 'algorithm', label: 'Features' },
        { from: 'algorithm', to: 'training', label: 'Learn' },
        { from: 'algorithm', to: 'validation', label: 'Test' },
        { from: 'training', to: 'model', label: 'Create' },
        { from: 'validation', to: 'model', label: 'Validate' },
        { from: 'model', to: 'prediction', label: 'Predict' }
      ]
    };
  }

  /**
   * Create Photosynthesis specific diagram
   */
  private static createPhotosynthesisDiagram(topic: string, data: any): CreativeDiagram {
    return {
      title: 'Photosynthesis Process',
      theme: 'nature',
      layout: 'hierarchical',
      visualElements: ['🌱', '☀️', '💧', '🍃', '🌿'],
      nodes: [
        { id: 'sunlight', label: 'Sunlight', type: 'start', position: { x: 0, y: 0 }, icon: '☀️' },
        { id: 'water', label: 'Water (H₂O)', type: 'start', position: { x: 0, y: 0 }, icon: '💧' },
        { id: 'co2', label: 'CO₂', type: 'start', position: { x: 0, y: 0 }, icon: '🌫️' },
        { id: 'chloroplast', label: 'Chloroplast', type: 'concept', position: { x: 0, y: 0 }, icon: '🍃', color: 'bg-green-100 text-green-800' },
        { id: 'light-reaction', label: 'Light Reactions', type: 'process', position: { x: 0, y: 0 }, icon: '⚡' },
        { id: 'calvin-cycle', label: 'Calvin Cycle', type: 'process', position: { x: 0, y: 0 }, icon: '🔄' },
        { id: 'glucose', label: 'Glucose (C₆H₁₂O₆)', type: 'end', position: { x: 0, y: 0 }, icon: '🍯' },
        { id: 'oxygen', label: 'Oxygen (O₂)', type: 'end', position: { x: 0, y: 0 }, icon: '💨' }
      ],
      connections: [
        { from: 'sunlight', to: 'chloroplast', label: 'Energy' },
        { from: 'water', to: 'chloroplast', label: 'H₂O' },
        { from: 'co2', to: 'chloroplast', label: 'Carbon' },
        { from: 'chloroplast', to: 'light-reaction', label: 'Light Phase' },
        { from: 'chloroplast', to: 'calvin-cycle', label: 'Dark Phase' },
        { from: 'light-reaction', to: 'glucose', label: 'ATP/NADPH' },
        { from: 'calvin-cycle', to: 'glucose', label: 'Sugar' },
        { from: 'light-reaction', to: 'oxygen', label: 'O₂ Release' }
      ]
    };
  }

  /**
   * Create Blockchain specific diagram
   */
  private static createBlockchainDiagram(topic: string, data: any): CreativeDiagram {
    return {
      title: 'Blockchain Network',
      theme: 'crypto',
      layout: 'horizontal',
      visualElements: ['🔗', '🔒', '💎', '🌐', '⛓️'],
      nodes: [
        { id: 'transaction', label: 'Transaction', type: 'start', position: { x: 0, y: 0 }, icon: '💳' },
        { id: 'verification', label: 'Verification', type: 'process', position: { x: 0, y: 0 }, icon: '🔍' },
        { id: 'consensus', label: 'Consensus', type: 'decision', position: { x: 0, y: 0 }, icon: '🤝' },
        { id: 'mining', label: 'Mining/Validation', type: 'process', position: { x: 0, y: 0 }, icon: '⛏️' },
        { id: 'block', label: 'New Block', type: 'concept', position: { x: 0, y: 0 }, icon: '📦', color: 'bg-blue-100 text-blue-800' },
        { id: 'chain', label: 'Blockchain', type: 'concept', position: { x: 0, y: 0 }, icon: '⛓️', color: 'bg-purple-100 text-purple-800' },
        { id: 'network', label: 'Distributed Network', type: 'end', position: { x: 0, y: 0 }, icon: '🌐' }
      ],
      connections: [
        { from: 'transaction', to: 'verification', label: 'Validate' },
        { from: 'transaction', to: 'consensus', label: 'Agree' },
        { from: 'verification', to: 'mining', label: 'Process' },
        { from: 'consensus', to: 'mining', label: 'Confirm' },
        { from: 'mining', to: 'block', label: 'Create' },
        { from: 'mining', to: 'chain', label: 'Add' },
        { from: 'block', to: 'network', label: 'Broadcast' },
        { from: 'chain', to: 'network', label: 'Sync' }
      ]
    };
  }

  /**
   * Create Programming specific diagram
   */
  private static createProgrammingDiagram(topic: string, data: any): CreativeDiagram {
    return {
      title: 'Software Development Process',
      theme: 'development',
      visualElements: ['💻', '⚙️', '🔧', '🚀', '🐛'],
      nodes: [
        { id: 'requirements', label: 'Requirements', type: 'start', position: { x: 10, y: 50 }, icon: '📋' },
        { id: 'design', label: 'Design', type: 'process', position: { x: 25, y: 30 }, icon: '🎨' },
        { id: 'coding', label: 'Coding', type: 'process', position: { x: 45, y: 50 }, icon: '💻' },
        { id: 'testing', label: 'Testing', type: 'decision', position: { x: 25, y: 70 }, icon: '🧪' },
        { id: 'debugging', label: 'Debugging', type: 'process', position: { x: 65, y: 30 }, icon: '🐛' },
        { id: 'deployment', label: 'Deployment', type: 'process', position: { x: 65, y: 70 }, icon: '🚀' },
        { id: 'software', label: 'Working Software', type: 'end', position: { x: 85, y: 50 }, icon: '✨' }
      ],
      connections: [
        { from: 'requirements', to: 'design', label: 'Plan' },
        { from: 'design', to: 'coding', label: 'Implement' },
        { from: 'requirements', to: 'testing', label: 'Verify' },
        { from: 'coding', to: 'debugging', label: 'Fix' },
        { from: 'testing', to: 'deployment', label: 'Pass' },
        { from: 'debugging', to: 'deployment', label: 'Ready' },
        { from: 'deployment', to: 'software', label: 'Launch' }
      ]
    };
  }

  /**
   * Create Business specific diagram
   */
  private static createBusinessDiagram(topic: string, data: any): CreativeDiagram {
    return {
      title: 'Business Strategy Process',
      theme: 'business',
      visualElements: ['📊', '💼', '🎯', '📈', '💡'],
      nodes: [
        { id: 'analysis', label: 'Market Analysis', type: 'start', position: { x: 15, y: 50 }, icon: '📊' },
        { id: 'strategy', label: 'Strategy Planning', type: 'process', position: { x: 35, y: 30 }, icon: '💡' },
        { id: 'execution', label: 'Execution', type: 'process', position: { x: 55, y: 50 }, icon: '⚙️' },
        { id: 'monitoring', label: 'Monitoring', type: 'decision', position: { x: 35, y: 70 }, icon: '👁️' },
        { id: 'optimization', label: 'Optimization', type: 'process', position: { x: 75, y: 30 }, icon: '🔧' },
        { id: 'results', label: 'Business Results', type: 'end', position: { x: 90, y: 50 }, icon: '📈' }
      ],
      connections: [
        { from: 'analysis', to: 'strategy', label: 'Insights' },
        { from: 'strategy', to: 'execution', label: 'Implement' },
        { from: 'analysis', to: 'monitoring', label: 'Track' },
        { from: 'execution', to: 'optimization', label: 'Improve' },
        { from: 'monitoring', to: 'optimization', label: 'Adjust' },
        { from: 'optimization', to: 'results', label: 'Achieve' }
      ]
    };
  }

  /**
   * Create generic diagram for any topic
   */
  private static createGenericDiagram(topic: string, data: any): CreativeDiagram {
    const processSteps = data.processSteps.length >= 3 ? data.processSteps : ['Input', 'Processing', 'Output'];
    const visualElements = data.visualElements.length > 0 ? data.visualElements : ['⚡', '🔄', '📈', '🎯'];
    
    return {
      title: `${topic} Process Flow`,
      theme: 'general',
      layout: 'horizontal',
      visualElements,
      nodes: [
        { id: 'input', label: processSteps[0] || 'Input', type: 'start', position: { x: 0, y: 0 }, icon: visualElements[0] || '📥' },
        { id: 'process1', label: 'Analysis', type: 'process', position: { x: 0, y: 0 }, icon: visualElements[1] || '🔍' },
        { id: 'process2', label: processSteps[1] || 'Processing', type: 'process', position: { x: 0, y: 0 }, icon: visualElements[2] || '⚙️' },
        { id: 'decision', label: 'Evaluation', type: 'decision', position: { x: 0, y: 0 }, icon: '🤔' },
        { id: 'output', label: processSteps[2] || 'Output', type: 'end', position: { x: 0, y: 0 }, icon: visualElements[3] || '📤' }
      ],
      connections: [
        { from: 'input', to: 'process1', label: 'Analyze' },
        { from: 'process1', to: 'process2', label: 'Transform' },
        { from: 'process2', to: 'decision', label: 'Evaluate' },
        { from: 'decision', to: 'output', label: 'Complete' }
      ]
    };
  }

  /**
   * Generate fallback diagram when web search fails
   */
  private static generateFallbackDiagram(topic: string): CreativeDiagram {
    return this.createGenericDiagram(topic, {
      processSteps: ['Input', 'Processing', 'Output'],
      components: ['System', 'Process', 'Result'],
      relationships: ['transforms', 'produces', 'enables'],
      visualElements: ['⚡', '🔄', '📈', '🎯']
    });
  }

  /**
   * Determine diagram theme based on topic
   */
  private static getDiagramTheme(lowerTopic: string): string {
    if (lowerTopic.includes('ai') || lowerTopic.includes('machine learning')) return 'technology';
    if (lowerTopic.includes('plant') || lowerTopic.includes('photosynthesis')) return 'nature';
    if (lowerTopic.includes('blockchain') || lowerTopic.includes('crypto')) return 'crypto';
    if (lowerTopic.includes('programming') || lowerTopic.includes('code')) return 'development';
    if (lowerTopic.includes('business') || lowerTopic.includes('management')) return 'business';
    return 'general';
  }
}
