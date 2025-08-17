import React, { useState, useLayoutEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Download, ZoomIn, ZoomOut, FileDown, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { cn } from '../utils/cn';
import { fixMermaidSyntax } from '../utils/contentParser';

interface OptimizedMermaidDiagramProps {
  code: string;
  title?: string;
  enableExport?: boolean;
  className?: string;
}

export function OptimizedMermaidDiagram({ 
  code, 
  title, 
  enableExport = true,
  className 
}: OptimizedMermaidDiagramProps) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let isCancelled = false;
    
    const renderChart = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Initialize Mermaid with optimized config based on 2025 best practices
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: '"Inter", "Noto Sans CJK SC", "Microsoft YaHei", system-ui, sans-serif',
          // Accessibility best practices
          accessibility: {
            enabled: true,
          },
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
            padding: 20,
            // Performance optimization
            diagramPadding: 8,
          },
          themeVariables: {
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: '14px',
            // Improved contrast for accessibility
            primaryColor: '#0088FE',
            primaryTextColor: '#000000',
            primaryBorderColor: '#0088FE',
            lineColor: '#333333',
          }
        });

        // Clean and fix common Mermaid syntax issues using our enhanced fix function
        const cleanedCode = fixMermaidSyntax(code);
        
        // Temporarily disable accessibility features to avoid parsing conflicts
        // TODO: Re-enable once Mermaid accessibility syntax is stabilized
        // const accessibleCode = addAccessibilityFeatures(cleanedCode, title);
        
        // Generate unique ID to avoid conflicts
        const chartId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const { svg: renderedSvg } = await mermaid.render(chartId, cleanedCode);
        
        if (!isCancelled) {
          setSvg(renderedSvg);
          setError('');
        }
      } catch (err) {
        if (!isCancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          
          // Provide more specific error messages
          if (errorMessage.includes('Parse error')) {
            if (/[\u4e00-\u9fff]/.test(code)) {
              setError('中文语法解析错误 - 请检查边缘标签格式 (使用 -->|标签| 格式)');
            } else {
              setError('语法解析错误 - 请检查Mermaid语法');
            }
          } else if (errorMessage.includes('Lexical error')) {
            setError('词法错误 - 请检查图表定义语法');
          } else {
            setError(`渲染失败: ${errorMessage}`);
          }
          
          console.error('Mermaid rendering error:', err);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    renderChart();
    
    return () => {
      isCancelled = true;
    };
  }, [code]);

  // Add accessibility features to Mermaid code based on 2025 best practices
  const addAccessibilityFeatures = (mermaidCode: string, title?: string): string => {
    let accessibleCode = mermaidCode.trim();
    
    // Check if it's a valid diagram type first
    const firstLine = accessibleCode.split('\n')[0].toLowerCase().trim();
    const validDiagramTypes = ['graph', 'flowchart', 'sequencediagram', 'classDiagram', 'stateDiagram', 'gantt', 'pie', 'gitgraph'];
    
    const isValidDiagram = validDiagramTypes.some(type => 
      firstLine.startsWith(type) || firstLine.includes(type)
    );
    
    if (!isValidDiagram) {
      console.warn('Invalid Mermaid diagram type, skipping accessibility features');
      return accessibleCode;
    }
    
    // Only add accessibility features if they don't already exist
    if (!accessibleCode.includes('accTitle:') && title) {
      const lines = accessibleCode.split('\n');
      lines.splice(1, 0, `    accTitle: ${title}`);
      accessibleCode = lines.join('\n');
    }
    
    if (!accessibleCode.includes('accDescr:')) {
      const lines = accessibleCode.split('\n');
      let description = '';
      
      if (firstLine.includes('graph') || firstLine.includes('flowchart')) {
        description = '这是一个流程图，显示了步骤之间的关系和流程';
      } else if (firstLine.includes('sequencediagram')) {
        description = '这是一个时序图，显示了对象之间的交互顺序';
      } else if (firstLine.includes('classdiagram')) {
        description = '这是一个类图，显示了类的结构和关系';
      } else {
        description = '这是一个图表，用于可视化数据和关系';
      }
      
      lines.splice(1, 0, `    accDescr: ${description}`);
      accessibleCode = lines.join('\n');
    }
    
    return accessibleCode;
  };

  const downloadDiagram = async (format: 'svg' | 'pdf' = 'svg') => {
    if (!svg) {
      toast.error('No diagram to download');
      return;
    }
    
    const filename = encodeURIComponent(title || 'mermaid-diagram');
    
    try {
      if (format === 'svg') {
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('图表已下载为SVG格式');
      } else if (format === 'pdf' && svgRef.current) {
        const canvas = await html2canvas(svgRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgAspectRatio = canvas.width / canvas.height;
        const pdfAspectRatio = pdfWidth / pdfHeight;
        
        let imgWidth, imgHeight;
        if (imgAspectRatio > pdfAspectRatio) {
          imgWidth = pdfWidth - 20;
          imgHeight = imgWidth / imgAspectRatio;
        } else {
          imgHeight = pdfHeight - 20;
          imgWidth = imgHeight * imgAspectRatio;
        }
        
        const x = (pdfWidth - imgWidth) / 2;
        const y = (pdfHeight - imgHeight) / 2;
        
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        pdf.save(`${filename}.pdf`);
        toast.success('图表已下载为PDF格式');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('下载失败，请重试');
    }
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-sm text-gray-600">正在渲染图表...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-800 mb-1">图表渲染失败</h4>
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <details className="text-xs">
              <summary className="cursor-pointer text-red-600 hover:text-red-800 mb-2">
                查看Mermaid代码
              </summary>
              <pre className="bg-red-100 p-3 rounded text-red-800 overflow-x-auto border border-red-200">
                {code}
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700">
          {title || 'Mermaid图表'}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-gray-100"
            title="缩小"
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
            title="放大"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          
          {enableExport && (
            <div className="flex items-center space-x-1 ml-2 border-l border-gray-300 pl-2">
              <button
                onClick={() => downloadDiagram('svg')}
                className="p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
                title="下载SVG格式"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={() => downloadDiagram('pdf')}
                className="p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
                title="下载PDF格式"
              >
                <FileDown className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Diagram */}
      <div className="p-4 overflow-auto bg-white">
        <div 
          ref={svgRef}
          className="flex justify-center transition-transform duration-200"
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'center top'
          }}
        >
          <div 
            dangerouslySetInnerHTML={{ __html: svg }}
            className="mermaid-diagram"
          />
        </div>
      </div>
    </div>
  );
}