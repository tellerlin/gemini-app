import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fixMermaidSyntax } from '../utils/contentParser';

interface MermaidDiagramProps {
  code: string;
  title?: string;
  enableExport?: boolean;
}

export function MermaidDiagram({ 
  code, 
  title, 
  enableExport = true 
}: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderDiagram = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      setSvg('');

      if (!code || !code.trim()) {
        setIsLoading(false);
        return;
      }

      // Process code
      const processedCode = fixMermaidSyntax(code.trim());
      
      if (!processedCode || processedCode === 'UNSUPPORTED_TABLE_SYNTAX') {
        setError('Unsupported chart format');
        setIsLoading(false);
        return;
      }

      // Enhanced Mermaid initialization with Context7 best practices
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: '"Inter", "Noto Sans CJK SC", "Microsoft YaHei", "SimHei", system-ui, sans-serif',
        useMaxWidth: true,
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis',
          padding: 20
        },
        sequence: {
          useMaxWidth: true,
          diagramMarginX: 20,
          diagramMarginY: 10
        },
        gantt: {
          useMaxWidth: true
        },
        // Additional diagram types with useMaxWidth
        pie: {
          useMaxWidth: true
        },
        quadrantChart: {
          useMaxWidth: true
        },
        xyChart: {
          useMaxWidth: true
        },
        timeline: {
          useMaxWidth: true
        }
      });

      // Parse and render
      await mermaid.parse(processedCode);
      const chartId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const renderResult = await mermaid.render(chartId, processedCode);
      
      if (renderResult && renderResult.svg) {
        setSvg(renderResult.svg);
      } else {
        throw new Error('Rendering failed: No SVG content returned');
      }

    } catch (err) {
      console.error('Mermaid rendering error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Enhanced error messages
      let userFriendlyError = '';
      if (errorMessage.includes('Parse error') || errorMessage.includes('Syntax validation failed')) {
        if (/[\u4e00-\u9fff]/.test(code)) {
          userFriendlyError = 'Chinese syntax parsing error - please check edge label format';
        } else {
          userFriendlyError = 'Syntax parsing error - please check if Mermaid syntax is correct';
        }
      } else if (errorMessage.includes('Lexical error')) {
        userFriendlyError = 'Lexical error - possible comment format error';
      } else {
        userFriendlyError = `Rendering failed: ${errorMessage}`;
      }
      
      setError(userFriendlyError);
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);

  const downloadDiagram = useCallback(async () => {
    if (!svg) {
      toast.error('No chart available for download');
      return;
    }
    
    try {
      const filename = encodeURIComponent(title || 'mermaid-diagram');
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Chart downloaded as SVG format');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed, please try again');
    }
  }, [svg, title]);

  const zoomIn = useCallback(() => setScale(prev => Math.min(prev * 1.2, 3)), []);
  const zoomOut = useCallback(() => setScale(prev => Math.max(prev / 1.2, 0.3)), []);
  const resetZoom = useCallback(() => setScale(1), []);

  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-sm text-gray-600">Rendering chart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-red-800 mb-1">Chart rendering failed</h4>
        <p className="text-sm text-red-700 mb-3">{error}</p>
        <details className="text-xs">
          <summary className="cursor-pointer text-red-600 hover:text-red-800 mb-2">
            View Raw Code
          </summary>
          <pre className="bg-red-100 p-3 rounded text-red-800 overflow-x-auto border border-red-200">
            {code}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700">
          {title || 'Mermaid Chart'}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.3}
            className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-gray-100"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs text-gray-500 min-w-[3rem] text-center font-mono">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 3}
            className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-gray-100"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={resetZoom}
            className="p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            title="Reset zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          
          {enableExport && (
            <div className="flex items-center space-x-1 ml-2 border-l border-gray-300 pl-2">
              <button
                onClick={downloadDiagram}
                className="p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
                title="Download SVG format"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Diagram Container - Enhanced with responsive design from HTML export */}
      <div 
        ref={containerRef}
        className="p-4 overflow-auto bg-white flex justify-center items-center"
        style={{ 
          minHeight: '200px', 
          maxHeight: '90vh',
          textAlign: 'center'
        }}
      >
        {svg ? (
          <div 
            className="mermaid-diagram-wrapper max-w-full w-full flex justify-center"
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'center',
              transition: 'transform 0.2s ease-in-out',
              overflow: 'visible'
            }}
          >
            <div 
              dangerouslySetInnerHTML={{ __html: svg }}
              className="mermaid-diagram max-w-full"
              style={{
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p>No chart content</p>
          </div>
        )}
      </div>
    </div>
  );
}