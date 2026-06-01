import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type SlideTransition = 
  | 'fade' 
  | 'slide-left' 
  | 'slide-right' 
  | 'slide-up' 
  | 'slide-down'
  | 'zoom-in' 
  | 'zoom-out' 
  | 'flip-horizontal' 
  | 'flip-vertical'
  | 'rotate-in'
  | 'bounce-in'
  | 'pulse-in';

export interface SlideAnimationProps {
  children: React.ReactNode;
  isActive: boolean;
  transition: SlideTransition;
  duration?: number;
  delay?: number;
  className?: string;
}

export const SlideAnimation: React.FC<SlideAnimationProps> = ({
  children,
  isActive,
  transition,
  duration = 500,
  delay = 0,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(false);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsAnimating(false);
    }
  }, [isActive, delay]);

  const getTransitionClasses = () => {
    const baseClasses = "transition-all ease-out";
    const durationClass = `duration-${Math.min(duration, 1000)}`;
    
    if (!isActive) {
      return `${baseClasses} ${durationClass} opacity-0 transform`;
    }

    if (isAnimating) {
      switch (transition) {
        case 'fade':
          return `${baseClasses} ${durationClass} opacity-0 transform scale-95`;
        case 'slide-left':
          return `${baseClasses} ${durationClass} opacity-0 transform translate-x-12 scale-95`;
        case 'slide-right':
          return `${baseClasses} ${durationClass} opacity-0 transform -translate-x-12 scale-95`;
        case 'slide-up':
          return `${baseClasses} ${durationClass} opacity-0 transform translate-y-12 scale-95`;
        case 'slide-down':
          return `${baseClasses} ${durationClass} opacity-0 transform -translate-y-12 scale-95`;
        case 'zoom-in':
          return `${baseClasses} ${durationClass} opacity-0 transform scale-50`;
        case 'zoom-out':
          return `${baseClasses} ${durationClass} opacity-0 transform scale-150`;
        case 'flip-horizontal':
          return `${baseClasses} ${durationClass} opacity-0 transform rotate-y-180 scale-95`;
        case 'flip-vertical':
          return `${baseClasses} ${durationClass} opacity-0 transform rotate-x-180 scale-95`;
        case 'rotate-in':
          return `${baseClasses} ${durationClass} opacity-0 transform rotate-45 scale-75`;
        case 'bounce-in':
          return `${baseClasses} ${durationClass} opacity-0 transform -translate-y-8 scale-90`;
        case 'pulse-in':
          return `${baseClasses} ${durationClass} opacity-0 transform scale-75`;
        default:
          return `${baseClasses} ${durationClass} opacity-0 transform scale-95`;
      }
    }

    // Active state - slide is visible
    switch (transition) {
      case 'fade':
        return `${baseClasses} ${durationClass} opacity-100 transform scale-100`;
      case 'slide-left':
        return `${baseClasses} ${durationClass} opacity-100 transform translate-x-0 scale-100`;
      case 'slide-right':
        return `${baseClasses} ${durationClass} opacity-100 transform translate-x-0 scale-100`;
      case 'slide-up':
        return `${baseClasses} ${durationClass} opacity-100 transform translate-y-0 scale-100`;
      case 'slide-down':
        return `${baseClasses} ${durationClass} opacity-100 transform translate-y-0 scale-100`;
      case 'zoom-in':
        return `${baseClasses} ${durationClass} opacity-100 transform scale-100`;
      case 'zoom-out':
        return `${baseClasses} ${durationClass} opacity-100 transform scale-100`;
      case 'flip-horizontal':
        return `${baseClasses} ${durationClass} opacity-100 transform rotate-y-0 scale-100`;
      case 'flip-vertical':
        return `${baseClasses} ${durationClass} opacity-100 transform rotate-x-0 scale-100`;
      case 'rotate-in':
        return `${baseClasses} ${durationClass} opacity-100 transform rotate-0 scale-100`;
      case 'bounce-in':
        return `${baseClasses} ${durationClass} opacity-100 transform translate-y-0 scale-100`;
      case 'pulse-in':
        return `${baseClasses} ${durationClass} opacity-100 transform scale-100`;
      default:
        return `${baseClasses} ${durationClass} opacity-100 transform scale-100`;
    }
  };

  return (
    <div 
      className={cn(
        getTransitionClasses(),
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

// Animation presets for different slide types
export const slideAnimationPresets = {
  intro: 'fade' as SlideTransition,
  concept: 'slide-up' as SlideTransition,
  example: 'zoom-in' as SlideTransition,
  diagram: 'flip-horizontal' as SlideTransition,
  summary: 'bounce-in' as SlideTransition,
  default: 'fade' as SlideTransition
};

// Advanced animation presets with custom timing
export const advancedAnimationPresets = {
  intro: { transition: 'fade' as SlideTransition, duration: 800, delay: 0 },
  concept: { transition: 'slide-up' as SlideTransition, duration: 1000, delay: 200 },
  example: { transition: 'zoom-in' as SlideTransition, duration: 900, delay: 100 },
  diagram: { transition: 'flip-horizontal' as SlideTransition, duration: 1200, delay: 300 },
  summary: { transition: 'bounce-in' as SlideTransition, duration: 1000, delay: 0 },
  default: { transition: 'fade' as SlideTransition, duration: 600, delay: 0 }
};

// Staggered animation for multiple elements
export interface StaggeredAnimationProps {
  children: React.ReactNode[];
  isActive: boolean;
  transition: SlideTransition;
  staggerDelay?: number;
  className?: string;
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  isActive,
  transition,
  staggerDelay = 100,
  className
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <SlideAnimation
          key={index}
          isActive={isActive}
          transition={transition}
          delay={index * staggerDelay}
        >
          {child}
        </SlideAnimation>
      ))}
    </div>
  );
};
