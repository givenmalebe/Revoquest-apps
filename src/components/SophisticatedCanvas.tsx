import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, 
  Download, 
  Upload, 
  Undo, 
  Redo, 
  Save, 
  Layers, 
  Settings,
  Wand2,
  Brush,
  Square,
  Circle,
  Type,
  Image,
  Move,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Grid,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Copy,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { canvasService, CanvasState, CanvasElement, AICanvasCommand } from '@/services/canvasService';

interface SophisticatedCanvasProps {
  className?: string;
  onCanvasChange?: (state: CanvasState) => void;
}

export const SophisticatedCanvas: React.FC<SophisticatedCanvasProps> = ({ 
  className, 
  onCanvasChange 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasState, setCanvasState] = useState<CanvasState | null>(null);
  const [selectedTool, setSelectedTool] = useState<'select' | 'draw' | 'text' | 'shape' | 'ai'>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [activeLayer, setActiveLayer] = useState<string>('layer_1');

  // Initialize canvas
  useEffect(() => {
    const newCanvas = canvasService.createCanvas('AI Canvas', 800, 600);
    setCanvasState(newCanvas);
    onCanvasChange?.(newCanvas);
  }, [onCanvasChange]);

  // Render canvas
  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !canvasState) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background
    ctx.fillStyle = canvasState.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(panX, panY);

    // Draw grid
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    // Render layers
    canvasState.layers.forEach(layer => {
      if (!layer.visible) return;
      
      ctx.save();
      ctx.globalAlpha = layer.opacity;
      
      layer.elements.forEach(element => {
        renderElement(ctx, element);
      });
      
      ctx.restore();
    });

    ctx.restore();
  }, [canvasState, zoom, panX, panY, showGrid]);

  // Draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  // Render individual element
  const renderElement = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    ctx.save();
    
    // Apply transformations
    ctx.translate(element.x, element.y);
    if (element.rotation) ctx.rotate(element.rotation);
    if (element.scaleX || element.scaleY) {
      ctx.scale(element.scaleX || 1, element.scaleY || 1);
    }

    // Apply styles
    if (element.style.fill) ctx.fillStyle = element.style.fill;
    if (element.style.stroke) ctx.strokeStyle = element.style.stroke;
    if (element.style.strokeWidth) ctx.lineWidth = element.style.strokeWidth;
    if (element.style.opacity) ctx.globalAlpha = element.style.opacity;

    // Apply shadow
    if (element.style.shadow) {
      ctx.shadowColor = element.style.shadow.color;
      ctx.shadowBlur = element.style.shadow.blur;
      ctx.shadowOffsetX = element.style.shadow.offsetX;
      ctx.shadowOffsetY = element.style.shadow.offsetY;
    }

    // Render based on type
    switch (element.type) {
      case 'shape':
        renderShape(ctx, element);
        break;
      case 'text':
        renderText(ctx, element);
        break;
      case 'image':
        renderImage(ctx, element);
        break;
      case 'path':
        renderPath(ctx, element);
        break;
    }

    // Draw selection outline
    if (selectedElements.includes(element.id)) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(-2, -2, (element.width || 0) + 4, (element.height || 0) + 4);
      ctx.setLineDash([]);
    }

    ctx.restore();
  };

  // Render shape
  const renderShape = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    const { width = 100, height = 100 } = element;
    const shapeType = element.data?.shapeType || 'rectangle';

    switch (shapeType) {
      case 'rectangle':
        ctx.fillRect(0, 0, width, height);
        ctx.strokeRect(0, 0, width, height);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
    }
  };

  // Render text
  const renderText = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    const text = element.data?.text || 'Text';
    const fontSize = element.style.fontSize || 16;
    const fontFamily = element.style.fontFamily || 'Arial';
    
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillText(text, 0, fontSize);
  };

  // Render image
  const renderImage = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    const imageData = element.data?.imageData;
    if (imageData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, element.width || 100, element.height || 100);
      };
      img.src = imageData;
    }
  };

  // Render path
  const renderPath = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    const pathData = element.data?.pathData;
    if (pathData) {
      ctx.beginPath();
      // Implement path rendering
      ctx.stroke();
    }
  };

  // Update canvas when state changes
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // AI Commands
  const executeAICommand = async (command: AICanvasCommand) => {
    setIsAIGenerating(true);
    try {
      const newState = await canvasService.executeAICommand(command);
      setCanvasState(newState);
      onCanvasChange?.(newState);
      renderCanvas();
    } catch (error) {
      console.error('AI command failed:', error);
    } finally {
      setIsAIGenerating(false);
    }
  };

  // Tool handlers
  const handleAIDraw = async () => {
    if (!aiPrompt.trim()) return;
    await executeAICommand({
      type: 'draw',
      prompt: aiPrompt,
      parameters: { brushSize, brushColor }
    });
    setAiPrompt('');
  };

  const handleAIEdit = async () => {
    if (!aiPrompt.trim()) return;
    await executeAICommand({
      type: 'edit',
      prompt: aiPrompt,
      targetElements: selectedElements
    });
    setAiPrompt('');
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    await executeAICommand({
      type: 'generate',
      prompt: aiPrompt
    });
    setAiPrompt('');
  };

  // Canvas operations
  const handleUndo = () => {
    const newState = canvasService.undo();
    if (newState) {
      setCanvasState(newState);
      onCanvasChange?.(newState);
      renderCanvas();
    }
  };

  const handleRedo = () => {
    const newState = canvasService.redo();
    if (newState) {
      setCanvasState(newState);
      onCanvasChange?.(newState);
      renderCanvas();
    }
  };

  const handleSave = () => {
    if (canvasState) {
      canvasService.saveCanvas();
    }
  };

  const handleExport = () => {
    if (canvasState) {
      const dataURL = canvasService.exportCanvas('png');
      const link = document.createElement('a');
      link.download = `${canvasState.name}.png`;
      link.href = dataURL;
      link.click();
    }
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'draw') {
      setIsDrawing(true);
      // Implement drawing logic
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing && selectedTool === 'draw') {
      // Implement drawing logic
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  if (!canvasState) return null;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>AI Canvas Studio</span>
              {isAIGenerating && (
                <Badge variant="secondary">
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  AI Working
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleUndo}>
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleRedo}>
                <Redo className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="tools" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="ai">AI Assistant</TabsTrigger>
              <TabsTrigger value="layers">Layers</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tools" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={selectedTool === 'select' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTool('select')}
                >
                  <Move className="w-4 h-4" />
                </Button>
                <Button
                  variant={selectedTool === 'draw' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTool('draw')}
                >
                  <Brush className="w-4 h-4" />
                </Button>
                <Button
                  variant={selectedTool === 'shape' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTool('shape')}
                >
                  <Square className="w-4 h-4" />
                </Button>
                <Button
                  variant={selectedTool === 'text' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTool('text')}
                >
                  <Type className="w-4 h-4" />
                </Button>
              </div>
              
              {selectedTool === 'draw' && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Brush Size:</span>
                    <Slider
                      value={[brushSize]}
                      onValueChange={(value) => setBrushSize(value[0])}
                      max={50}
                      min={1}
                      step={1}
                      className="w-20"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Color:</span>
                    <input
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="w-8 h-8 rounded border"
                    />
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="ai" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe what you want to create..."
                    className="flex-1"
                  />
                  <Button onClick={handleAIDraw} disabled={isAIGenerating}>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Draw
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={handleAIEdit}
                    disabled={isAIGenerating || selectedElements.length === 0}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Selected
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleAIGenerate}
                    disabled={isAIGenerating}
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Generate Scene
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="layers" className="space-y-4">
              <div className="space-y-2">
                {canvasState.layers.map((layer) => (
                  <div key={layer.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveLayer(layer.id)}
                      >
                        {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <span className="text-sm">{layer.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={[layer.opacity * 100]}
                        onValueChange={(value) => {
                          // Update layer opacity
                        }}
                        max={100}
                        min={0}
                        step={1}
                        className="w-20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Grid</span>
                  <Button
                    variant={showGrid ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowGrid(!showGrid)}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Zoom:</span>
                  <Button variant="outline" size="sm" onClick={() => setZoom(zoom * 0.8)}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">{Math.round(zoom * 100)}%</span>
                  <Button variant="outline" size="sm" onClick={() => setZoom(zoom * 1.25)}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="flex-1">
        <CardContent className="p-4 h-full">
          <div className="relative h-full border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="border border-gray-200 rounded w-full h-full cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />
            
            {/* Canvas Info */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {canvasState.width} × {canvasState.height} | {canvasState.layers.length} layers | {canvasState.layers.reduce((acc, layer) => acc + layer.elements.length, 0)} elements
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
