'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Maximize2, Minimize2, Download, Copy, Check, RefreshCw } from 'lucide-react';

interface MermaidDiagramProps {
  diagram: string;
  title?: string;
}

export function MermaidDiagram({ diagram, title }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const renderDiagram = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Dynamically import mermaid only on client
      const mermaid = (await import('mermaid')).default;
      
      // Reset mermaid state
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        flowchart: {
          htmlLabels: true,
          useMaxWidth: true,
          curve: 'basis',
        },
        themeVariables: {
          primaryColor: '#10B981',
          primaryTextColor: '#1F2937',
          primaryBorderColor: '#D1D5DB',
          lineColor: '#6B7280',
          secondaryColor: '#F3F4F6',
          tertiaryColor: '#F9FAFB',
        },
      });

      // Generate unique ID
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Render the diagram
      const { svg } = await mermaid.render(id, diagram);
      setSvgContent(svg);
      setIsLoading(false);
    } catch (err) {
      console.error('Mermaid rendering error:', err);
      setError(`Failed to render: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [diagram]);

  useEffect(() => {
    // Small delay to ensure client-side hydration is complete
    const timer = setTimeout(() => {
      renderDiagram();
    }, 100);

    return () => clearTimeout(timer);
  }, [renderDiagram, retryCount]);

  const handleRetry = () => {
    setRetryCount(c => c + 1);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(diagram);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!svgContent) return;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'flowchart'}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
          onClick={toggleFullscreen}
        >
          <div 
            className="bg-white rounded-xl max-w-[95vw] max-h-[95vh] overflow-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Minimize2 size={20} />
              </button>
            </div>
            <div 
              className="mermaid-fullscreen"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        </div>
      )}

      {/* Regular View */}
      <div className="relative group">
        {/* Toolbar */}
        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm border transition-colors"
            title="Copy Mermaid code"
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
          </button>
          {svgContent && (
            <button
              onClick={handleDownload}
              className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm border transition-colors"
              title="Download SVG"
            >
              <Download size={16} />
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm border transition-colors"
            title="Fullscreen"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {/* Diagram Container */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border overflow-auto min-h-[400px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-[400px] gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
              <p className="text-sm text-slate-500">Rendering diagram...</p>
            </div>
          )}
          
          {error && (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
              <p className="text-red-500 text-sm">{error}</p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          )}
          
          {!isLoading && !error && svgContent && (
            <div 
              ref={containerRef}
              className="p-6 flex justify-center items-center"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          )}
        </div>
      </div>
    </>
  );
}
