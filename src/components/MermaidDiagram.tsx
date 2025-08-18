import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Download, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fixMermaidSyntax } from '../utils/contentParser';

interface MermaidDiagramProps {
  code: string;
  title?: string;
}

export function MermaidDiagram({ code, title }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [scale, setScale] = useState(1);
  const [diagramType, setDiagramType] = useState<string>('');
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!code || !code.trim()) {
        setSvg('');
        setError('');
        return;
      }

      try {
        // Clear any existing SVG content first
        setSvg('');
        setError('');
        
        // Detect diagram type for intelligent sizing
        const cleanedCode = fixMermaidSyntax(code);
        const firstLine = cleanedCode.split('\n')[0].toLowerCase().trim();
        let detectedType = 'flowchart';
        
        if (firstLine.includes('graph lr') || firstLine.includes('flowchart lr') || firstLine.includes('graph rl') || firstLine.includes('flowchart rl')) {
          detectedType = 'horizontal-flowchart';
        } else if (firstLine.includes('graph td') || firstLine.includes('flowchart td') || firstLine.includes('graph tb') || firstLine.includes('flowchart tb')) {
          detectedType = 'vertical-flowchart';
        } else if (firstLine.includes('sequencediagram')) {
          detectedType = 'sequence';
        } else if (firstLine.includes('gantt')) {
          detectedType = 'gantt';
        } else if (firstLine.includes('pie')) {
          detectedType = 'pie';
        }
        
        setDiagramType(detectedType);
        
        // Get container dimensions for responsive sizing
        const containerWidth = containerRef.current?.clientWidth || window.innerWidth * 0.9;
        const containerHeight = window.innerHeight * 0.6;
        
        // Calculate optimal dimensions based on diagram type - never exceed container width
        let optimalWidth = containerWidth;
        let optimalHeight = containerHeight;
        
        if (detectedType === 'horizontal-flowchart') {
          // For horizontal flowcharts, use full container width but ensure adequate height
          optimalWidth = Math.min(containerWidth, containerWidth * 0.95); // Stay within container
          optimalHeight = Math.max(containerHeight * 0.6, 400); // Minimum 400px height
        } else if (detectedType === 'vertical-flowchart') {
          // For vertical flowcharts, prioritize height
          optimalWidth = Math.min(containerWidth, 600);
          optimalHeight = Math.max(containerHeight, 500);
        } else if (detectedType === 'sequence') {
          optimalWidth = Math.min(containerWidth, containerWidth * 0.9);
          optimalHeight = Math.max(containerHeight * 0.5, 350);
        }
        
        setContainerSize({ width: optimalWidth, height: optimalHeight });

        // Configure Mermaid with intelligent sizing
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: '"Noto Sans CJK SC", "Microsoft YaHei", "SimHei", sans-serif',
          flowchart: {
            useMaxWidth: true, // Re-enable to respect container width
            htmlLabels: true,
            curve: 'basis',
            padding: detectedType === 'horizontal-flowchart' ? 20 : 15,
            nodeSpacing: detectedType === 'horizontal-flowchart' ? 60 : 50,
            rankSpacing: detectedType === 'horizontal-flowchart' ? 80 : 50
          },
          sequence: {
            diagramMarginX: 30,
            diagramMarginY: 15,
            actorMargin: 40,
            width: 150,
            height: 65,
            boxMargin: 10,
            boxTextMargin: 5,
            noteMargin: 10,
            messageMargin: 35,
            useMaxWidth: true
          },
          gantt: {
            titleTopMargin: 25,
            barHeight: 20,
            fontSize: 12,
            sectionFontSize: 12,
            gridLineStartPadding: 35,
            bottomPadding: 20,
            useMaxWidth: true
          }
        });

        // Use already cleaned code from initialization

        // Validate that the cleaned code is not empty
        if (!cleanedCode || !cleanedCode.trim()) {
          setError('清理后的代码为空，请检查原始图表语法');
          return;
        }

        // Generate unique ID for this render
        const elementId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // First parse to check for syntax errors
        try {
          await mermaid.parse(cleanedCode);
        } catch (parseError) {
          console.error('Mermaid parse error:', parseError);
          throw parseError;
        }
        
        // Render the diagram
        const { svg: generatedSvg } = await mermaid.render(elementId, cleanedCode);
        
        // Set the generated SVG
        setSvg(generatedSvg);
        setError('');
        
        console.log('Mermaid diagram rendered successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Mermaid rendering error:', err);
        console.error('Error message:', errorMessage);
        console.error('Original code that failed:', code);
        
        // Provide more specific error messages
        if (errorMessage.includes('Parse error') || errorMessage.includes('Expecting')) {
          if (/[\u4e00-\u9fff]/.test(code)) {
            setError('中文语法解析错误 - 节点标签需要用引号包围，如: A["中文标签"]');
          } else {
            setError('语法解析错误 - 请检查图表语法是否正确');
          }
        } else if (errorMessage.includes('Lexical error')) {
          setError('词法分析错误 - 可能存在不支持的字符或格式');
        } else if (errorMessage.includes('Cannot read')) {
          setError('渲染错误 - 可能存在无效的节点引用');
        } else {
          setError(`渲染失败: ${errorMessage}`);
        }
      }
    };

    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(renderDiagram, 100);
    
    return () => clearTimeout(timeoutId);
  }, [code]);

  const downloadDiagram = () => {
    if (!svg) return;
    
    const filename = encodeURIComponent(title || 'diagram');
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.svg`;
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
          <div className="flex items-center space-x-1">
            <button
              onClick={downloadDiagram}
              className="p-1 text-gray-500 hover:text-gray-700"
              title="Download SVG"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Diagram */}
      <div 
        className="w-full overflow-hidden"
        style={{
          padding: diagramType === 'horizontal-flowchart' ? '16px' : '16px',
          minHeight: diagramType === 'horizontal-flowchart' ? '400px' : '200px',
          maxHeight: diagramType === 'horizontal-flowchart' ? '600px' : '80vh'
        }}
      >
        <div 
          ref={containerRef}
          className="w-full overflow-auto transition-transform duration-200"
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: diagramType === 'horizontal-flowchart' ? 'center center' : 'center top'
          }}
        >
          <div 
            dangerouslySetInnerHTML={{ __html: svg }} 
            className="w-full"
            style={{
              minHeight: diagramType === 'horizontal-flowchart' ? '350px' : 'auto'
            }}
          />
        </div>
      </div>
    </div>
  );
} 