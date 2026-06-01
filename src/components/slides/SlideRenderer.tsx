import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SmartDiagram } from './SmartDiagram';
import { SlideAnimation, slideAnimationPresets } from './SlideAnimations';
import { ProfessionalVisualization } from './ProfessionalVisualization';

export interface SlideData {
  id: string;
  title: string;
  content: string;
  type: 'intro' | 'concept' | 'example' | 'diagram' | 'summary';
  duration: number;
  module?: string;
  template?: 'default' | 'centered' | 'split' | 'timeline' | 'comparison';
  theme?: 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange';
  animation?: 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom-in' | 'zoom-out' | 'flip-horizontal' | 'flip-vertical' | 'rotate-in' | 'bounce-in' | 'pulse-in';
  diagram?: {
    title: string;
    nodes: Array<{
      id: string;
      label: string;
      type: 'start' | 'process' | 'decision' | 'end' | 'concept';
      position: { x: number; y: number };
      color?: string;
      icon?: string;
    }>;
    connections: Array<{
      from: string;
      to: string;
      label?: string;
    }>;
    layout?: 'horizontal' | 'vertical' | 'circular' | 'hierarchical' | 'grid';
    theme?: string;
  };
  visualization?: {
    type: 'chart' | 'graph' | 'diagram' | 'infographic' | 'timeline' | 'comparison';
    data: any;
    config: any;
  };
}

