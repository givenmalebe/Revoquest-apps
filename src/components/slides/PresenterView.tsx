import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, EyeOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { SlideData } from './SlideRenderer';

export interface PresenterViewProps {
  currentSlide: SlideData;
  nextSlide?: SlideData;
  currentSlideIndex: number;
  totalSlides: number;
  progress: number;
  duration: number;
  isPlaying: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  className?: string;
}

export const PresenterView: React.FC<PresenterViewProps> = ({
  currentSlide,
  nextSlide,
  currentSlideIndex,
  totalSlides,
  progress,
  duration,
  isPlaying,
  isMuted,
  onToggleMute,
  className
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  return (
    <div className={cn(
      "bg-gray-900 text-white h-screen flex flex-col",
      className
    )}>
      {/* Presenter Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Presenter View</h1>
            <Badge className={cn("px-3 py-1", getSlideTypeColor(currentSlide.type))}>
              {currentSlide.type.toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-400">
              Slide {currentSlideIndex + 1} of {totalSlides}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {formatTime((progress / 100) * duration)} / {formatTime(duration)}
              </span>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleMute}
                className="p-2 rounded hover:bg-gray-700 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Current Slide (Large) */}
        <div className="flex-1 p-6">
          <Card className="h-full bg-white text-gray-900 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Slide Header */}
              <div className="p-4 border-b bg-gray-50">
                <h2 className="text-2xl font-bold">{currentSlide.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={cn("px-2 py-1 text-xs", getSlideTypeColor(currentSlide.type))}>
                    {currentSlide.type}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {currentSlide.duration}s
                  </span>
                  {currentSlide.template && currentSlide.template !== 'default' && (
                    <Badge variant="outline" className="px-2 py-1 text-xs">
                      {currentSlide.template}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Slide Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="prose max-w-none">
                  {currentSlide.content.split('\n\n').map((paragraph, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      {paragraph.startsWith('**') && paragraph.endsWith('**') ? (
                        <h3 className="text-xl font-semibold text-gray-800">
                          {paragraph.slice(2, -2)}
                        </h3>
                      ) : (
                        <p className="text-lg text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Next Slide Preview */}
          {nextSlide && (
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Next Slide</h3>
              <Card className="bg-gray-700 text-white">
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={cn("px-2 py-1 text-xs", getSlideTypeColor(nextSlide.type))}>
                      {nextSlide.type}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {currentSlideIndex + 2} of {totalSlides}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm mb-2 line-clamp-2">
                    {nextSlide.title}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-3">
                    {nextSlide.content.split('\n\n')[0].substring(0, 120)}...
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Slide Statistics */}
          <div className="flex-1 p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Slide Statistics</h3>
            <div className="bg-gray-700 rounded-lg p-3 h-full">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Type:</span>
                  <span className="text-sm text-white font-medium">{currentSlide.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Template:</span>
                  <span className="text-sm text-white font-medium">{currentSlide.template || 'default'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Duration:</span>
                  <span className="text-sm text-white font-medium">{currentSlide.duration}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Theme:</span>
                  <span className="text-sm text-white font-medium">{currentSlide.theme || 'default'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Presentation Stats */}
          <div className="p-4 border-t border-gray-700">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={cn(
                  isPlaying ? "text-green-400" : "text-yellow-400"
                )}>
                  {isPlaying ? "Playing" : "Paused"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Progress:</span>
                <span className="text-white">{Math.round(progress)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time Remaining:</span>
                <span className="text-white">
                  {formatTime(duration - (progress / 100) * duration)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
