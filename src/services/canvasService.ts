import { openRouterGenerateText } from '@/services/openRouterClient';

export interface CanvasLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: string;
  elements: CanvasElement[];
}

export interface CanvasElement {
  id: string;
  type: 'shape' | 'text' | 'image' | 'path' | 'group';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  style: ElementStyle;
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ElementStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  opacity?: number;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
}

export interface CanvasState {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  layers: CanvasLayer[];
  selectedElements: string[];
  activeLayer: string;
  zoom: number;
  panX: number;
  panY: number;
  history: CanvasState[];
  historyIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AICanvasCommand {
  type: 'draw' | 'edit' | 'transform' | 'style' | 'generate' | 'analyze';
  prompt: string;
  targetElements?: string[];
  parameters?: any;
}

class CanvasService {
  private canvasStates: Map<string, CanvasState> = new Map();
  private currentCanvasId: string | null = null;

  // Create a new canvas
  createCanvas(name: string, width: number = 800, height: number = 600): CanvasState {
    const id = `canvas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const canvasState: CanvasState = {
      id,
      name,
      width,
      height,
      backgroundColor: '#ffffff',
      layers: [{
        id: 'layer_1',
        name: 'Background',
        visible: true,
        opacity: 1,
        blendMode: 'normal',
        elements: []
      }],
      selectedElements: [],
      activeLayer: 'layer_1',
      zoom: 1,
      panX: 0,
      panY: 0,
      history: [],
      historyIndex: -1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.canvasStates.set(id, canvasState);
    this.currentCanvasId = id;
    this.saveToHistory(canvasState);
    return canvasState;
  }

  // Get current canvas state
  getCurrentCanvas(): CanvasState | null {
    if (!this.currentCanvasId) return null;
    return this.canvasStates.get(this.currentCanvasId) || null;
  }

  // Save canvas state to history
  private saveToHistory(state: CanvasState): void {
    const newState = JSON.parse(JSON.stringify(state));
    const history = newState.history.slice(0, newState.historyIndex + 1);
    history.push(newState);
    newState.history = history.slice(-50); // Keep last 50 states
    newState.historyIndex = newState.history.length - 1;
    newState.updatedAt = new Date();
    
    this.canvasStates.set(state.id, newState);
  }

  // Add element to canvas
  addElement(element: Omit<CanvasElement, 'id' | 'createdAt' | 'updatedAt'>): CanvasElement {
    const canvas = this.getCurrentCanvas();
    if (!canvas) throw new Error('No active canvas');

    const newElement: CanvasElement = {
      ...element,
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const activeLayer = canvas.layers.find(layer => layer.id === canvas.activeLayer);
    if (activeLayer) {
      activeLayer.elements.push(newElement);
      this.saveToHistory(canvas);
    }

    return newElement;
  }

  // AI-powered canvas operations
  async executeAICommand(command: AICanvasCommand): Promise<CanvasState> {
    const canvas = this.getCurrentCanvas();
    if (!canvas) throw new Error('No active canvas');

    try {
      switch (command.type) {
        case 'draw':
          return await this.aiDraw(command.prompt, command.parameters);
        case 'edit':
          return await this.aiEdit(command.prompt, command.targetElements, command.parameters);
        case 'transform':
          return await this.aiTransform(command.prompt, command.targetElements, command.parameters);
        case 'style':
          return await this.aiStyle(command.prompt, command.targetElements, command.parameters);
        case 'generate':
          return await this.aiGenerate(command.prompt, command.parameters);
        case 'analyze':
          return await this.aiAnalyze(command.prompt, command.parameters);
        default:
          throw new Error(`Unknown AI command type: ${command.type}`);
      }
    } catch (error) {
      console.error('AI Command execution failed:', error);
      throw error;
    }
  }

  // AI Draw - Generate drawings based on prompts
  private async aiDraw(prompt: string, parameters?: any): Promise<CanvasState> {
    const canvas = this.getCurrentCanvas()!;
    
    const aiPrompt = `You are an AI artist. Create a detailed drawing based on this prompt: "${prompt}".

    Return a JSON object with this structure:
    {
      "elements": [
        {
          "type": "shape",
          "x": 100,
          "y": 100,
          "width": 200,
          "height": 150,
          "style": {
            "fill": "#3b82f6",
            "stroke": "#1e40af",
            "strokeWidth": 2
          },
          "data": {
            "shapeType": "rectangle",
            "cornerRadius": 10
          }
        }
      ],
      "description": "Brief description of what was drawn"
    }

    Available shape types: rectangle, circle, ellipse, triangle, polygon, path
    Use appropriate colors and styling for the prompt.
    Create multiple elements if needed to represent the prompt fully.`;

    const text = await openRouterGenerateText({ user: aiPrompt, temperature: 0.7, max_tokens: 4096 });

    try {
      const parsed = JSON.parse(text);
      const elements = parsed.elements || [];

      // Add AI-generated elements to canvas
      elements.forEach((elementData: any) => {
        this.addElement({
          type: elementData.type || 'shape',
          x: elementData.x || 0,
          y: elementData.y || 0,
          width: elementData.width,
          height: elementData.height,
          style: elementData.style || {},
          data: elementData.data || {}
        });
      });

      return this.getCurrentCanvas()!;
    } catch (error) {
      console.error('Failed to parse AI drawing response:', error);
      throw new Error('AI drawing generation failed');
    }
  }

  // AI Edit - Modify existing elements
  private async aiEdit(prompt: string, targetElements?: string[], parameters?: any): Promise<CanvasState> {
    const canvas = this.getCurrentCanvas()!;
    
    const elements = targetElements 
      ? canvas.layers.flatMap(layer => layer.elements.filter(el => targetElements.includes(el.id)))
      : canvas.layers.flatMap(layer => layer.elements);

    const aiPrompt = `You are an AI editor. Modify the following canvas elements based on this prompt: "${prompt}".

    Current elements: ${JSON.stringify(elements.slice(0, 5))} // Show first 5 elements

    Return a JSON object with modifications:
    {
      "modifications": [
        {
          "elementId": "element_id",
          "changes": {
            "x": 150,
            "y": 200,
            "style": {
              "fill": "#ef4444"
            }
          }
        }
      ],
      "description": "What changes were made"
    }`;

    const text = await openRouterGenerateText({ user: aiPrompt, temperature: 0.7, max_tokens: 4096 });

    try {
      const parsed = JSON.parse(text);
      const modifications = parsed.modifications || [];

      // Apply modifications
      modifications.forEach((mod: any) => {
        const element = canvas.layers
          .flatMap(layer => layer.elements)
          .find(el => el.id === mod.elementId);
        
        if (element) {
          Object.assign(element, mod.changes);
          element.updatedAt = new Date();
        }
      });

      this.saveToHistory(canvas);
      return canvas;
    } catch (error) {
      console.error('Failed to parse AI edit response:', error);
      throw new Error('AI editing failed');
    }
  }

  // AI Transform - Apply transformations
  private async aiTransform(prompt: string, targetElements?: string[], parameters?: any): Promise<CanvasState> {
    const canvas = this.getCurrentCanvas()!;
    
    const aiPrompt = `Apply transformations to canvas elements based on: "${prompt}".

    Available transformations: rotate, scale, move, flip, skew
    Return transformation commands in JSON format.`;

    const text = await openRouterGenerateText({ user: aiPrompt, temperature: 0.7, max_tokens: 4096 });

    // Parse and apply transformations
    try {
      const parsed = JSON.parse(text);
      // Implementation for applying transformations
      this.saveToHistory(canvas);
      return canvas;
    } catch (error) {
      console.error('AI transformation failed:', error);
      throw new Error('AI transformation failed');
    }
  }

  // AI Style - Apply styling changes
  private async aiStyle(prompt: string, targetElements?: string[], parameters?: any): Promise<CanvasState> {
    const canvas = this.getCurrentCanvas()!;
    
    const aiPrompt = `Apply styling changes based on: "${prompt}".

    Available styles: colors, gradients, shadows, borders, effects
    Return styling commands in JSON format.`;

    const text = await openRouterGenerateText({ user: aiPrompt, temperature: 0.7, max_tokens: 4096 });

    try {
      const parsed = JSON.parse(text);
      // Implementation for applying styles
      this.saveToHistory(canvas);
      return canvas;
    } catch (error) {
      console.error('AI styling failed:', error);
      throw new Error('AI styling failed');
    }
  }

  // AI Generate - Generate complex compositions
  private async aiGenerate(prompt: string, parameters?: any): Promise<CanvasState> {
    const canvas = this.getCurrentCanvas()!;
    
    const aiPrompt = `Generate a complete canvas composition based on: "${prompt}".

    Create a sophisticated design with multiple elements, proper spacing, colors, and visual hierarchy.
    Return a comprehensive JSON structure with all elements needed.`;

    const text = await openRouterGenerateText({ user: aiPrompt, temperature: 0.7, max_tokens: 4096 });

    try {
      const parsed = JSON.parse(text);
      const elements = parsed.elements || [];

      // Clear existing elements and add new ones
      canvas.layers.forEach(layer => {
        layer.elements = [];
      });

      elements.forEach((elementData: any) => {
        this.addElement({
          type: elementData.type || 'shape',
          x: elementData.x || 0,
          y: elementData.y || 0,
          width: elementData.width,
          height: elementData.height,
          style: elementData.style || {},
          data: elementData.data || {}
        });
      });

      return this.getCurrentCanvas()!;
    } catch (error) {
      console.error('AI generation failed:', error);
      throw new Error('AI generation failed');
    }
  }

  // AI Analyze - Analyze canvas content
  private async aiAnalyze(prompt: string, parameters?: any): Promise<CanvasState> {
    const canvas = this.getCurrentCanvas()!;
    
    const elements = canvas.layers.flatMap(layer => layer.elements);
    
    const aiPrompt = `Analyze this canvas composition and provide insights based on: "${prompt}".

    Canvas elements: ${JSON.stringify(elements.slice(0, 10))}

    Provide analysis in JSON format with suggestions for improvement.`;

    const text = await openRouterGenerateText({ user: aiPrompt, temperature: 0.7, max_tokens: 4096 });

    // Return analysis results (could be used for suggestions)
    return canvas;
  }

  // Undo/Redo functionality
  undo(): CanvasState | null {
    const canvas = this.getCurrentCanvas();
    if (!canvas || canvas.historyIndex <= 0) return null;

    const previousState = canvas.history[canvas.historyIndex - 1];
    canvas.historyIndex--;
    this.canvasStates.set(canvas.id, { ...canvas, ...previousState });
    return this.getCurrentCanvas()!;
  }

  redo(): CanvasState | null {
    const canvas = this.getCurrentCanvas();
    if (!canvas || canvas.historyIndex >= canvas.history.length - 1) return null;

    const nextState = canvas.history[canvas.historyIndex + 1];
    canvas.historyIndex++;
    this.canvasStates.set(canvas.id, { ...canvas, ...nextState });
    return this.getCurrentCanvas()!;
  }

  // Export canvas as image
  exportCanvas(format: 'png' | 'jpg' | 'svg' = 'png'): string {
    const canvas = this.getCurrentCanvas();
    if (!canvas) throw new Error('No active canvas');

    // Implementation for exporting canvas
    // This would render the canvas state to an actual HTML5 canvas element
    return `data:image/${format};base64,${btoa('canvas-export')}`;
  }

  // Save/Load canvas
  saveCanvas(name?: string): string {
    const canvas = this.getCurrentCanvas();
    if (!canvas) throw new Error('No active canvas');

    const saveData = {
      ...canvas,
      name: name || canvas.name,
      savedAt: new Date()
    };

    localStorage.setItem(`canvas_${canvas.id}`, JSON.stringify(saveData));
    return canvas.id;
  }

  loadCanvas(canvasId: string): CanvasState | null {
    const savedData = localStorage.getItem(`canvas_${canvasId}`);
    if (!savedData) return null;

    try {
      const canvas = JSON.parse(savedData);
      this.canvasStates.set(canvasId, canvas);
      this.currentCanvasId = canvasId;
      return canvas;
    } catch (error) {
      console.error('Failed to load canvas:', error);
      return null;
    }
  }

  // Get all saved canvases
  getSavedCanvases(): Array<{id: string, name: string, savedAt: Date}> {
    const canvases = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('canvas_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          canvases.push({
            id: data.id,
            name: data.name,
            savedAt: new Date(data.savedAt)
          });
        } catch (error) {
          console.error('Failed to parse saved canvas:', error);
        }
      }
    }
    return canvases;
  }
}

export const canvasService = new CanvasService();
