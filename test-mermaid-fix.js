// Test script to verify Mermaid syntax fixes
const { fixMermaidSyntax } = require('./src/utils/contentParser.ts');

// Test the problematic syntax from the error
const problematicCode = `flowchart TD
    A[开始] -->|>|> B{程序入口: main函数}; 
    B --> C[读取配置文件];
    C --> D{配置是否有效?};`;

console.log('Original code:');
console.log(problematicCode);
console.log('\nFixed code:');
console.log(fixMermaidSyntax(problematicCode));

// Test other edge cases
const edgeCases = [
  'A -->|label>|> B',
  'A -->|>| B',
  'A --> B;',
  'A -- label --> B'
];

edgeCases.forEach((code, index) => {
  console.log(`\nEdge case ${index + 1}:`);
  console.log(`Original: ${code}`);
  console.log(`Fixed: ${fixMermaidSyntax(code)}`);
});