import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Square, 
  Maximize, 
  Monitor,
  Presentation
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SlideRenderer, SlideData } from './slides/SlideRenderer';
import { DemonstrationModule, DemoData } from './slides/DemonstrationModule';
import { SlideGenerator, PresentationData } from './slides/SlideGenerator';
import { PresentationControls } from './slides/PresentationControls';
import { SlideThumbnails } from './slides/SlideThumbnails';
import { PresenterView } from './slides/PresenterView';
import { SlideExportService } from '../services/slideExportService';

interface VirtualStudioProps {
  question?: string;
  aiResponse?: string;
  className?: string;
  onPresentationComplete?: () => void;
}

export const VirtualStudio: React.FC<VirtualStudioProps> = ({
  question,
  aiResponse,
  className,
  onPresentationComplete
}) => {
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [evaluationStatus, setEvaluationStatus] = useState<'generating' | 'evaluating' | 'approved' | 'improving' | 'ready'>('ready');
  
  // Advanced presentation features
  const [speed, setSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [presentationMode, setPresentationMode] = useState<'auto' | 'manual' | 'presenter'>('auto');
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(10);
  
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const studioRef = useRef<HTMLDivElement>(null);

  // Generate presentation when question changes
  useEffect(() => {
    if (question && question.trim()) {
      generatePresentation(question);
    }
  }, [question]);

  // Auto-start presentation when generated
  useEffect(() => {
    if (presentation && !isPlaying) {
      setTimeout(() => startPresentation(), 1000);
    }
  }, [presentation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const generatePresentation = async (topic: string) => {
    setIsGenerating(true);
    setEvaluationStatus('generating');
    
    try {
      console.log('🤖 Starting AI-powered presentation generation...');
      setEvaluationStatus('evaluating');
      
      // Generate presentation with AI evaluation
      const newPresentation = await SlideGenerator.generatePresentation(topic, aiResponse);
      
      setEvaluationStatus('approved');
      setPresentation(newPresentation);
      setCurrentSlideIndex(0);
      setProgress(0);
      
      // Show ready status briefly before starting
      setTimeout(() => {
        setEvaluationStatus('ready');
      }, 1000);
      
      console.log('✅ AI-powered presentation generated and approved!');
    } catch (error) {
      console.error('Error generating presentation:', error);
      setEvaluationStatus('ready');
      console.log('⚠️ Falling back to basic presentation generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const startPresentation = () => {
    setIsPlaying(true);
    startSlideProgress();
  };

  const pausePresentation = () => {
    setIsPlaying(false);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const stopPresentation = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentSlideIndex(0);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const startSlideProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    const interval = Math.max(50, 100 / speed); // Adjust interval based on speed
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        const increment = speed; // Progress increment based on speed
        const newProgress = prev + increment;
        
        if (newProgress >= 100) {
          nextSlide();
          return 0;
        }
        
        return newProgress;
      });
    }, interval);
  };

  const nextSlide = () => {
    if (!presentation) return;
    
    const nextIndex = currentSlideIndex + 1;
    if (nextIndex >= presentation.slides.length) {
      // Presentation complete
      setIsPlaying(false);
      setProgress(0);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      onPresentationComplete?.();
    } else {
      setCurrentSlideIndex(nextIndex);
      setProgress(0);
      if (isPlaying) {
        startSlideProgress();
      }
    }
  };

  const previousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
      setProgress(0);
      if (isPlaying) {
        startSlideProgress();
      }
    }
  };

  const toggleFullscreen = () => {
    if (studioRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        studioRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    }
  };

  const handleSlideSelect = (slideIndex: number) => {
    setCurrentSlideIndex(slideIndex);
    setProgress(0);
    if (isPlaying) {
      startSlideProgress();
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isPlaying) {
      startSlideProgress(); // Restart with new speed
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleThumbnailsToggle = () => {
    setShowThumbnails(!showThumbnails);
  };

  const handleModeChange = (mode: 'auto' | 'manual' | 'presenter') => {
    setPresentationMode(mode);
    if (mode === 'manual') {
      pausePresentation();
    }
  };

  const handleExport = async () => {
    if (!presentation) return;

    try {
      // Get all slide elements
      const slideElements = presentation.slides.map((_, index) => {
        const slideElement = document.querySelector(`[data-slide-index="${index}"]`) as HTMLElement;
        return slideElement;
      }).filter(Boolean) as HTMLElement[];

      if (slideElements.length === 0) {
        console.error('No slide elements found for export');
        return;
      }

      // Export as PDF
      await SlideExportService.exportPresentation(
        slideElements,
        presentation.title,
        { format: 'pdf', orientation: 'landscape' }
      );
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share presentation');
  };

  // Update duration when slide changes
  useEffect(() => {
    if (presentation && presentation.slides[currentSlideIndex]) {
      setCurrentDuration(presentation.slides[currentSlideIndex].duration);
    }
  }, [currentSlideIndex, presentation]);

  if (isGenerating) {
    return (
      <div className={cn("h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50", className)}>
        <Card className="p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI-Powered Generation</h3>
          <div className="space-y-3">
            <p className="text-gray-600 font-medium">
              {evaluationStatus === 'generating' && '🤖 AI is writing comprehensive content for all slides...'}
              {evaluationStatus === 'evaluating' && '📊 AI is evaluating educational quality and content...'}
              {evaluationStatus === 'approved' && '✅ AI approved! High-quality presentation ready!'}
              {evaluationStatus === 'improving' && '🔄 AI is refining slides based on evaluation...'}
            </p>
            <div className="flex items-center justify-center space-x-3 text-sm">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${evaluationStatus === 'generating' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className={evaluationStatus === 'generating' ? 'text-blue-600 font-medium' : 'text-gray-500'}>Generate</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${evaluationStatus === 'evaluating' ? 'bg-yellow-500 animate-pulse' : evaluationStatus === 'approved' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={evaluationStatus === 'evaluating' ? 'text-yellow-600 font-medium' : evaluationStatus === 'approved' ? 'text-green-600 font-medium' : 'text-gray-500'}>Evaluate</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${evaluationStatus === 'approved' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className={evaluationStatus === 'approved' ? 'text-green-600 font-medium' : 'text-gray-500'}>Approve</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className={cn("h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50", className)}>
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Presentation className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Virtual Studio Ready</h3>
          <p className="text-gray-600">
            Ask a question in the chat and I'll create<br />
            an interactive presentation here!
          </p>
        </div>
      </div>
    );
  }

  // All slides are shown in continuous view - no need for individual slide tracking

  // Hide the presentation completely - only show chat
  return null;
};
