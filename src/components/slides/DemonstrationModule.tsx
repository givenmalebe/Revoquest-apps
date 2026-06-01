import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface DemoData {
  id: string;
  type: 'animation' | 'chart' | 'diagram' | 'simulation' | 'interactive';
  title: string;
  description: string;
  config: any;
}

interface DemonstrationModuleProps {
  demo: DemoData;
  isActive: boolean;
  className?: string;
}

export const DemonstrationModule: React.FC<DemonstrationModuleProps> = ({
  demo,
  isActive,
  className
}) => {
  const renderDemo = () => {
    switch (demo.type) {
      case 'animation':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="text-center">
                  <div className={cn(
                    "w-16 h-16 rounded-lg flex items-center justify-center text-2xl",
                    step === 1 ? "bg-blue-100 animate-pulse" : 
                    step === 2 ? "bg-green-100 animate-bounce" : 
                    "bg-purple-100 animate-spin"
                  )}>
                    {demo.config?.icons?.[step - 1] || '⚡'}
                  </div>
                  <div className="text-xs mt-2 text-gray-600">
                    Step {step}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <div className="flex space-x-2">
                {[1, 2, 3].map((dot) => (
                  <div key={dot} className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    dot === 1 ? "bg-blue-400" : 
                    dot === 2 ? "bg-green-400" : 
                    "bg-purple-400"
                  )} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {[40, 60, 80, 95].map((height, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-gradient-to-t from-blue-500 to-blue-300 rounded-t animate-pulse"
                    style={{ 
                      height: `${height}px`, 
                      width: '20px',
                      animationDelay: `${index * 0.2}s`
                    }}
                  />
                  <div className="text-xs mt-1 text-gray-600">
                    {demo.config?.labels?.[index] || `Item ${index + 1}`}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600">
              {demo.config?.chartTitle || 'Performance Metrics'}
            </div>
          </div>
        );

      case 'diagram':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-2xl">📊</span>
              </div>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 animate-pulse rounded" />
                <div className="text-xs text-center mt-1 text-gray-600">Processing</div>
              </div>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            <div className="text-center text-sm text-gray-600">
              {demo.description}
            </div>
          </div>
        );

      case 'simulation':
        return (
          <div className="space-y-4">
            <div className="relative h-32 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg overflow-hidden">
              <div className="absolute top-4 left-4 w-4 h-4 bg-red-400 rounded-full animate-ping" />
              <div className="absolute top-8 right-8 w-6 h-6 bg-blue-400 rounded-full animate-bounce" />
              <div className="absolute bottom-6 left-1/2 w-5 h-5 bg-green-400 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-lg font-semibold text-gray-700 animate-pulse">
                  {demo.config?.simulationText || 'Live Simulation'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
              <div className="text-center">
                <div className="w-3 h-3 bg-red-400 rounded-full mx-auto mb-1" />
                Input
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mx-auto mb-1" />
                Process
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-1" />
                Output
              </div>
            </div>
          </div>
        );

      case 'interactive':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-3xl mb-2 animate-pulse">🔍</div>
                <div className="text-sm font-semibold text-blue-800">Explore</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-3xl mb-2 animate-bounce">⚡</div>
                <div className="text-sm font-semibold text-green-800">Apply</div>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-100 rounded-full">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span className="text-sm text-purple-800">Interactive Learning</span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <div>Content Loading...</div>
          </div>
        );
    }
  };

  return (
    <Card className={cn(
      "p-4 transition-all duration-300",
      isActive ? "ring-2 ring-purple-500 shadow-lg" : "opacity-75",
      className
    )}>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {demo.type.toUpperCase()}
          </Badge>
          {isActive && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
        <h3 className="font-semibold text-gray-800">{demo.title}</h3>
      </div>
      
      <div className="mb-3">
        {renderDemo()}
      </div>
      
      <p className="text-xs text-gray-600">{demo.description}</p>
    </Card>
  );
};
