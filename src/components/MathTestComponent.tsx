import React from 'react';
import { ModernMarkdownRenderer } from './ModernMarkdownRenderer';

const testContent = `
# 内联数学公式测试

## 原问题内容测试

**公式组成部分解释（虚构）：**

*   **左侧：**
    *   $$\\frac{\\partial}{\\partial t}$$ 表示对时间 $$t$$ 的偏导数。
    *   $$\\int_{\\Omega} d^3x$$ 在三维空间区域 $$\\Omega$$ 上进行体积积分。
    *   $$\\nabla \\cdot (\\dots)$$ 散度运算符，作用于一个向量场。
    *   $$\\mathbf{A}(x,t)$$ 和 $$\\mathbf{B}(x,t)$$ 两个随空间 $$x$$ 和时间 $$t$$ 变化的向量场。
    *   $$\\times$$ 向量叉乘。
    *   $$\\lambda$$ 一个常数标量。

## 混合内容测试

- 波数 $$k$$ 很重要，但价格$300也很重要。
- 哈密顿算符 $$\\hat{H}$$ 和变量 \`$PATH\` 是不同的概念。
- 这个函数 $$\\mathcal{F}^{-1}\\{\\dots\\}$$ 是逆傅里叶变换，费用是$50。

## 代码测试

\`\`\`bash
export VAR=$HOME/bin
echo "Cost: $price"
\`\`\`
`;

export function MathTestComponent() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">数学公式渲染测试</h1>
      <div className="border border-gray-200 rounded-lg p-4">
        <ModernMarkdownRenderer content={testContent} />
      </div>
    </div>
  );
}