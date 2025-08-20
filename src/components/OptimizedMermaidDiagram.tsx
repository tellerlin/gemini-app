import React, { useState, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import mermaid from 'mermaid';
import { Download, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../utils/cn';
import { fixMermaidSyntax } from '../utils/contentParser';
import { debounce, hasSignificantSizeChange, getResponsiveConfig } from '../utils/responsiveHelpers';
import '../styles/mermaid-responsive.css';

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
  const [autoScale, setAutoScale] = useState(1);
  const [isScaleCalculated, setIsScaleCalculated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const svgContentRef = useRef<HTMLDivElement>(null);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCodeRef = useRef<string>('');
  const isRenderingRef = useRef<boolean>(false);

  // Simple code processing without memoization to prevent issues
  const processedCode = fixMermaidSyntax(code || '');

  // 添加响应式监听器 - 使用优化的防抖和尺寸检测
  useLayoutEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.clientWidth;
        const newHeight = Math.max(window.innerHeight * 0.8, 600);
        
        // Use more conservative threshold to prevent unnecessary updates
        setContainerSize(prev => {
          if (hasSignificantSizeChange(prev, { width: newWidth, height: newHeight }, 25)) {
            // Reset scale calculation when container changes significantly
            setIsScaleCalculated(false);
            return { width: newWidth, height: newHeight };
          }
          return prev;
        });
      }
    };

    // Use longer debounce to reduce flashing
    const debouncedResize = debounce(handleResize, 300);

    // Add resize listener
    window.addEventListener('resize', debouncedResize);
    
    // Initial setup with longer delay to ensure DOM is ready
    const initialTimeout = setTimeout(handleResize, 200);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(initialTimeout);
    };
  }, []);

  // 计算自动缩放比例以确保内容适应容器
  const calculateAutoScale = (svgElement: SVGElement, containerWidth: number, containerHeight: number) => {
    try {
      // 计算自动缩放比例以确保内容适应容器
      const bbox = svgElement.getBBox();
      let svgWidth = bbox.width;
      let svgHeight = bbox.height;
      
      // 如果bbox无效，尝试从样式获取尺寸
      if (svgWidth <= 0 || svgHeight <= 0) {
        const computedStyle = window.getComputedStyle(svgElement);
        svgWidth = parseFloat(computedStyle.width) || svgElement.clientWidth || 800;
        svgHeight = parseFloat(computedStyle.height) || svgElement.clientHeight || 600;
      }
      
      if (svgWidth <= 0 || svgHeight <= 0) {
        console.warn('Invalid SVG dimensions, using defaults');
        return 1;
      }
      
      // 根据容器大小动态调整边距
      const horizontalPadding = Math.max(32, containerWidth * 0.05);
      const verticalPadding = Math.max(32, containerHeight * 0.05);
      
      const availableWidth = containerWidth - horizontalPadding;
      const availableHeight = containerHeight - verticalPadding;
      
      // 计算缩放比例
      const scaleX = availableWidth / svgWidth;
      const scaleY = availableHeight / svgHeight;
      
      // Intelligent scaling strategy considering readability and user experience
      let optimalScale = Math.min(scaleX, scaleY);
      
      // Set minimum readable scale to avoid text being too small
      const minReadableScale = 0.6; // Minimum 60% to ensure readability
      
      // For very wide horizontal flowcharts, prioritize readability
      if (svgWidth > containerWidth * 1.5) {
        // If diagram is very wide, allow horizontal scrolling instead of excessive scaling down
        optimalScale = Math.max(minReadableScale, Math.min(scaleY, 1.2));
      } else {
        // For moderate-sized diagrams, allow moderate scaling up
        optimalScale = Math.min(scaleX, scaleY, 1.5);
      }
      
      // Ensure scale is within reasonable bounds
      optimalScale = Math.max(minReadableScale, Math.min(optimalScale, 2.0));
      
      console.log('Auto scale calculation:', {
        svgWidth,
        svgHeight,
        availableWidth,
        availableHeight,
        scaleX,
        scaleY,
        optimalScale,
        strategy: svgWidth > containerWidth * 1.5 ? 'horizontal-scroll' : 'fit-container'
      });
      
      return optimalScale;
    } catch (error) {
      console.warn('Auto scale calculation failed:', error);
      return 1;
    }
  };

  // 在SVG渲染完成后计算自动缩放
  useLayoutEffect(() => {
    if (svg && svgContentRef.current && containerSize.width > 0 && !isScaleCalculated) {
      const svgElement = svgContentRef.current.querySelector('svg');
      if (svgElement) {
        // Ensure SVG is fully rendered before calculating scale
        const timeoutId = setTimeout(() => {
          const currentUserScale = scale;
          
          const newAutoScale = calculateAutoScale(svgElement, containerSize.width, containerSize.height);
          setAutoScale(newAutoScale);
          setIsScaleCalculated(true);
          
          // Reset user scale only on initial render
          if (currentUserScale === 1) {
            setScale(1);
          }
        }, 150);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [svg, containerSize, isScaleCalculated]); // Add isScaleCalculated to dependencies

  useLayoutEffect(() => {
    // Clear any existing timeout
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    
    // Skip if already rendering or code hasn't changed
    if (isRenderingRef.current || lastCodeRef.current === processedCode) {
      return;
    }
    
    let isCancelled = false;
    
    const renderChart = async () => {
      try {
        // Skip if already rendering
        if (isRenderingRef.current) return;
        
        isRenderingRef.current = true;
        lastCodeRef.current = processedCode;
        
        setIsLoading(true);
        setError('');
        
        // Only render when we have valid code and container is ready
        if (!processedCode || !processedCode.trim() || containerSize.width === 0) {
          setIsLoading(false);
          isRenderingRef.current = false;
          return;
        }
        
        // Check for unsupported table syntax first
        if (processedCode === 'UNSUPPORTED_TABLE_SYNTAX') {
          setError('Mermaid does not support table syntax. Please use these alternatives:\n1. Use HTML tables\n2. Use flowchart to show table structure\n3. Use class diagram to show data relationships');
          setIsLoading(false);
          isRenderingRef.current = false;
          return;
        }
        
        // Check if the cleaning process returned empty string (invalid diagram)
        if (!processedCode || !processedCode.trim()) {
          setError('Invalid or unsupported diagram format');
          setIsLoading(false);
          isRenderingRef.current = false;
          return;
        }
        
        const firstLine = processedCode.split('\n')[0].toLowerCase().trim();
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
        
        // 使用已设置的容器尺寸，不再触发状态更新
        const containerWidth = containerSize.width;
        const containerHeight = containerSize.height;
        
        // 获取响应式配置
        const responsiveConfig = getResponsiveConfig(containerWidth, detectedType);
        
        // Initialize Mermaid with adaptive configuration based on Context7 best practices
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: '"Inter", "Noto Sans CJK SC", "Microsoft YaHei", system-ui, sans-serif',
          suppressErrorRendering: false,
          // 启用全局自适应最大宽度 - Context7推荐的核心设置
          useMaxWidth: true,
          accessibility: {
            enabled: true,
          },
          // 响应式配置基于容器大小动态调整
          flowchart: {
            useMaxWidth: true, // 始终使用最大可用宽度
            htmlLabels: true,
            curve: 'basis',
            padding: responsiveConfig.padding,
            nodeSpacing: responsiveConfig.nodeSpacing,
            rankSpacing: responsiveConfig.rankSpacing,
            diagramPadding: Math.max(8, Math.min(containerWidth * 0.02, 20)),
          },
          sequence: {
            useMaxWidth: true,
            diagramMarginX: responsiveConfig.marginX,
            diagramMarginY: 20,
            actorMargin: responsiveConfig.actorMargin,
            width: responsiveConfig.actorWidth,
            height: 65,
            boxMargin: 10,
            boxTextMargin: 5,
            noteMargin: 10,
            messageMargin: responsiveConfig.messageMargin,
          },
          gantt: {
            useMaxWidth: true,
            titleTopMargin: 25,
            barHeight: 20,
            fontSize: responsiveConfig.fontSize,
            sectionFontSize: Math.max(12, responsiveConfig.fontSize + 2),
            gridLineStartPadding: 35,
            bottomPadding: 20,
          },
          // XY图表配置 - 支持自适应尺寸
          xyChart: {
            useMaxWidth: true,
            width: Math.min(containerWidth * 0.95, 1000),
            height: Math.min(containerHeight * 0.8, 600),
            titlePadding: 10,
            titleFontSize: responsiveConfig.fontSize + 2,
          },
          // 饼图配置
          pie: {
            useMaxWidth: true,
            textPosition: 0.75,
          },
          // 时间线配置
          timeline: {
            useMaxWidth: true,
          },
          themeVariables: {
            fontFamily: '"Inter", system-ui, sans-serif',
            // 响应式字体大小
            fontSize: `${responsiveConfig.fontSize}px`,
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
          const parseResult = await mermaid.parse(processedCode, { suppressErrors: true });
          if (!parseResult) {
            throw new Error('Invalid Mermaid syntax detected');
          }
        } catch (parseError) {
          console.error('Mermaid parse validation failed:', parseError);
          throw new Error(`Syntax validation failed: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
        }
        
        // Temporarily disable accessibility features to avoid parsing conflicts
        // TODO: Re-enable once Mermaid accessibility syntax is stabilized
        // const accessibleCode = addAccessibilityFeatures(processedCode, title);
        
        // Generate unique ID to avoid conflicts
        const chartId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Step 2: Attempt rendering with error recovery
        const { svg: renderedSvg } = await mermaid.render(chartId, processedCode);
        
        if (!isCancelled) {
          setSvg(renderedSvg);
          setError('');
          // Reset scale calculation flag for new diagram
          setIsScaleCalculated(false);
          setAutoScale(1);
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
        isRenderingRef.current = false;
      }
    };

    // Add timeout to prevent rapid re-renders
    renderTimeoutRef.current = setTimeout(renderChart, 100);
    
    return () => {
      isCancelled = true;
      isRenderingRef.current = false;
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [processedCode, containerSize]); // Use processedCode instead of cleanedCode

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

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 5)); // 增加放大限制
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.2)); // 增加缩小限制
  
  // Reset zoom to auto-fit size with improved logic
  const resetZoom = useCallback(() => {
    setScale(1);
    // Force recalculation of auto scale
    setIsScaleCalculated(false);
  }, []);
  
  // 计算最终的缩放比例（用户缩放 × 自动缩放）
  const finalScale = scale * autoScale;

  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-sm text-gray-600">正在渲染图表...</p>
      </div>
    );
  }

  if (error) {
    const isTableError = error.includes('Mermaid不支持表格语法');
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-800 mb-1">
              {isTableError ? '不支持的图表类型' : '图表渲染失败'}
            </h4>
            <div className="text-sm text-red-700 mb-3 whitespace-pre-line">{error}</div>
            
            {isTableError && (
              <div className="bg-red-100 p-3 rounded border border-red-200 mb-3">
                <p className="text-xs text-red-800 font-medium mb-2">建议的Mermaid表格替代方案：</p>
                <pre className="text-xs text-red-800 overflow-x-auto">
{`// 方案1: 使用flowchart表示表格结构
graph TD
    Table["📊 我的表格"]
    Table --> H1["列标题 A"]
    Table --> H2["列标题 B"] 
    Table --> H3["列标题 C"]
    H1 --> D1A["数据 1A"]
    H1 --> D2A["数据 2A"]
    H2 --> D1B["数据 1B"]
    H2 --> D2B["数据 2B"]

// 方案2: 使用class diagram表示数据关系
classDiagram
    class 表格数据 {
        +列标题A : string
        +列标题B : string  
        +列标题C : string
    }`}
                </pre>
              </div>
            )}
            
            <details className="text-xs">
              <summary className="cursor-pointer text-red-600 hover:text-red-800 mb-2">
                查看原始代码
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
    <div 
      key={`mermaid-${processedCode.slice(0, 50)}`} // Add key to force proper re-mounting
      className={cn("bg-white border border-gray-200 rounded-lg overflow-hidden", className)}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700">
          {title || 'Mermaid图表'}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.2}
            className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-gray-100"
            title="缩小"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs text-gray-500 min-w-[4rem] text-center font-mono">
            {Math.round(finalScale * 100)}%
            {autoScale !== 1 && (
              <span className="block text-[10px] text-blue-600">
                自适应: {Math.round(autoScale * 100)}%
                {autoScale >= 0.6 && autoScale < 1 && (
                  <span className="block text-[10px] text-green-600">
                    可滚动
                  </span>
                )}
              </span>
            )}
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 5}
            className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-gray-100"
            title="放大"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={resetZoom}
            className="p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 text-xs"
            title="重置缩放"
          >
            复位
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

      {/* 自适应图表容器 */}
      <div 
        ref={containerRef}
        className="bg-white overflow-hidden"
        style={{
          padding: '16px',
          // 动态最小高度基于图表类型和内容
          minHeight: containerSize.height ? `${Math.max(containerSize.height * 0.6, 300)}px` : '300px',
          // 自适应最大高度避免过高
          maxHeight: '85vh',
        }}
      >
        <div 
          ref={svgRef}
          className="w-full h-full flex items-center justify-center transition-transform duration-200"
          style={{ 
            transform: `scale(${finalScale})`, 
            transformOrigin: finalScale < 1 ? 'center center' : 'center top',
            // 动态调整最小尺寸确保内容居中
            minWidth: '100%',
            minHeight: '100%',
            // When diagram is scaled and wide, allow horizontal scrolling
            overflowX: finalScale < 1 && svgContentRef.current ? 'auto' : 'visible',
            overflowY: 'auto'
          }}
        >
          <div 
            ref={svgContentRef}
            dangerouslySetInnerHTML={{ __html: svg }}
            className="mermaid-diagram"
            style={{
              // 让SVG保持原始尺寸，通过外层缩放控制适应
              width: 'auto',
              height: 'auto',
              // 移除最大宽度限制，让缩放处理尺寸适应
              display: 'inline-block',
              // 确保SVG在容器中居中
              margin: 'auto',
              // Set reasonable minimum sizes for different diagram types
              minWidth: diagramType === 'horizontal-flowchart' ? '600px' : 
                        diagramType === 'sequence' ? '500px' : 
                        diagramType === 'gantt' ? '700px' : '400px',
              minHeight: diagramType === 'horizontal-flowchart' ? '300px' : 
                        diagramType === 'sequence' ? '400px' : 
                        diagramType === 'gantt' ? '250px' : '200px'
            }}
          />
        </div>
      </div>
    </div>
  );
}