interface SlideRendererProps {
  slide: SlideData;
  isActive: boolean;
  className?: string;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({
  slide,
  isActive,
  className
}) => {
  const getSlideTypeColor = (type: string) => {
    switch (type) {
      case 'intro': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'concept': return 'bg-green-100 text-green-800 border-green-200';
      case 'example': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'diagram': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'summary': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getThemeClasses = (theme?: string) => {
    switch (theme) {
      case 'dark': return 'bg-gray-900 text-white border-gray-700';
      case 'blue': return 'bg-blue-50 text-blue-900 border-blue-200';
      case 'green': return 'bg-green-50 text-green-900 border-green-200';
      case 'purple': return 'bg-purple-50 text-purple-900 border-purple-200';
      case 'orange': return 'bg-orange-50 text-orange-900 border-orange-200';
      default: return 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700';
    }
  };

  const getTemplateClasses = (template?: string) => {
    switch (template) {
      case 'centered': return 'text-center justify-center items-center';
      case 'split': return 'grid grid-cols-2 gap-6';
      case 'timeline': return 'relative pl-8 border-l-2 border-gray-300';
      case 'comparison': return 'grid grid-cols-2 gap-8';
      default: return '';
    }
  };

  const renderSlideContent = () => {
    switch (slide.template) {
      case 'centered':
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                {slide.title}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
            
            {/* Visualization or Content */}
            {slide.visualization ? (
              <div className="w-full max-w-4xl">
                <ProfessionalVisualization
                  data={slide.visualization}
                  className="w-full h-80"
                />
              </div>
            ) : (
              <div className="prose prose-xl max-w-3xl text-gray-700 dark:text-gray-300">
                {slide.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-2xl leading-relaxed font-light">
                    {paragraph.startsWith('**') && paragraph.endsWith('**') 
                      ? paragraph.slice(2, -2)
                      : paragraph
                    }
                  </p>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'split':
        return (
          <div className="grid grid-cols-2 gap-12 h-full">
            <div className="space-y-6 flex flex-col justify-center">
              <div className="space-y-3">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                  {slide.title}
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>
              <div className="prose prose-lg max-w-none">
                {slide.content.split('\n\n').slice(0, 2).map((paragraph, index) => (
                  <p key={index} className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
                    {paragraph.startsWith('**') && paragraph.endsWith('**') 
                      ? (
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {paragraph.slice(2, -2)}
                        </span>
                      )
                      : paragraph
                    }
                  </p>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6">
              {slide.visualization ? (
                <ProfessionalVisualization
                  data={slide.visualization}
                  className="w-full h-full"
                />
              ) : slide.type === 'diagram' && slide.diagram ? (
                <SmartDiagram
                  title={slide.diagram.title}
                  nodes={slide.diagram.nodes}
                  connections={slide.diagram.connections}
                  layout={slide.diagram.layout || 'horizontal'}
                  theme={slide.diagram.theme || 'default'}
                  satisfactionScore={slide.diagram.satisfactionScore || 0}
                  className="w-full h-full"
                />
              ) : (
                <div className="prose prose-lg max-w-none text-center">
                  {slide.content.split('\n\n').slice(2).map((paragraph, index) => (
                    <p key={index} className="text-xl leading-relaxed text-gray-700 dark:text-gray-300">
                      {paragraph.startsWith('**') && paragraph.endsWith('**') 
                        ? (
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {paragraph.slice(2, -2)}
                          </span>
                        )
                        : paragraph
                      }
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'timeline':
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                {slide.title}
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
            </div>

            {/* Visualization or Timeline */}
            {slide.visualization ? (
              <div className="flex justify-center">
                <ProfessionalVisualization
                  data={slide.visualization}
                  className="w-full max-w-4xl h-96"
                />
              </div>
            ) : (
              <div className="relative pl-12">
                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
                <div className="space-y-6">
                  {slide.content.split('\n\n').map((paragraph, index) => (
                    <div key={index} className="relative pl-6">
                      <div className="absolute -left-6 top-3 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full shadow-md"></div>
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300">
                          {paragraph.startsWith('**') && paragraph.endsWith('**') 
                            ? (
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {paragraph.slice(2, -2)}
                              </span>
                            )
                            : paragraph
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'comparison':
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                {slide.title}
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-green-500 rounded-full mx-auto"></div>
            </div>

            {/* Visualization or Comparison */}
            {slide.visualization ? (
              <div className="flex justify-center">
                <ProfessionalVisualization
                  data={slide.visualization}
                  className="w-full max-w-4xl h-96"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-8 h-full">
                <div className="space-y-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-8 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">×</span>
                    </div>
                    <h3 className="text-3xl font-bold text-red-600 dark:text-red-400">Before</h3>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    {slide.content.split('\n\n').slice(0, 2).map((paragraph, index) => (
                      <p key={index} className="text-xl leading-relaxed text-gray-700 dark:text-gray-300">
                        {paragraph.startsWith('**') && paragraph.endsWith('**') 
                          ? (
                            <span className="font-semibold text-red-700 dark:text-red-300">
                              {paragraph.slice(2, -2)}
                            </span>
                          )
                          : paragraph
                        }
                      </p>
                    ))}
                  </div>
                </div>
                <div className="space-y-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">✓</span>
                    </div>
                    <h3 className="text-3xl font-bold text-green-600 dark:text-green-400">After</h3>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    {slide.content.split('\n\n').slice(2).map((paragraph, index) => (
                      <p key={index} className="text-xl leading-relaxed text-gray-700 dark:text-gray-300">
                        {paragraph.startsWith('**') && paragraph.endsWith('**') 
                          ? (
                            <span className="font-semibold text-green-700 dark:text-green-300">
                              {paragraph.slice(2, -2)}
                            </span>
                          )
                          : paragraph
                        }
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <>
            {/* Professional Visualization */}
            {slide.visualization && (
              <div className="mb-8 flex-shrink-0">
                <ProfessionalVisualization
                  data={slide.visualization}
                  className="w-full h-80"
                />
              </div>
            )}

            {/* Smart Diagram for diagram slides - Takes priority space */}
            {slide.type === 'diagram' && slide.diagram && !slide.visualization && (
              <div className="mb-8 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
                <SmartDiagram
                  title={slide.diagram.title}
                  nodes={slide.diagram.nodes}
                  connections={slide.diagram.connections}
                  layout={slide.diagram.layout || 'horizontal'}
                  theme={slide.diagram.theme || 'default'}
                  satisfactionScore={slide.diagram.satisfactionScore || 0}
                  className="w-full"
                />
              </div>
            )}
            
            <div className={cn(
              "prose max-w-none",
              slide.type === 'diagram' ? "prose-lg" : "prose-xl"
            )}>
              {slide.content.split('\n\n').map((paragraph, index) => (
                <div key={index}
                  className={cn(
                    "mb-6 last:mb-0 p-6 rounded-xl",
                    paragraph.startsWith('**') && paragraph.endsWith('**') 
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-l-4 border-blue-500 font-semibold text-2xl text-gray-900 dark:text-white" 
                      : "text-xl leading-relaxed text-gray-700 dark:text-gray-300"
                  )}
                >
                  {paragraph.startsWith('**') && paragraph.endsWith('**') 
                    ? paragraph.slice(2, -2)
                    : paragraph
                  }
                </div>
              ))}
            </div>
          </>
        );
    }
  };

  const animation = slide.animation || slideAnimationPresets[slide.type] || slideAnimationPresets.default;

  return (
    <SlideAnimation
      isActive={isActive}
      transition={animation}
      duration={800}
      className="w-full h-full"
    >
      <Card className={cn(
        "w-full h-full flex flex-col border-0 shadow-2xl rounded-3xl overflow-hidden relative",
        "bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-blue-900/30",
        isActive ? "ring-4 ring-blue-500/30 shadow-3xl scale-[1.02]" : "shadow-xl",
        getThemeClasses(slide.theme),
        getTemplateClasses(slide.template),
        className
      )}>
        {/* Enhanced Slide Header */}
        <div className="relative flex items-center justify-between px-6 py-5 bg-gradient-to-r from-white/90 via-gray-50/90 to-gray-100/90 dark:from-gray-800/90 dark:via-gray-700/90 dark:to-gray-600/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-600/50">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
          <div className="relative flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                slide.type === 'intro' ? 'bg-blue-500' :
                slide.type === 'concept' ? 'bg-green-500' :
                slide.type === 'example' ? 'bg-purple-500' :
                slide.type === 'diagram' ? 'bg-orange-500' :
                'bg-indigo-500'
              )}></div>
              <Badge className={cn(
                "px-4 py-2 text-sm font-bold rounded-full shadow-lg",
                getSlideTypeColor(slide.type)
              )}>
                {slide.type.toUpperCase()}
              </Badge>
            </div>
            {slide.module && (
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            )}
            {slide.module && (
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full">
                {slide.module}
              </span>
            )}
            {slide.template && slide.template !== 'default' && (
              <Badge variant="outline" className="px-4 py-2 text-sm font-semibold rounded-full border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                {slide.template}
              </Badge>
            )}
          </div>
          <div className="relative flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {slide.duration}s
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Slide Title */}
        {slide.template !== 'centered' && (
          <div className="px-6 py-6 bg-gradient-to-r from-white via-gray-50/50 to-blue-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-blue-900/30 border-b border-gray-200/50 dark:border-gray-600/50">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent leading-tight">
              {slide.title}
            </h2>
          </div>
        )}

        {/* Enhanced Slide Content */}
        <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 dark:from-gray-900 dark:via-gray-800/30 dark:to-blue-900/20">
          {renderSlideContent()}
        </div>

        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3B82F6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8B5CF6 0%, transparent 50%)`,
          }}></div>
        </div>
      </Card>
    </SlideAnimation>
  );
};
