import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Edit3, Trash2, Plus, Move, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface SmartDiagramProps {
  title: string;
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'circular' | 'hierarchical' | 'grid';
  theme?: string;
  satisfactionScore?: number;
}

export const SmartDiagram: React.FC<SmartDiagramProps> = ({
  title,
  nodes,
  connections,
  className,
  layout = 'horizontal',
  theme = 'default',
  satisfactionScore = 0
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editableNodes, setEditableNodes] = useState<DiagramNode[]>([]);
  const [editableConnections, setEditableConnections] = useState<DiagramConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<DiagramNode | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Validate and clean input data
  const cleanTitle = title || 'Educational Diagram';
  const cleanNodes = Array.isArray(nodes) ? nodes.filter(node => node && node.id && node.label) : [];
  const cleanConnections = Array.isArray(connections) ? connections.filter(conn => 
    conn && conn.from && conn.to && 
    cleanNodes.find(n => n.id === conn.from) && 
    cleanNodes.find(n => n.id === conn.to)
  ) : [];

  // If no valid data, show error state
  if (cleanNodes.length === 0) {
    return (
      <div className={cn("p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl", className)}>
        <div className="text-gray-400 mb-2">📊</div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Diagram Loading</h3>
        <p className="text-sm text-gray-500">AI is generating your educational diagram...</p>
      </div>
    );
  }

  // Zoom control functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Initialize editable data when entering edit mode
  const toggleEditMode = () => {
    if (!isEditing) {
      setEditableNodes([...cleanNodes]);
      setEditableConnections([...cleanConnections]);
    } else {
      setSelectedNode(null);
      setEditingNode(null);
    }
    setIsEditing(!isEditing);
  };

  // Save changes and exit edit mode
  const saveChanges = () => {
    // Here you could emit changes to parent component
    console.log('Saving diagram changes:', { nodes: editableNodes, connections: editableConnections });
    setIsEditing(false);
    setSelectedNode(null);
    setEditingNode(null);
  };

  // Node editing functions
  const handleNodeClick = (nodeId: string, event: React.MouseEvent) => {
    if (!isEditing) return;
    event.stopPropagation();
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
  };

  const startEditingNode = (node: DiagramNode) => {
    setEditingNode({ ...node });
  };

  const updateEditingNode = (field: keyof DiagramNode, value: string) => {
    if (!editingNode) return;
    setEditingNode({ ...editingNode, [field]: value });
  };

  const saveNodeEdit = () => {
    if (!editingNode) return;
    setEditableNodes(prev => prev.map(node => 
      node.id === editingNode.id ? editingNode : node
    ));
    setEditingNode(null);
  };

  const deleteNode = (nodeId: string) => {
    setEditableNodes(prev => prev.filter(node => node.id !== nodeId));
    setEditableConnections(prev => prev.filter(conn => 
      conn.from !== nodeId && conn.to !== nodeId
    ));
    setSelectedNode(null);
  };

  const addNewNode = () => {
    const newNode: DiagramNode = {
      id: `node-${Date.now()}`,
      label: 'New Node',
      type: 'concept',
      position: { x: 50, y: 50 },
      icon: '📊',
      color: 'bg-gray-100 text-gray-800'
    };
    setEditableNodes(prev => [...prev, newNode]);
  };

  // Connection editing functions
  const deleteConnection = (fromId: string, toId: string) => {
    setEditableConnections(prev => prev.filter(conn => 
      !(conn.from === fromId && conn.to === toId)
    ));
  };

  const addConnection = (fromId: string, toId: string) => {
    const newConnection: DiagramConnection = {
      from: fromId,
      to: toId,
      label: 'connects to'
    };
    setEditableConnections(prev => [...prev, newConnection]);
  };

  // Get satisfaction indicator
  const getSatisfactionIndicator = () => {
    if (satisfactionScore >= 9) {
      return { icon: '🏆', color: 'text-yellow-600', label: 'Excellent Structure' };
    } else if (satisfactionScore >= 8) {
      return { icon: '⭐', color: 'text-green-600', label: 'Great Structure' };
    } else if (satisfactionScore >= 6) {
      return { icon: '✅', color: 'text-blue-600', label: 'Good Structure' };
    } else if (satisfactionScore >= 4) {
      return { icon: '📊', color: 'text-orange-600', label: 'Basic Structure' };
    } else {
      return { icon: '🔧', color: 'text-gray-600', label: 'Needs Improvement' };
    }
  };

  // Validate and enhance diagram structure
  const validateDiagramStructure = () => {
    if (cleanNodes.length === 0) return false;
    if (cleanConnections.length === 0) return false;
    
    // Check for valid node types
    const validTypes = ['start', 'process', 'concept', 'decision', 'end'];
    const hasValidTypes = cleanNodes.every(node => validTypes.includes(node.type));
    
    // Check for meaningful connections
    const validConnections = cleanConnections.every(conn => 
      cleanNodes.find(n => n.id === conn.from) && cleanNodes.find(n => n.id === conn.to)
    );
    
    return hasValidTypes && validConnections;
  };

  // Enhance nodes with better positioning and colors
  const enhanceNodes = (nodeList: DiagramNode[]) => {
    return nodeList.map(node => ({
      ...node,
      // Ensure proper color assignment based on type
      color: node.color || getDefaultColorForType(node.type),
      // Ensure proper icon assignment
      icon: node.icon || getDefaultIconForType(node.type),
      // Enhance label if too short
      label: node.label.length < 3 ? `${node.label} Node` : node.label
    }));
  };

  // Get default colors for node types
  const getDefaultColorForType = (type: string) => {
    switch (type) {
      case 'start': return 'bg-green-100 text-green-800';
      case 'process': return 'bg-blue-100 text-blue-800';
      case 'concept': return 'bg-purple-100 text-purple-800';
      case 'decision': return 'bg-yellow-100 text-yellow-800';
      case 'end': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get default icons for node types
  const getDefaultIconForType = (type: string) => {
    switch (type) {
      case 'start': return '🚀';
      case 'process': return '⚙️';
      case 'concept': return '💡';
      case 'decision': return '❓';
      case 'end': return '✅';
      default: return '📊';
    }
  };

  // Calculate structured positions based on layout type
  const getStructuredNodes = () => {
    const nodesToUse = isEditing ? editableNodes : cleanNodes;
    const connectionsToUse = isEditing ? editableConnections : cleanConnections;
    
    if (!validateDiagramStructure()) {
      console.warn('Invalid diagram structure detected, using enhanced fallback');
    }

    const enhancedNodes = enhanceNodes([...nodesToUse]);
    
    switch (layout) {
      case 'horizontal':
        return calculateHorizontalLayout(enhancedNodes);
      case 'vertical':
        return calculateVerticalLayout(enhancedNodes);
      case 'circular':
        return calculateCircularLayout(enhancedNodes);
      case 'hierarchical':
        return calculateHierarchicalLayout(enhancedNodes, connectionsToUse);
      case 'grid':
        return calculateGridLayout(enhancedNodes);
      default:
        return calculateHorizontalLayout(enhancedNodes);
    }
  };

  const calculateHorizontalLayout = (nodeList: DiagramNode[]) => {
    // Sort nodes for better flow: start -> process -> concept -> decision -> end
    const sortedNodes = [...nodeList].sort((a, b) => {
      const typeOrder = { 'start': 0, 'process': 1, 'concept': 2, 'decision': 3, 'end': 4 };
      return typeOrder[a.type] - typeOrder[b.type];
    });
    
    const margin = 8; // Reduced margin for more space
    const availableWidth = 100 - (2 * margin);
    
    if (sortedNodes.length === 1) {
      return [{
        ...sortedNodes[0],
        position: { x: 50, y: 50 }
      }];
    }
    
    const spacing = availableWidth / (sortedNodes.length - 1);
    
    return sortedNodes.map((node, index) => ({
      ...node,
      position: { 
        x: margin + (spacing * index), 
        y: 50 
      }
    }));
  };

  const calculateVerticalLayout = (nodeList: DiagramNode[]) => {
    // Sort nodes for logical vertical flow
    const sortedNodes = [...nodeList].sort((a, b) => {
      const typeOrder = { 'start': 0, 'process': 1, 'concept': 2, 'decision': 3, 'end': 4 };
      return typeOrder[a.type] - typeOrder[b.type];
    });
    
    const margin = 10; // Reduced margin for more space
    const availableHeight = 100 - (2 * margin);
    
    if (sortedNodes.length === 1) {
      return [{
        ...sortedNodes[0],
        position: { x: 50, y: 50 }
      }];
    }
    
    const spacing = availableHeight / (sortedNodes.length - 1);
    
    return sortedNodes.map((node, index) => ({
      ...node,
      position: { 
        x: 50, 
        y: margin + (spacing * index) 
      }
    }));
  };

  const calculateCircularLayout = (nodeList: DiagramNode[]) => {
    const centerX = 50;
    const centerY = 50;
    const radius = 30; // Reduced radius for better fit
    
    return nodeList.map((node, index) => {
      const angle = (2 * Math.PI * index) / nodeList.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return {
        ...node,
        position: { 
          x: Math.max(15, Math.min(85, x)), 
          y: Math.max(15, Math.min(85, y)) 
        }
      };
    });
  };

  const calculateHierarchicalLayout = (nodeList: DiagramNode[], connectionList: DiagramConnection[]) => {
    // Find start nodes (nodes with no incoming connections)
    const incomingConnections = new Set(connectionList.map(c => c.to));
    const outgoingConnections = new Map<string, string[]>();
    
    // Build adjacency list for better structure analysis
    connectionList.forEach(conn => {
      if (!outgoingConnections.has(conn.from)) {
        outgoingConnections.set(conn.from, []);
      }
      outgoingConnections.get(conn.from)!.push(conn.to);
    });
    
    const startNodes = nodeList.filter(node => !incomingConnections.has(node.id));
    const endNodes = nodeList.filter(node => !outgoingConnections.has(node.id));
    
    // Calculate levels using BFS with better level distribution
    const levels = new Map<string, number>();
    const queue = startNodes.map(node => ({ id: node.id, level: 0 }));
    
    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      if (levels.has(id)) continue;
      
      levels.set(id, level);
      const children = outgoingConnections.get(id) || [];
      children.forEach(childId => {
        if (!levels.has(childId)) {
          queue.push({ id: childId, level: level + 1 });
        }
      });
    }
    
    // Group nodes by level and sort for better structure
    const levelGroups = new Map<number, DiagramNode[]>();
    nodeList.forEach(node => {
      const level = levels.get(node.id) || 0;
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)!.push(node);
    });
    
    // Sort nodes within each level for better visual flow
    levelGroups.forEach((nodesInLevel, level) => {
      nodesInLevel.sort((a, b) => {
        // Prioritize start nodes, then process nodes, then end nodes
        const typeOrder = { 'start': 0, 'process': 1, 'concept': 2, 'decision': 3, 'end': 4 };
        return typeOrder[a.type] - typeOrder[b.type];
      });
    });
    
    // Position nodes with structured layout
    const maxLevel = Math.max(...Array.from(levels.values()));
    const result: DiagramNode[] = [];
    
    levelGroups.forEach((nodesInLevel, level) => {
      const marginY = 12; // Reduced margins for more space
      const availableHeight = 100 - (2 * marginY);
      
      // Create more structured vertical positioning
      let y: number;
      if (maxLevel === 0) {
        y = 50; // Single level, center vertically
      } else {
        y = marginY + (availableHeight * level) / maxLevel;
      }
      
      const marginX = 8; // Reduced horizontal margins
      const availableWidth = 100 - (2 * marginX);
      
      // Better horizontal distribution
      if (nodesInLevel.length === 1) {
        result.push({
          ...nodesInLevel[0],
          position: { x: 50, y }
        });
      } else {
        const spacing = availableWidth / (nodesInLevel.length - 1);
        nodesInLevel.forEach((node, index) => {
          result.push({
            ...node,
            position: { 
              x: marginX + (spacing * index),
              y
            }
          });
        });
      }
    });
    
    return result;
  };

  const calculateGridLayout = (nodeList: DiagramNode[]) => {
    // Sort nodes for structured grid placement
    const sortedNodes = [...nodeList].sort((a, b) => {
      const typeOrder = { 'start': 0, 'process': 1, 'concept': 2, 'decision': 3, 'end': 4 };
      return typeOrder[a.type] - typeOrder[b.type];
    });
    
    const cols = Math.ceil(Math.sqrt(sortedNodes.length));
    const rows = Math.ceil(sortedNodes.length / cols);
    
    const marginX = 10; // Reduced margins
    const marginY = 15;
    const availableWidth = 100 - (2 * marginX);
    const availableHeight = 100 - (2 * marginY);
    
    return sortedNodes.map((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      let x: number, y: number;
      
      if (cols === 1) {
        x = 50;
      } else {
        x = marginX + (availableWidth * col) / (cols - 1);
      }
      
      if (rows === 1) {
        y = 50;
      } else {
        y = marginY + (availableHeight * row) / (rows - 1);
      }
      
      return {
        ...node,
        position: { 
          x: Math.max(marginX, Math.min(100 - marginX, x)), 
          y: Math.max(marginY, Math.min(100 - marginY, y)) 
        }
      };
    });
  };

  const structuredNodes = getStructuredNodes();

  const getNodeStyle = (node: DiagramNode) => {
    const baseStyle = "absolute transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-xl text-sm font-bold text-center min-w-24 max-w-36 shadow-xl border-3 transition-all duration-300 hover:scale-110 bg-white backdrop-blur-sm";
    
    switch (node.type) {
      case 'start':
        return cn(baseStyle, "bg-gradient-to-br from-green-50 to-green-100 text-green-900 border-green-400 shadow-green-200 rounded-full");
      case 'process':
        return cn(baseStyle, "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900 border-blue-400 shadow-blue-200 rounded-lg");
      case 'decision':
        return cn(baseStyle, "bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-900 border-yellow-400 shadow-yellow-200 rounded-lg transform rotate-45");
      case 'end':
        return cn(baseStyle, "bg-gradient-to-br from-red-50 to-red-100 text-red-900 border-red-400 shadow-red-200 rounded-full");
      case 'concept':
        return cn(baseStyle, node.color || "bg-gradient-to-br from-purple-50 to-purple-100 text-purple-900 border-purple-400 shadow-purple-200 rounded-lg");
      default:
        return cn(baseStyle, "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 border-gray-400 shadow-gray-200 rounded-lg");
    }
  };

  const renderConnection = (connection: DiagramConnection, index: number) => {
    const fromNode = structuredNodes.find(n => n.id === connection.from);
    const toNode = structuredNodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return null;

    const dx = toNode.position.x - fromNode.position.x;
    const dy = toNode.position.y - fromNode.position.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    return (
      <div key={index}>
        {/* Connection Line */}
        <div
          className="absolute bg-blue-600 opacity-90"
          style={{
            left: `${fromNode.position.x}%`,
            top: `${fromNode.position.y}%`,
            width: `${Math.min(length * 0.8, 15)}%`,
            height: '2px',
            transformOrigin: '0 50%',
            transform: `rotate(${angle}deg)`,
          }}
        />
        
        {/* Arrow Head */}
        <div
          className="absolute w-0 h-0 border-l-4 border-l-blue-600 border-t-2 border-b-2 border-t-transparent border-b-transparent opacity-90"
          style={{
            left: `${toNode.position.x - 1}%`,
            top: `${toNode.position.y - 0.5}%`,
            transform: `rotate(${angle}deg)`,
          }}
        />
        
        {/* Connection Label */}
        {connection.label && (
          <div
            className="absolute text-xs font-medium text-gray-800 bg-white px-2 py-1 rounded-full shadow-sm border-2 border-gray-200 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(fromNode.position.x + toNode.position.x) / 2}%`,
              top: `${(fromNode.position.y + toNode.position.y) / 2 - 2}%`,
            }}
          >
            {connection.label}
          </div>
        )}
      </div>
    );
  };

  // Fullscreen overlay component
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
        <div className="w-full h-full max-w-7xl max-h-full bg-white rounded-lg overflow-hidden">
          {/* Fullscreen Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">{cleanTitle}</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-2">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFullscreen}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Fullscreen Scrollable Content */}
          <div className="flex-1 overflow-auto p-4" style={{ height: 'calc(100% - 73px)' }}>
            <div 
              className="relative bg-white rounded-xl border-2 border-gray-200 shadow-md mx-auto"
              style={{
                width: `${800 * zoomLevel}px`,
                height: `${600 * zoomLevel}px`,
                minWidth: '800px',
                minHeight: '600px'
              }}
            >
          {/* Render Connections First (so they appear behind nodes) */}
          {(isEditing ? editableConnections : cleanConnections).map((connection, index) => renderConnection(connection, index))}
          
          {/* Render Nodes */}
          {structuredNodes.map((node) => (
            <div
              key={node.id}
              className={cn(
                getNodeStyle(node),
                isEditing && "cursor-pointer hover:ring-2 hover:ring-blue-400",
                selectedNode === node.id && "ring-2 ring-blue-500"
              )}
              style={{
                left: `${node.position.x}%`,
                top: `${node.position.y}%`,
                animationDelay: `${structuredNodes.indexOf(node) * 0.2}s`
              }}
              onClick={(e) => handleNodeClick(node.id, e)}
            >
              <div className={node.type === 'decision' ? 'transform -rotate-45' : ''}>
                {node.icon && (
                  <div className="text-lg mb-1">{node.icon}</div>
                )}
                <div className="text-xs font-medium">{node.label}</div>
              </div>
              
              {/* Edit Controls for Selected Node */}
              {isEditing && selectedNode === node.id && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex space-x-1 bg-white rounded-md shadow-lg border p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingNode(node);
                    }}
                    className="p-1 h-6 w-6"
                    title="Edit Node"
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNode(node.id);
                    }}
                    className="p-1 h-6 w-6 text-red-600"
                    title="Delete Node"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
              
              {/* Clean Background - No Distracting Elements */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("p-4 bg-white border-2 border-gray-200", className)}>
      {/* Header with Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-center flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-1">{cleanTitle}</h3>
          <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>
        <div className="flex items-center space-x-1">
          {/* Editing Controls */}
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleEditMode}
              className="p-1 h-8 w-8"
              title="Edit Diagram"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={addNewNode}
                className="p-1 h-8 w-8"
                title="Add Node"
              >
                <Plus className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={saveChanges}
                className="p-1 h-8 w-8 text-green-600"
                title="Save Changes"
              >
                <Save className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleEditMode}
                className="p-1 h-8 w-8 text-red-600"
                title="Cancel Edit"
              >
                <X className="w-3 h-3" />
              </Button>
            </>
          )}
          
          {/* Zoom Controls */}
          <div className="border-l border-gray-300 pl-1 ml-1 flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="p-1 h-8 w-8"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <span className="text-xs text-gray-500 px-1 min-w-[35px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-1 h-8 w-8"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFullscreen}
              className="p-1 h-8 w-8"
              title="Full Screen"
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scrollable Diagram Container */}
      <div className="relative w-full h-96 overflow-auto border-2 border-gray-200 rounded-xl shadow-md bg-white">
        <div 
          className="relative bg-white transition-transform duration-200"
          style={{
            width: `${Math.max(100 * zoomLevel, 100)}%`,
            height: `${Math.max(100 * zoomLevel, 100)}%`,
            minWidth: '100%',
            minHeight: '100%',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left'
          }}
        >
          {/* Render Connections First (so they appear behind nodes) */}
          {connections.map((connection, index) => renderConnection(connection, index))}
          
          {/* Render Nodes */}
          {structuredNodes.map((node) => (
            <div
              key={node.id}
              className={getNodeStyle(node)}
              style={{
                left: `${node.position.x}%`,
                top: `${node.position.y}%`,
                animationDelay: `${structuredNodes.indexOf(node) * 0.2}s`
              }}
            >
              <div className={node.type === 'decision' ? 'transform -rotate-45' : ''}>
                {node.icon && (
                  <div className="text-lg mb-1">{node.icon}</div>
                )}
                <div className="text-xs font-medium">{node.label}</div>
              </div>
            </div>
          ))}
          
          {/* Clean Background - No Distracting Elements */}
        </div>
      </div>
      
      <div className="mt-3 text-center space-y-2">
        <div className={cn(
          "inline-flex items-center space-x-2 px-3 py-1 rounded-full",
          isEditing ? "bg-orange-100" : "bg-blue-100"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full",
            isEditing ? "bg-orange-500 animate-pulse" : "bg-blue-500 animate-pulse"
          )} />
          <span className={cn(
            "text-sm",
            isEditing ? "text-orange-800" : "text-blue-800"
          )}>
            {isEditing ? "✏️ Editing Mode" : "AI-Structured Blocks"} • {(isEditing ? editableNodes : cleanNodes).length} Nodes • {(isEditing ? editableConnections : cleanConnections).length} Connections
          </span>
          {validateDiagramStructure() && (
            <div className="w-2 h-2 bg-green-500 rounded-full" title="Well-structured diagram" />
          )}
        </div>
        
        {satisfactionScore > 0 && (
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white border-2 border-gray-200 rounded-full shadow-sm">
            <span className="text-lg">{getSatisfactionIndicator().icon}</span>
            <span className={`text-sm font-medium ${getSatisfactionIndicator().color}`}>
              {getSatisfactionIndicator().label}
            </span>
            <span className="text-xs text-gray-500">
              ({satisfactionScore}/10)
            </span>
          </div>
        )}
      </div>

      {/* Node Editing Dialog */}
      {editingNode && (
        <Dialog open={!!editingNode} onOpenChange={() => setEditingNode(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Node</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Label</label>
                <Input
                  value={editingNode.label}
                  onChange={(e) => updateEditingNode('label', e.target.value)}
                  placeholder="Node label"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={editingNode.type}
                  onValueChange={(value) => updateEditingNode('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="start">Start</SelectItem>
                    <SelectItem value="process">Process</SelectItem>
                    <SelectItem value="concept">Concept</SelectItem>
                    <SelectItem value="decision">Decision</SelectItem>
                    <SelectItem value="end">End</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Icon (Emoji)</label>
                <Input
                  value={editingNode.icon || ''}
                  onChange={(e) => updateEditingNode('icon', e.target.value)}
                  placeholder="📊"
                  maxLength={2}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingNode(null)}>
                  Cancel
                </Button>
                <Button onClick={saveNodeEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};
