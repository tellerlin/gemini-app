import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Download, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MermaidDiagramProps {
  code: string;
  title?: string;
}

export function MermaidDiagram({ code, title }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'Inter, system-ui, sans-serif',
        });

        const { svg: generatedSvg } = await mermaid.render(`mermaid-${Date.now()}`, code);
        setSvg(generatedSvg);
        setError('');
      } catch (err) {
        setError('Failed to render diagram');
        console.error('Mermaid error:', err);
      }
    };

    renderDiagram();
  }, [code]);

  const downloadSVG = () => {
    if (!svg) return;
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'diagram'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Diagram downloaded as SVG');
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="text-sm font-medium mb-2">Diagram rendering failed</p>
        <p className="text-xs text-red-600 mb-3">{error}</p>
        <details className="text-xs">
          <summary className="cursor-pointer text-red-600 hover:text-red-800">
            View Mermaid code
          </summary>
          <pre className="mt-2 bg-red-100 p-2 rounded text-red-800 overflow-x-auto">
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
          {title || 'Flowchart Diagram'}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs text-gray-500 min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 3}
            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={downloadSVG}
            className="p-1 text-gray-500 hover:text-gray-700"
            title="Download SVG"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Diagram */}
      <div className="p-4 overflow-auto">
        <div 
          ref={containerRef}
          className="flex justify-center"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
        >
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
      </div>
    </div>
  );
} 