/**
 * 防抖函数 - 避免频繁触发函数调用
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

/**
 * 节流函数 - 限制函数调用频率
 * @param func 要节流的函数
 * @param delay 间隔时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(null, args);
    }
  };
}

/**
 * 检测容器尺寸是否发生显著变化
 * @param prev 之前的尺寸
 * @param current 当前的尺寸
 * @param threshold 变化阈值（像素）
 * @returns 是否发生显著变化
 */
export function hasSignificantSizeChange(
  prev: { width: number; height: number },
  current: { width: number; height: number },
  threshold: number = 10
): boolean {
  return (
    Math.abs(prev.width - current.width) > threshold ||
    Math.abs(prev.height - current.height) > threshold
  );
}

/**
 * 获取容器的响应式尺寸配置
 * @param containerWidth 容器宽度
 * @param diagramType 图表类型
 * @returns 响应式配置对象
 */
export function getResponsiveConfig(containerWidth: number, diagramType: string) {
  const baseConfig = {
    padding: Math.max(15, Math.min(containerWidth * 0.025, 35)),
    nodeSpacing: Math.max(40, Math.min(containerWidth * 0.07, 80)),
    rankSpacing: Math.max(50, Math.min(containerWidth * 0.09, 100)),
    fontSize: Math.max(12, Math.min(containerWidth * 0.018, 16)),
    marginX: Math.max(20, Math.min(containerWidth * 0.04, 50)),
    actorMargin: Math.max(30, Math.min(containerWidth * 0.06, 60)),
    actorWidth: Math.max(120, Math.min(containerWidth * 0.18, 200)),
    messageMargin: Math.max(25, Math.min(containerWidth * 0.05, 50)),
  };

  // 根据图表类型调整配置
  switch (diagramType) {
    case 'horizontal-flowchart':
      return {
        ...baseConfig,
        padding: Math.max(20, Math.min(containerWidth * 0.03, 40)),
        nodeSpacing: Math.max(50, Math.min(containerWidth * 0.08, 90)),
        rankSpacing: Math.max(60, Math.min(containerWidth * 0.1, 110)),
      };
    
    case 'sequence':
      return {
        ...baseConfig,
        marginX: Math.max(25, Math.min(containerWidth * 0.05, 60)),
        actorMargin: Math.max(35, Math.min(containerWidth * 0.07, 70)),
      };
    
    case 'gantt':
      return {
        ...baseConfig,
        fontSize: Math.max(10, Math.min(containerWidth * 0.016, 14)),
        sectionFontSize: Math.max(12, Math.min(containerWidth * 0.02, 16)),
      };
    
    default:
      return baseConfig;
  }
}

/**
 * 计算图表的最佳尺寸
 * @param containerWidth 容器宽度
 * @param containerHeight 容器高度
 * @param diagramType 图表类型
 * @returns 最佳尺寸对象
 */
export function calculateOptimalSize(
  containerWidth: number,
  containerHeight: number,
  diagramType: string
): { width: number; height: number } {
  let optimalWidth = containerWidth;
  let optimalHeight = containerHeight;

  switch (diagramType) {
    case 'horizontal-flowchart':
      optimalWidth = Math.min(containerWidth, containerWidth * 0.98);
      optimalHeight = Math.max(containerHeight * 0.7, 500);
      break;
    
    case 'vertical-flowchart':
      optimalWidth = Math.min(containerWidth, 800);
      optimalHeight = Math.max(containerHeight, 600);
      break;
    
    case 'sequence':
      optimalWidth = Math.min(containerWidth, containerWidth * 0.95);
      optimalHeight = Math.max(containerHeight * 0.6, 450);
      break;
    
    case 'gantt':
      optimalWidth = Math.min(containerWidth, containerWidth * 0.9);
      optimalHeight = Math.max(containerHeight * 0.5, 400);
      break;
    
    case 'pie':
      const size = Math.min(containerWidth, containerHeight) * 0.8;
      optimalWidth = size;
      optimalHeight = size;
      break;
    
    default:
      optimalWidth = Math.min(containerWidth, containerWidth * 0.95);
      optimalHeight = Math.max(containerHeight * 0.6, 350);
  }

  return { width: optimalWidth, height: optimalHeight };
}