import React from 'react';
import { ModernMarkdownRenderer } from './ModernMarkdownRenderer';

const tableMarkdown = `# 表格渲染测试

以下表格应该正常渲染：

| 姓名   | 年龄 | 城市     | 职业   | 电子邮件           |
| :----- | :--- | :------- | :----- | :----------------- |
| 张三   | 30   | 北京     | 工程师 | zhangsan@example.com |
| 李四   | 25   | 上海     | 设计师 | lisi@example.com   |
| 王五   | 35   | 广州     | 教师   | wangwu@example.com |
| 赵六   | 28   | 深圳     | 医生   | zhaoliu@example.com |
| 钱七   | 42   | 成都     | 销售   | qianqi@example.com |

这个表格应该有正确的边框、标题样式和间距。

## 另一个测试表格

| Name | Score | Grade |
|------|-------|-------|
| Alice | 95 | A |
| Bob | 87 | B |
| Carol | 92 | A |
`;

export function TableTestComponent() {
  return (
    <div className="p-6 max-w-4xl mx-auto bg-white">
      <h1 className="text-2xl font-bold mb-4">表格渲染测试</h1>
      <ModernMarkdownRenderer content={tableMarkdown} />
    </div>
  );
}