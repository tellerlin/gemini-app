import React from 'react';
import { OptimizedMermaidDiagram } from '../components/OptimizedMermaidDiagram';

const testFlowchart = `graph TD
    A["用户"] --> B{"打开购物网站/App"}
    B --> C{"浏览商品"}
    C --> D{"选择商品并加入购物车"}
    D --> E{"确认购物车"}
    E --> F{"登录/注册"}
    F -- 否 --> G["填写收货地址/选择已有地址"]
    G --> H{"选择支付方式"}
    F -- 是 --> H
    H --> I{"完成支付"}
    I --> J["商家处理订单"]
    J --> K["商品出库/发货"]
    K --> L["物流配送"]
    L --> M{"用户收货"}
    M --> N["订单完成/评价"]`;

export function MermaidTestPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        Mermaid 自适应测试页面
      </h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>修复后的优化组件测试</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          该组件已修复无限循环问题，并添加了响应式防抖功能。
        </p>
        
        <OptimizedMermaidDiagram
          code={testFlowchart}
          title="购物流程图 - 修复版本"
          enableExport={true}
        />
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
        <h3>修复内容：</h3>
        <ul style={{ marginTop: '10px' }}>
          <li>✅ 修复了无限循环的状态更新问题</li>
          <li>✅ 添加了防抖机制，避免频繁的resize事件触发</li>
          <li>✅ 优化了尺寸变化检测，只有显著变化才会重新渲染</li>
          <li>✅ 分离了容器尺寸初始化和图表渲染逻辑</li>
          <li>✅ 使用响应式工具函数提高代码复用性</li>
        </ul>
      </div>
    </div>
  );
}