import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Network, 
  GitBranch, 
  Target,
  Activity,
  Zap,
  Brain,
  Lightbulb
} from "lucide-react";

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

interface ProfessionalVisualizationProps {
  data: VisualizationData;
  className?: string;
}

export const ProfessionalVisualization: React.FC<ProfessionalVisualizationProps> = ({
  data,
  className
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'bar': return BarChart3;
      case 'pie': return PieChart;
      case 'line': return TrendingUp;
      case 'network': return Network;
      case 'flowchart': return GitBranch;
      case 'timeline': return Activity;
      case 'comparison': return Target;
      case 'infographic': return Lightbulb;
      default: return BarChart3;
    }
  };

  const getColorScheme = (index: number) => {
    const colors = data.config.colors || [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    return colors[index % colors.length];
  };

  const renderBarChart = () => {
    const maxValue = Math.max(...data.data.values);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{data.title}</h3>
        </div>
        
        <div className="space-y-3">
          {data.data.labels.map((label: string, index: number) => {
            const value = data.data.values[index];
            const percentage = (value / maxValue) * 100;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out",
                      isLoaded ? "opacity-100" : "opacity-0"
                    )}
                    style={{ 
                      width: `${isLoaded ? percentage : 0}%`,
                      backgroundColor: getColorScheme(index)
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    const total = data.data.values.reduce((sum: number, value: number) => sum + value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{data.title}</h3>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {data.data.labels.map((label: string, index: number) => {
                const value = data.data.values[index];
                const percentage = (value / total) * 100;
                const startAngle = cumulativePercentage * 3.6;
                const endAngle = (cumulativePercentage + percentage) * 3.6;
                
                const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                
                const largeArcFlag = percentage > 50 ? 1 : 0;
                const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                
                cumulativePercentage += percentage;
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={getColorScheme(index)}
                    className={cn(
                      "transition-all duration-1000 ease-out",
                      isLoaded ? "opacity-100" : "opacity-0"
                    )}
                    style={{
                      transform: isLoaded ? 'scale(1)' : 'scale(0)',
                      transformOrigin: '50% 50%'
                    }}
                  />
                );
              })}
            </svg>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {data.data.labels.map((label: string, index: number) => {
            const value = data.data.values[index];
            const percentage = ((value / total) * 100).toFixed(1);
            
            return (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getColorScheme(index) }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white ml-auto">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderNetworkDiagram = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Network className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{data.title}</h3>
        </div>
        
        <div className="relative w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            {data.data.nodes.map((node: any, index: number) => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="20"
                  fill={getColorScheme(index)}
                  className={cn(
                    "transition-all duration-1000 ease-out",
                    isLoaded ? "opacity-100" : "opacity-0"
                  )}
                  style={{
                    transform: isLoaded ? 'scale(1)' : 'scale(0)',
                    transformOrigin: `${node.x}px ${node.y}px`
                  }}
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-white"
                >
                  {node.label}
                </text>
              </g>
            ))}
            
            {data.data.connections.map((connection: any, index: number) => {
              const fromNode = data.data.nodes.find((n: any) => n.id === connection.from);
              const toNode = data.data.nodes.find((n: any) => n.id === connection.to);
              
              if (!fromNode || !toNode) return null;
              
              return (
                <line
                  key={index}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#6B7280"
                  strokeWidth="2"
                  className={cn(
                    "transition-all duration-1000 ease-out",
                    isLoaded ? "opacity-100" : "opacity-0"
                  )}
                />
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  const renderTimeline = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{data.title}</h3>
        </div>
        
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
          
          {data.data.events.map((event: any, index: number) => (
            <div key={index} className="relative flex items-start gap-4 mb-6">
              <div className="relative z-10 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              
              <div className={cn(
                "flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700",
                "transition-all duration-1000 ease-out",
                isLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
              )}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {event.step}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{event.time}</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{event.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderComparison = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{data.title}</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {data.data.comparisons.map((comparison: any, index: number) => (
            <div key={index} className={cn(
              "p-6 rounded-xl border-2 transition-all duration-1000 ease-out",
              index === 0 
                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" 
                : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}
              style={{ transitionDelay: `${index * 300}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold",
                  index === 0 ? "bg-red-500" : "bg-green-500"
                )}>
                  {index === 0 ? "×" : "✓"}
                </div>
                <h4 className={cn(
                  "text-xl font-bold",
                  index === 0 ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"
                )}>
                  {comparison.title}
                </h4>
              </div>
              
              <div className="space-y-3">
                {comparison.points.map((point: string, pointIndex: number) => (
                  <div key={pointIndex} className="flex items-start gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      index === 0 ? "bg-red-400" : "bg-green-400"
                    )}></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderVisualization = () => {
    switch (data.type) {
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'network':
        return renderNetworkDiagram();
      case 'timeline':
        return renderTimeline();
      case 'comparison':
        return renderComparison();
      default:
        return renderBarChart();
    }
  };

  const IconComponent = getIcon(data.type);

  return (
    <Card className={cn(
      "w-full h-full bg-white dark:bg-gray-900 border-0 shadow-xl rounded-2xl overflow-hidden",
      className
    )}>
      <div className="p-6 h-full">
        {renderVisualization()}
      </div>
    </Card>
  );
};
