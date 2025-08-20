import React, { useState } from 'react';
import { OptimizedMermaidDiagram } from '../components/OptimizedMermaidDiagram';

const testDiagrams = {
  flowchart: `flowchart TD
    A[开始] --> B{是否登录?}
    B -->|是| C[显示主页面]
    B -->|否| D[显示登录页面]
    C --> E[用户操作]
    D --> F[用户登录]
    F --> C
    E --> G{需要更多操作?}
    G -->|是| E
    G -->|否| H[结束]`,
    
  horizontalFlowchart: `flowchart LR
    A[用户请求] --> B[API网关]
    B --> C[身份验证]
    C --> D[业务逻辑]
    D --> E[数据库]
    E --> F[返回结果]
    F --> G[响应处理]
    G --> H[返回用户]`,
    
  sequence: `sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant A as API服务器
    participant D as 数据库
    
    U->>F: 登录请求
    F->>A: 验证凭据
    A->>D: 查询用户信息
    D-->>A: 返回用户数据
    A-->>F: 返回JWT令牌
    F-->>U: 登录成功`,
    
  gantt: `gantt
    title 项目开发计划
    dateFormat  YYYY-MM-DD
    section 设计阶段
    需求分析           :a1, 2024-01-01, 30d
    UI/UX设计         :a2, after a1, 20d
    section 开发阶段
    前端开发          :b1, 2024-02-01, 45d
    后端开发          :b2, 2024-02-01, 45d
    section 测试阶段
    单元测试          :c1, after b1, 15d
    集成测试          :c2, after b2, 15d`,
    
  pie: `pie title 技术栈使用比例
    "React" : 35
    "Node.js" : 25
    "Python" : 20
    "TypeScript" : 15
    "其他" : 5`
};

export function MermaidResponsiveDemo() {
  const [selectedDiagram, setSelectedDiagram] = useState<keyof typeof testDiagrams>('flowchart');
  const [containerWidth, setContainerWidth] = useState('100%');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mermaid 自适应图表演示</h1>
      
      {/* 控制面板 */}
      <div className="mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">选择图表类型:</label>
          <select 
            value={selectedDiagram}
            onChange={(e) => setSelectedDiagram(e.target.value as keyof typeof testDiagrams)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="flowchart">垂直流程图</option>
            <option value="horizontalFlowchart">水平流程图</option>
            <option value="sequence">时序图</option>
            <option value="gantt">甘特图</option>
            <option value="pie">饼图</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">容器宽度测试:</label>
          <div className="flex space-x-2">
            {['100%', '80%', '60%', '40%'].map(width => (
              <button
                key={width}
                onClick={() => setContainerWidth(width)}
                className={`px-4 py-2 rounded-md border ${
                  containerWidth === width 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {width}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 图表展示区域 */}
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">OptimizedMermaidDiagram 组件</h2>
          <div 
            className="border border-gray-200 rounded-lg p-4 transition-all duration-300"
            style={{ width: containerWidth }}
          >
            <OptimizedMermaidDiagram
              code={testDiagrams[selectedDiagram]}
              title={`${selectedDiagram} 示例`}
              enableExport={true}
            />
          </div>
        </div>

        {/* 代码展示 */}
        <div>
          <h3 className="text-lg font-medium mb-2">Mermaid 代码:</h3>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{testDiagrams[selectedDiagram]}</code>
          </pre>
        </div>

        {/* 响应式说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-3">自适应特性说明:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><strong>智能尺寸调整:</strong> 图表会根据容器大小自动调整尺寸和字体大小</li>
            <li><strong>响应式设计:</strong> 支持窗口大小变化时自动重新渲染</li>
            <li><strong>类型优化:</strong> 不同图表类型有专门的尺寸优化策略</li>
            <li><strong>缩放功能:</strong> 用户可以手动调整图表的缩放比例</li>
            <li><strong>移动端适配:</strong> 在小屏幕设备上有特殊的字体和间距优化</li>
            <li><strong>性能优化:</strong> 使用 useLayoutEffect 和防抖机制避免频繁重渲染</li>
          </ul>
        </div>
      </div>
    </div>
  );
}