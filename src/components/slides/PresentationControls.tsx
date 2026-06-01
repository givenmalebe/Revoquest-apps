import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Settings,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Clock,
  Eye,
  EyeOff,
  Download,
  Share2,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PresentationControlsProps {
  isPlaying: boolean;
  currentSlide: number;
  totalSlides: number;
  progress: number;
  duration: number;
  speed: number;
  isMuted: boolean;
  isFullscreen: boolean;
  showThumbnails: boolean;
  presentationMode: 'auto' | 'manual' | 'presenter';
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSlideSelect: (slideIndex: number) => void;
  onSpeedChange: (speed: number) => void;
  onMuteToggle: () => void;
  onFullscreenToggle: () => void;
  onThumbnailsToggle: () => void;
  onModeChange: (mode: 'auto' | 'manual' | 'presenter') => void;
  onExport: () => void;
  onShare: () => void;
  className?: string;
}

export const PresentationControls: React.FC<PresentationControlsProps> = ({
  isPlaying,
  currentSlide,
  totalSlides,
  progress,
  duration,
  speed,
  isMuted,
  isFullscreen,
  showThumbnails,
  presentationMode,
  onPlay,
  onPause,
  onStop,
  onNext,
  onPrevious,
  onSlideSelect,
  onSpeedChange,
  onMuteToggle,
  onFullscreenToggle,
  onThumbnailsToggle,
  onModeChange,
  onExport,
  onShare,
  className
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSpeedLabel = (speed: number) => {
    switch (speed) {
      case 0.5: return '0.5x';
      case 0.75: return '0.75x';
      case 1: return '1x';
      case 1.25: return '1.25x';
      case 1.5: return '1.5x';
      case 2: return '2x';
      default: return `${speed}x`;
    }
  };

  return (
    <div className={cn(
      "bg-gradient-to-r from-white/90 via-gray-50/90 to-gray-100/90 dark:from-gray-800/90 dark:via-gray-700/90 dark:to-gray-600/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-4 lg:p-6 shadow-2xl",
      "flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8",
      className
    )}>
      {/* Left Controls */}
      <div className="flex items-center gap-3">
        {/* Enhanced Play/Pause/Stop */}
        <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onStop}
            className="h-12 w-12 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={isPlaying ? onPause : onPlay}
            className={cn(
              "h-12 w-12 p-0 rounded-xl transition-all duration-300 hover:scale-105 shadow-xl",
              isPlaying 
                ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white" 
                : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            )}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            disabled={currentSlide === 0}
            className="h-10 w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            disabled={currentSlide === totalSlides - 1}
            className="h-10 w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Slide Counter */}
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {currentSlide + 1}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">/</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {totalSlides}
            </span>
          </div>
        </div>
      </div>

      {/* Center - Progress Bar */}
      <div className="flex-1 w-full lg:max-w-lg mx-0 lg:mx-6 order-3 lg:order-2">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 lg:gap-4">
            <span className="text-xs lg:text-sm font-mono text-gray-600 dark:text-gray-400 min-w-[40px] lg:min-w-[50px] text-center">
              {formatTime((progress / 100) * duration)}
            </span>
            
            <div className="flex-1 relative group">
              <div className="h-2 lg:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              {/* Clickable progress bar */}
              <div 
                className="absolute inset-0 cursor-pointer group-hover:bg-blue-500/10 rounded-full transition-colors duration-200"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percentage = (clickX / rect.width) * 100;
                  const targetSlide = Math.floor((percentage / 100) * totalSlides);
                  onSlideSelect(Math.max(0, Math.min(targetSlide, totalSlides - 1)));
                }}
              />
              
              {/* Progress percentage tooltip */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {Math.round(progress)}%
              </div>
            </div>
            
            <span className="text-xs lg:text-sm font-mono text-gray-600 dark:text-gray-400 min-w-[40px] lg:min-w-[50px] text-center">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 lg:gap-3 order-2 lg:order-3 flex-wrap justify-center lg:justify-end">
        {/* Speed Control */}
        <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Speed:</span>
          <Slider
            value={[speed]}
            onValueChange={([value]) => onSpeedChange(value)}
            min={0.5}
            max={2}
            step={0.25}
            className="w-24"
          />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[35px] text-center">
            {getSpeedLabel(speed)}
          </span>
        </div>

        {/* Audio Control */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMuteToggle}
          className={cn(
            "h-10 w-10 p-0 rounded-lg transition-all duration-200",
            isMuted 
              ? "bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/20 dark:text-red-400" 
              : "bg-green-100 hover:bg-green-200 text-green-600 dark:bg-green-900/20 dark:text-green-400"
          )}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>

        {/* View Controls */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={onThumbnailsToggle}
            className={cn(
              "h-10 w-10 p-0 rounded-lg transition-all duration-200",
              showThumbnails 
                ? "bg-blue-500 text-white shadow-lg" 
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onFullscreenToggle}
            className="h-10 w-10 p-0 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Presentation Mode */}
        <div className="hidden md:flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
          <Button
            variant={presentationMode === 'auto' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('auto')}
            className={cn(
              "h-10 px-4 text-sm font-medium rounded-lg transition-all duration-200",
              presentationMode === 'auto' 
                ? "bg-blue-500 text-white shadow-lg" 
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            Auto
          </Button>
          <Button
            variant={presentationMode === 'manual' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('manual')}
            className={cn(
              "h-10 px-4 text-sm font-medium rounded-lg transition-all duration-200",
              presentationMode === 'manual' 
                ? "bg-blue-500 text-white shadow-lg" 
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            Manual
          </Button>
          <Button
            variant={presentationMode === 'presenter' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('presenter')}
            className={cn(
              "h-10 px-4 text-sm font-medium rounded-lg transition-all duration-200",
              presentationMode === 'presenter' 
                ? "bg-blue-500 text-white shadow-lg" 
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            <Eye className="h-4 w-4 mr-2" />
            Presenter
          </Button>
        </div>

        {/* Settings */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            "h-10 w-10 p-0 rounded-lg transition-all duration-200",
            showSettings 
              ? "bg-gray-200 dark:bg-gray-700" 
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* Export/Share */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
            className="h-10 w-10 p-0 rounded-lg transition-all duration-200 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
          >
            <Download className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="h-10 w-10 p-0 rounded-lg transition-all duration-200 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute bottom-full right-4 mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6 min-w-[320px] backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Presentation Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Default Slide Duration (seconds)
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <Slider
                    value={[10]}
                    onValueChange={([value]) => console.log('Duration:', value)}
                    min={5}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>5s</span>
                    <span>30s</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Presentation Options
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Auto-advance slides</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show slide numbers</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show speaker notes</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
