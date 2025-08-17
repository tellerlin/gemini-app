// 存储策略配置
export const STORAGE_STRATEGY = {
  // localStorage - 小数据，快速访问
  localStorage: [
    'gemini-api-keys',           // API密钥
    'current-user',              // 当前用户ID  
    'selected-model',            // 选择的模型
    'default-conversation-config', // 默认对话配置
    'default-image-config',      // 默认图片配置
    'context-config',            // 上下文配置
    'ui-preferences',            // UI偏好
    'performance-settings'       // 性能设置
  ],
  
  // IndexedDB - 大数据，异步处理
  indexedDB: [
    'conversations',             // 对话历史
    'file-attachments',          // 文件附件
    'conversation-exports',      // 导出的对话
    'user-data-backups'         // 用户数据备份
  ]
} as const;

// 数据大小阈值
export const SIZE_THRESHOLDS = {
  localStorage: 1024 * 1024,     // 1MB - localStorage警告阈值
  indexedDB: 100 * 1024 * 1024,  // 100MB - IndexedDB建议清理阈值
} as const;