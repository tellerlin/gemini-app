import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Download, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fixMermaidSyntax } from '../utils/contentParser';
import '../styles/mermaid-responsive.css';

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
  const [autoScale, setAutoScale] = useState(1); // 自动缩放比例
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContentRef = useRef<HTMLDivElement>(null);

  // 添加响应式监听器 - 修复无限循环问题
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.clientWidth;
        const newHeight = Math.max(window.innerHeight * 0.8, 600);
        
        // 只有当尺寸真正发生变化时才更新状态
        setContainerSize(prev => {
          if (Math.abs(prev.width - newWidth) > 10 || Math.abs(prev.height - newHeight) > 10) {
            return { width: newWidth, height: newHeight };
          }
          return prev;
        });
      }
    };

    // 使用防抖函数避免频繁触发
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    // 添加resize监听器
    window.addEventListener('resize', debouncedResize);
    
    // 初始设置 - 延迟执行确保DOM已渲染
    const initialTimeout = setTimeout(handleResize, 100);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, []);

  // 计算自动缩放比例
  const calculateAutoScale = (svgElement: SVGElement, containerWidth: number, containerHeight: number) => {
    try {
      const bbox = svgElement.getBBox();
      const svgWidth = bbox.width || svgElement.clientWidth || svgElement.scrollWidth;
      const svgHeight = bbox.height || svgElement.clientHeight || svgElement.scrollHeight;
      
      if (svgWidth <= 0 || svgHeight <= 0) return 1;
      
      const paddingFactor = 0.9;
      const availableWidth = containerWidth * paddingFactor;
      const availableHeight = containerHeight * paddingFactor;
      
      const scaleX = availableWidth / svgWidth;
      const scaleY = availableHeight / svgHeight;
      const optimalScale = Math.min(scaleX, scaleY, 1);
      
      return Math.max(0.1, optimalScale);
    } catch (error) {
      console.warn('Auto scale calculation failed:', error);
      return 1;
    }
  };

  // 在SVG渲染完成后计算自动缩放
  useEffect(() => {
    if (svg && svgContentRef.current && containerSize.width > 0) {
      const svgElement = svgContentRef.current.querySelector('svg');
      if (svgElement) {
        const timeoutId = setTimeout(() => {
          const newAutoScale = calculateAutoScale(svgElement, containerSize.width, containerSize.height);
          setAutoScale(newAutoScale);
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [svg, containerSize]);

  useEffect(() => {
    const renderDiagram = async () => {
      // 只有当code不为空时才渲染，移除容器宽度检查避免阻塞渲染
      if (!code || !code.trim()) {
        setSvg('');
        setError('');
        return;
      }

      try {
        // Clear any existing SVG content first
        setSvg('');
        setError('');
        
        console.group('🔍 Mermaid Rendering Diagnostics');
        console.log('📥 Input Code:', code);
        
        // Detect diagram type for intelligent sizing
        const cleanedCode = fixMermaidSyntax(code);
        console.log('🧹 Cleaned Code:', cleanedCode);
        
        // Check if the cleaning process returned empty string (invalid diagram)
        if (!cleanedCode || !cleanedCode.trim()) {
          console.log('❌ Cleaned code is empty');
          console.groupEnd();
          setError('Invalid or unsupported diagram format');
          return;
        }
        
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
        
        // 使用默认容器尺寸进行渲染，避免依赖容器初始化
        const containerWidth = containerSize.width || 800; // 默认800px宽度
        const containerHeight = containerSize.height || 600; // 默认600px高度
        
        console.log('📐 Container dimensions:', { containerWidth, containerHeight });

        // Configure Mermaid with adaptive sizing based on Context7 best practices
        console.log('⚙️ Initializing Mermaid with config...');
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: '"Noto Sans CJK SC", "Microsoft YaHei", "SimHei", sans-serif',
          // 启用全局自适应最大宽度 - Context7推荐的核心设置
          useMaxWidth: true,
          flowchart: {
            useMaxWidth: true, // 始终使用最大可用宽度
            htmlLabels: true,
            curve: 'basis',
            // 基于容器宽度的动态padding
            padding: Math.max(15, Math.min(containerWidth * 0.025, 30)),
            nodeSpacing: Math.max(40, Math.min(containerWidth * 0.07, 70)),
            rankSpacing: Math.max(50, Math.min(containerWidth * 0.09, 90))
          },
          sequence: {
            useMaxWidth: true,
            diagramMarginX: Math.max(20, Math.min(containerWidth * 0.04, 40)),
            diagramMarginY: 15,
            actorMargin: Math.max(30, Math.min(containerWidth * 0.06, 50)),
            width: Math.max(120, Math.min(containerWidth * 0.18, 180)),
            height: 65,
            boxMargin: 10,
            boxTextMargin: 5,
            noteMargin: 10,
            messageMargin: Math.max(25, Math.min(containerWidth * 0.05, 45)),
          },
          gantt: {
            useMaxWidth: true,
            titleTopMargin: 25,
            barHeight: 20,
            fontSize: Math.max(10, Math.min(containerWidth * 0.016, 14)),
            sectionFontSize: Math.max(12, Math.min(containerWidth * 0.02, 16)),
            gridLineStartPadding: 35,
            bottomPadding: 20,
          }
        });

        // Validate that the cleaned code is not empty
        if (!cleanedCode || !cleanedCode.trim()) {
          console.log('❌ Cleaned code is empty after processing');
          console.groupEnd();
          setError('清理后的代码为空，请检查原始图表语法');
          return;
        }

        // Generate unique ID for this render
        const elementId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log('🏷️ Using element ID:', elementId);
        
        // First parse to check for syntax errors
        console.log('🔍 Validating Mermaid syntax...');
        try {
          await mermaid.parse(cleanedCode);
          console.log('✅ Syntax validation passed');
        } catch (parseError) {
          console.error('❌ Mermaid parse error:', parseError);
          console.error('📝 Error details:', {
            message: parseError.message,
            code: cleanedCode
          });
          console.groupEnd();
          throw parseError;
        }
        
        // Render the diagram
        console.log('🎨 Rendering diagram...');
        const { svg: generatedSvg } = await mermaid.render(elementId, cleanedCode);
        
        console.log('📊 SVG Generation Results:', {
          svgLength: generatedSvg?.length || 0,
          hasContent: !!(generatedSvg && generatedSvg.trim()),
          preview: generatedSvg?.slice(0, 200) + '...'
        });
        
        // Set the generated SVG
        if (generatedSvg && generatedSvg.trim()) {
          setSvg(generatedSvg);
          setError('');
          console.log('✅ SVG successfully set to state');
        } else {
          console.log('❌ Generated SVG is empty or invalid');
          setError('Generated SVG is empty');
        }
        
        // 重置自动缩放
        setAutoScale(1);
        
        console.log('🎉 Mermaid diagram rendered successfully');
        console.groupEnd();
      } catch (err) {
        console.groupEnd();
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ Mermaid rendering error:', err);
        console.error('📝 Error message:', errorMessage);
        console.error('📄 Original code that failed:', code);
        
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

    // 减少延迟，立即开始渲染
    const timeoutId = setTimeout(renderDiagram, 50);
    
    return () => clearTimeout(timeoutId);
  }, [code]); // 只依赖code变化，移除containerSize依赖避免循环渲染

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

  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.3));
  const resetZoom = () => setScale(1);
  
  // 计算最终缩放比例
  const finalScale = scale * autoScale;

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
            disabled={scale <= 0.3}
            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs text-gray-500 min-w-[4rem] text-center">
            {Math.round(finalScale * 100)}%
            {autoScale < 1 && (
              <span className="block text-[10px] text-blue-600">
                自适应: {Math.round(autoScale * 100)}%
              </span>
            )}
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
            onClick={resetZoom}
            className="p-1 text-gray-500 hover:text-gray-700 text-xs"
            title="重置缩放"
          >
            复位
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

      {/* 自适应图表容器 */}
      <div 
        className="w-full overflow-hidden"
        style={{
          padding: '16px',
          // 动态最小高度基于图表类型
          minHeight: containerSize.height ? `${Math.max(containerSize.height * 0.6, 300)}px` : '300px',
          // 自适应最大高度避免过高
          maxHeight: '85vh'
        }}
      >
        <div 
          ref={containerRef}
          className="w-full overflow-auto transition-transform duration-200"
          style={{ 
            transform: `scale(${finalScale})`, 
            transformOrigin: 'center top',
            // 确保缩放时不会超出容器
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        >
          <div 
            ref={svgContentRef}
            dangerouslySetInnerHTML={{ __html: svg }} 
            className="w-full"
            style={{
              // 让SVG自适应容器尺寸
              width: 'fit-content',
              height: 'auto',
              // 确保SVG不会溢出
              maxWidth: 'none', // 允许SVG自然尺寸，由缩放控制适应
              // 对于特定图表类型设置最小高度
              minHeight: diagramType === 'horizontal-flowchart' ? '350px' : 
                        diagramType === 'sequence' ? '300px' : 
                        diagramType === 'gantt' ? '250px' : 'auto'
            }}
          />
        </div>
      </div>
    </div>
  );
} 