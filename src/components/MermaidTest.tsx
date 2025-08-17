import React from 'react';
import { MermaidDiagram } from './MermaidDiagram';

export function MermaidTest() {
  const testCases = [
    {
      title: '用户登录流程图（原始）- 包含分号和注释',
      code: `graph TD
    A[开始] --> B{用户输入登录信息?};
    B --> C{验证凭据};
    C --> D{凭据有效?};
    D -- 是 --> E[登录成功];
    D -- 否 --> F[显示错误消息];
    F --> B; /* 循环回B，让用户重新尝试 */
    E --> G[结束];`
    },
    {
      title: '用户登录流程图（官方最佳实践修复版）',
      code: `graph TD
    A["开始"] --> B{"用户输入登录信息?"}
    B --> C{"验证凭据"}
    C --> D{"凭据有效?"}
    D -- 是 --> E["登录成功"]
    D -- 否 --> F["显示错误消息"]
    F --> B
    E --> G["结束"]`
    },
    {
      title: '用户最新的美人鱼流程图（原始）- 深海守护者',
      code: `graph TD
    A[美人鱼诞生] --> B{探索浅水区}
    B -- 学习捕食 --> C[掌握生存技能]
    C --> D{好奇深海世界}
    D -- 独自探险 --> E[发现古老遗迹]
    E --> F[与深海生物交流]
    F --> G[成为深海守护者]`
    },
    {
      title: '用户最新的美人鱼流程图（官方最佳实践修复版）',
      code: `graph TD
    A["美人鱼诞生"] --> B{"探索浅水区"}
    B -- 学习捕食 --> C["掌握生存技能"]
    C --> D{"好奇深海世界"}
    D -- 独自探险 --> E["发现古老遗迹"]
    E --> F["与深海生物交流"]
    F --> G["成为深海守护者"]`
    },
    {
      title: '用户第二个美人鱼流程图（原始）',
      code: `graph TD
    A[出生] --> B{学习与成长}
    B --> C[探索海洋]
    C --> D{发现新朋友}
    D --> E[享受生活]
    E --> F[持续学习]
    F --> C`
    },
    {
      title: '用户第二个美人鱼流程图（官方最佳实践修复版）',
      code: `graph TD
    A["出生"] --> B{"学习与成长"}
    B --> C["探索海洋"]
    C --> D{"发现新朋友"}
    D --> E["享受生活"]
    E --> F["持续学习"]
    F --> C`
    },
    {
      title: '用户第一个美人鱼流程图（原始）',
      code: `graph TD
    A[美人鱼出生] --> B{探索海洋}
    B --> C{学习魔法}
    C --> D{寻找真爱}
    D --> E[成为海洋女王]`
    },
    {
      title: '用户第一个美人鱼流程图（官方最佳实践修复版）',
      code: `graph TD
    A["美人鱼出生"] --> B{"探索海洋"}
    B --> C{"学习魔法"}
    C --> D{"寻找真爱"}
    D --> E["成为海洋女王"]`
    },
    {
      title: '简单测试流程图',
      code: `graph TD
    A["开始"] --> B["处理"]
    B --> C{"判断"}
    C -->|是| D["成功"]
    C -->|否| E["失败"]
    D --> F["结束"]
    E --> F`
    }
  ];

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold text-gray-800">🧜‍♀️ Mermaid 渲染测试 - 基于官方最佳实践</h1>
      <p className="text-gray-600">
        基于对Mermaid.js GitHub issues的研究，使用官方推荐的双引号包装方法修复中文字符渲染问题。
        不再使用复杂的正则表达式处理，而是采用简单可靠的官方解决方案。
      </p>
      
      {testCases.map((testCase, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            测试 {index + 1}: {testCase.title}
          </h2>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">源代码:</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {testCase.code}
            </pre>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">渲染结果:</h3>
            <MermaidDiagram 
              code={testCase.code} 
              title={testCase.title}
            />
          </div>
        </div>
      ))}
      
      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-lg font-semibold text-green-800 mb-2">✅ 官方最佳实践方法 v3.0</h2>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• <strong>双引号包装</strong> - 官方推荐的解决方案，基于GitHub issues #687, #1925, #5597</li>
          <li>• <strong>注释移除</strong> - 移除 /* */ 和 // 注释，避免解析错误</li>
          <li>• <strong>分号清理</strong> - 移除行尾分号，这些会导致Mermaid解析失败</li>
          <li>• <strong>中文标点转换</strong> - 将中文标点符号（？：，。）转换为ASCII等价物</li>
          <li>• <strong>保持原有格式</strong> - 不破坏已经正确的语法</li>
          <li>• <strong>基于研究</strong> - 通过研究Mermaid.js社区找到的官方解决方案</li>
        </ul>
      </div>
      
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">🔧 新增修复功能</h2>
        <p className="text-sm text-yellow-700 mb-2">
          基于用户反馈，新增处理常见Mermaid语法问题：
        </p>
        <ul className="text-xs text-yellow-600 space-y-1">
          <li>• 处理行尾分号：<code>B&#123;用户输入登录信息?&#125;;</code> → <code>B&#123;"用户输入登录信息?"&#125;</code></li>
          <li>• 移除注释：<code>/* 循环回B，让用户重新尝试 */</code> → 完全移除</li>
          <li>• 中文标点：<code>登录信息？</code> → <code>登录信息?</code></li>
        </ul>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">🔍 研究发现</h2>
        <p className="text-sm text-blue-700 mb-2">
          通过搜索Mermaid.js的GitHub issues，发现官方推荐的解决方案是使用双引号包装所有包含中文字符的文本。
          这比复杂的正则表达式处理更可靠，也是社区验证过的最佳实践。
        </p>
        <p className="text-xs text-blue-600">
          参考: GitHub issues #687 (中文标点符号支持), #1925 (中文字符支持), #5597 (中文支持请求)
        </p>
      </div>
    </div>
  );
}