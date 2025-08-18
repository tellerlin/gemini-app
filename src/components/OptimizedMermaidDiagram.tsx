import React, { useState, useLayoutEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Download, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
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
  const [diagramType, setDiagramType] = useState<string>('');
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let isCancelled = false;
    
    const renderChart = async () => {
      try {
        setIsLoading(true);
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
        
        // Initialize Mermaid with intelligent sizing config
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: '"Inter", "Noto Sans CJK SC", "Microsoft YaHei", system-ui, sans-serif',
          suppressErrorRendering: false,
          accessibility: {
            enabled: true,
          },
          flowchart: {
            useMaxWidth: true, // Re-enable to respect container width
            htmlLabels: true,
            curve: 'basis',
            padding: detectedType === 'horizontal-flowchart' ? 25 : 20,
            nodeSpacing: detectedType === 'horizontal-flowchart' ? 60 : 50,
            rankSpacing: detectedType === 'horizontal-flowchart' ? 80 : 50,
            diagramPadding: detectedType === 'horizontal-flowchart' ? 15 : 8,
          },
          sequence: {
            diagramMarginX: 30,
            diagramMarginY: 20,
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
          },
          themeVariables: {
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: detectedType === 'horizontal-flowchart' ? '16px' : '14px',
            primaryColor: '#0088FE',
            primaryTextColor: '#000000',
            primaryBorderColor: '#0088FE',
            lineColor: '#333333',
          }
        });

        // Use already cleaned code from above
        
        // Step 1: Validate syntax before rendering using mermaid.parse
        // This prevents render errors and provides better error messages
        try {
          const parseResult = await mermaid.parse(cleanedCode, { suppressErrors: true });
          if (!parseResult) {
            throw new Error('Invalid Mermaid syntax detected');
          }
        } catch (parseError) {
          console.error('Mermaid parse validation failed:', parseError);
          throw new Error(`Syntax validation failed: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
        }
        
        // Temporarily disable accessibility features to avoid parsing conflicts
        // TODO: Re-enable once Mermaid accessibility syntax is stabilized
        // const accessibleCode = addAccessibilityFeatures(cleanedCode, title);
        
        // Generate unique ID to avoid conflicts
        const chartId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Step 2: Attempt rendering with error recovery
        const { svg: renderedSvg } = await mermaid.render(chartId, cleanedCode);
        
        if (!isCancelled) {
          setSvg(renderedSvg);
          setError('');
        }
      } catch (err) {
        if (!isCancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          console.error('Mermaid rendering error:', err);
          
          // Enhanced error messaging based on Context7 research
          let userFriendlyError = '';
          
          if (errorMessage.includes('Parse error') || errorMessage.includes('Syntax validation failed')) {
            if (/[\u4e00-\u9fff]/.test(code)) {
              userFriendlyError = '中文语法解析错误 - 请检查边缘标签格式 (使用 -->|标签| 格式)';
            } else {
              userFriendlyError = '语法解析错误 - 请检查Mermaid语法是否正确';
            }
          } else if (errorMessage.includes('Lexical error') || errorMessage.includes('UNICODE_TEXT')) {
            userFriendlyError = '词法错误 - 可能是注释格式错误，请将注释放在单独行';
          } else if (errorMessage.includes('Expecting')) {
            userFriendlyError = '语法错误 - 可能缺少分隔符或使用了不支持的字符';
          } else if (errorMessage.includes('timeout') || errorMessage.includes('Time limit')) {
            userFriendlyError = '渲染超时 - 图表过于复杂，请简化';
          } else {
            userFriendlyError = `渲染失败: ${errorMessage}`;
          }
          
          setError(userFriendlyError);
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

  const downloadDiagram = async () => {
    if (!svg) {
      toast.error('No diagram to download');
      return;
    }
    
    const filename = encodeURIComponent(title || 'mermaid-diagram');
    
    try {
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
                onClick={downloadDiagram}
                className="p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
                title="下载SVG格式"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Diagram */}
      <div 
        ref={containerRef}
        className="bg-white overflow-hidden"
        style={{
          padding: diagramType === 'horizontal-flowchart' ? '16px' : '16px',
          minHeight: diagramType === 'horizontal-flowchart' ? '400px' : '200px',
          maxHeight: diagramType === 'horizontal-flowchart' ? '600px' : '80vh'
        }}
      >
        <div 
          ref={svgRef}
          className="w-full overflow-auto transition-transform duration-200"
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: diagramType === 'horizontal-flowchart' ? 'center center' : 'center top'
          }}
        >
          <div 
            dangerouslySetInnerHTML={{ __html: svg }}
            className="mermaid-diagram w-full"
            style={{
              minHeight: diagramType === 'horizontal-flowchart' ? '350px' : 'auto'
            }}
          />
        </div>
      </div>
    </div>
  );
}