import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SlideData } from './SlideRenderer';

export interface SlideThumbnailsProps {
  slides: SlideData[];
  currentSlide: number;
  onSlideSelect: (slideIndex: number) => void;
  className?: string;
}

export const SlideThumbnails: React.FC<SlideThumbnailsProps> = ({
  slides,
  currentSlide,
  onSlideSelect,
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

  const getSlideTypeIcon = (type: string) => {
    switch (type) {
      case 'intro': return '🎯';
      case 'concept': return '💡';
      case 'example': return '📝';
      case 'diagram': return '📊';
      case 'summary': return '📋';
      default: return '📄';
    }
  };

  return (
    <div className={cn(
      "bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700",
      "w-72 overflow-y-auto shadow-lg",
      className
    )}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              Slides
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {slides.length} slides total
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {slides.map((slide, index) => (
          <Card
            key={slide.id}
            className={cn(
              "cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group relative",
              "border-2 p-4 rounded-xl",
              currentSlide === index 
                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-lg" 
                : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800"
            )}
            onClick={() => onSlideSelect(index)}
          >
            <div className="space-y-3">
              {/* Slide Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                    {getSlideTypeIcon(slide.type)}
                  </div>
                  <Badge className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-full shadow-sm",
                    getSlideTypeColor(slide.type)
                  )}>
                    {slide.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {index + 1}
                  </span>
                  {currentSlide === index && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg" />
                  )}
                </div>
              </div>

              {/* Slide Title */}
              <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                {slide.title}
              </h4>

              {/* Slide Content Preview */}
              <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                {slide.content.split('\n\n')[0].substring(0, 120)}
                {slide.content.length > 120 && '...'}
              </div>

              {/* Slide Metadata */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {slide.duration}s
                  </span>
                  {slide.template && slide.template !== 'default' && (
                    <Badge variant="outline" className="px-2 py-1 text-xs font-medium rounded-full border-gray-300 dark:border-gray-600">
                      {slide.template}
                    </Badge>
                  )}
                </div>
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full group-hover:bg-blue-400 transition-colors duration-200"></div>
              </div>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>
        ))}
      </div>
    </div>
  );
};
