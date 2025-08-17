// Test script to verify Mermaid syntax fixes  
import { fixMermaidSyntax } from './src/utils/contentParser.js';

// Test cases from user's examples
const testCases = [
  {
    name: '用户登录流程图（原始）- 包含分号和注释',
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
    name: '美人鱼流程图（原始）- 深海守护者',
    code: `graph TD
    A[美人鱼诞生] --> B{探索浅水区}
    B -- 学习捕食 --> C[掌握生存技能]
    C --> D{好奇深海世界}
    D -- 独自探险 --> E[发现古老遗迹]
    E --> F[与深海生物交流]
    F --> G[成为深海守护者]`
  },
  {
    name: '简单中文测试',
    code: `graph TD
    A[开始] --> B{判断？}
    B --> C[结束：成功]`
  }
];

console.log('🧜‍♀️ Testing Mermaid Syntax Fix Function\n');
console.log('='.repeat(60));

testCases.forEach((testCase, index) => {
  console.log(`\n📝 Test ${index + 1}: ${testCase.name}`);
  console.log('-'.repeat(40));
  
  console.log('\n🔴 Original:');
  console.log(testCase.code);
  
  const fixed = fixMermaidSyntax(testCase.code);
  console.log('\n🟢 Fixed:');
  console.log(fixed);
  
  console.log('\n📊 Analysis:');
  const originalLines = testCase.code.split('\n').length;
  const fixedLines = fixed.split('\n').length;
  const hasChinese = /[\u4e00-\u9fff]/.test(testCase.code);
  const hasQuotes = fixed.includes('"');
  const hasSemicolons = testCase.code.includes(';');
  const hasComments = testCase.code.includes('/*') || testCase.code.includes('//');
  
  console.log(`  • Contains Chinese: ${hasChinese ? '✅' : '❌'}`);
  console.log(`  • Added quotes: ${hasQuotes ? '✅' : '❌'}`);
  console.log(`  • Original had semicolons: ${hasSemicolons ? '✅' : '❌'}`);
  console.log(`  • Original had comments: ${hasComments ? '✅' : '❌'}`);
  console.log(`  • Lines: ${originalLines} → ${fixedLines}`);
  
  console.log('\n' + '='.repeat(60));
});

console.log('\n✅ All tests completed! Check the output above to verify fixes.');