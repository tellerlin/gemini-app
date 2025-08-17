export function fixMermaidSyntax(mermaidCode: string): string {
  // Fix Chinese characters in Mermaid diagrams using official best practices
  // Based on GitHub issues: #687, #1925, #5597 - the solution is double quotes
  
  let fixed = mermaidCode.trim();
  
  // Early return if empty
  if (!fixed) return fixed;
  
  console.log('Fixing Mermaid syntax using official best practices, input:', fixed);
  
  // Check if code is already properly formatted to avoid double-processing
  if (fixed.includes('["') && fixed.includes('{"') && !fixed.includes(';')) {
    console.log('Mermaid code appears already fixed, returning as-is');
    return fixed;
  }
  
  // First, remove comments and clean up the code
  // Remove block comments /* ... */
  fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove line comments // ...
  fixed = fixed.replace(/\/\/.*$/gm, '');
  
  // Fix each line independently
  const lines = fixed.split('\n');
  const processedLines = lines.map(line => {
    const trimmedLine = line.trim();
    
    // Skip empty lines, graph declarations, style statements, and accessibility statements
    if (!trimmedLine || 
        trimmedLine.startsWith('graph ') || 
        trimmedLine.startsWith('flowchart ') ||
        trimmedLine.startsWith('style ') ||
        trimmedLine.startsWith('accTitle:') ||
        trimmedLine.startsWith('accDescr:')) {
      return trimmedLine;
    }
    
    let processedLine = trimmedLine;
    
    // Remove trailing semicolons which cause parsing issues
    processedLine = processedLine.replace(/;+$/g, '');
    
    // Fix Chinese punctuation marks that cause issues
    processedLine = processedLine.replace(/？/g, '?'); // Chinese question mark to ASCII
    processedLine = processedLine.replace(/：/g, ':'); // Chinese colon to ASCII
    processedLine = processedLine.replace(/，/g, ','); // Chinese comma to ASCII
    processedLine = processedLine.replace(/。/g, '.'); // Chinese period to ASCII
    
    // The key fix: wrap any text containing Chinese characters in double quotes
    // This handles ALL Chinese character issues according to official docs
    
    // Pattern for node definitions with Chinese characters: A[中文] -> A["中文"]
    processedLine = processedLine.replace(
      /([A-Za-z0-9_]+)\[([^\]]*[\u4e00-\u9fff][^\]]*)\]/g, 
      (match, nodeId, text) => {
        // Only add quotes if not already quoted
        if (text.startsWith('"') && text.endsWith('"')) {
          return match; // Already quoted
        }
        return `${nodeId}["${text}"]`;
      }
    );
    
    // Pattern for decision nodes: A{中文} -> A{"中文"}
    processedLine = processedLine.replace(
      /([A-Za-z0-9_]+)\{([^}]*[\u4e00-\u9fff][^}]*)\}/g, 
      (match, nodeId, text) => {
        // Only add quotes if not already quoted
        if (text.startsWith('"') && text.endsWith('"')) {
          return match; // Already quoted
        }
        return `${nodeId}{"${text}"}`;
      }
    );
    
    // Pattern for round nodes: A(中文) -> A("中文")
    processedLine = processedLine.replace(
      /([A-Za-z0-9_]+)\(([^)]*[\u4e00-\u9fff][^)]*)\)/g, 
      (match, nodeId, text) => {
        // Only add quotes if not already quoted
        if (text.startsWith('"') && text.endsWith('"')) {
          return match; // Already quoted
        }
        return `${nodeId}("${text}")`;
      }
    );
    
    // Clean up any remaining whitespace issues
    processedLine = processedLine.replace(/\s+/g, ' ').trim();
    
    return processedLine;
  });
  
  const result = processedLines.filter(line => line.length > 0).join('\n');
  console.log('Fixed Mermaid syntax using official best practices, output:', result);
  
  return result;
}

export interface ParsedSection {
  type: 'text' | 'mermaid' | 'table' | 'math' | 'code';
  content: string | TableRow[];
  config?: SectionConfig;
  startIndex: number;
  endIndex: number;
}

export interface SectionConfig {
  headers?: string[];
  type?: string;
  language?: string;
  displayMode?: 'block' | 'inline';
}

export interface TableRow {
  [key: string]: string | number | boolean;
}

export interface TableData {
  headers: string[];
  data: TableRow[];
}


export function parseAIContent(content: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  let currentIndex = 0;

  // Parse Mermaid diagrams
  const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
  let match;
  while ((match = mermaidRegex.exec(content)) !== null) {
    // Add text before mermaid
    if (match.index > currentIndex) {
      sections.push({
        type: 'text',
        content: content.slice(currentIndex, match.index),
        startIndex: currentIndex,
        endIndex: match.index
      });
    }

    sections.push({
      type: 'mermaid',
      content: fixMermaidSyntax(match[1].trim()),
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });

    currentIndex = match.index + match[0].length;
  }

  // Parse tables (CSV format)
  const tableRegex = /```table\n([\s\S]*?)\n```/g;
  while ((match = tableRegex.exec(content)) !== null) {
    // Add text before table
    if (match.index > currentIndex) {
      sections.push({
        type: 'text',
        content: content.slice(currentIndex, match.index),
        startIndex: currentIndex,
        endIndex: match.index
      });
    }

    try {
      const tableData = JSON.parse(match[1]) as TableData;
      sections.push({
        type: 'table',
        content: tableData.data,
        config: { headers: tableData.headers },
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    } catch (e) {
      console.error('Failed to parse table data:', e);
      // Fallback to text
      sections.push({
        type: 'text',
        content: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }

    currentIndex = match.index + match[0].length;
  }


  // Parse code blocks (excluding mermaid, table)
  const codeRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
  while ((match = codeRegex.exec(content)) !== null) {
    // Skip if already processed as mermaid or table
    const isProcessed = sections.some(section => 
      section.startIndex === match.index && section.endIndex === match.index + match[0].length
    );
    
    if (!isProcessed) {
      // Add text before code
      if (match.index > currentIndex) {
        sections.push({
          type: 'text',
          content: content.slice(currentIndex, match.index),
          startIndex: currentIndex,
          endIndex: match.index
        });
      }

      sections.push({
        type: 'code',
        content: match[2],
        config: { language: match[1] || 'text' },
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });

      currentIndex = match.index + match[0].length;
    }
  }

  // Parse math expressions (block)
  const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;
  while ((match = blockMathRegex.exec(content)) !== null) {
    // Add text before math
    if (match.index > currentIndex) {
      sections.push({
        type: 'text',
        content: content.slice(currentIndex, match.index),
        startIndex: currentIndex,
        endIndex: match.index
      });
    }

    sections.push({
      type: 'math',
      content: match[1].trim(),
      config: { displayMode: 'block' },
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });

    currentIndex = match.index + match[0].length;
  }

  // Parse inline math expressions
  const inlineMathRegex = /\$([^$\n]+?)\$/g;
  while ((match = inlineMathRegex.exec(content)) !== null) {
    // Add text before math
    if (match.index > currentIndex) {
      sections.push({
        type: 'text',
        content: content.slice(currentIndex, match.index),
        startIndex: currentIndex,
        endIndex: match.index
      });
    }

    sections.push({
      type: 'math',
      content: match[1].trim(),
      config: { displayMode: 'inline' },
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });

    currentIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (currentIndex < content.length) {
    sections.push({
      type: 'text',
      content: content.slice(currentIndex),
      startIndex: currentIndex,
      endIndex: content.length
    });
  }

  return sections;
}

export function extractTextContent(sections: ParsedSection[]): string {
  return sections
    .filter(section => section.type === 'text')
    .map(section => {
      if (typeof section.content === 'string') {
        return section.content;
      }
      return '';
    })
    .join('\n\n');
}

export function hasRichContent(sections: ParsedSection[]): boolean {
  return sections.some(section => section.type !== 'text');
}

export function getContentSummary(sections: ParsedSection[]): {
  hasDiagrams: boolean;
  hasTables: boolean;
  hasMath: boolean;
  hasCode: boolean;
} {
  return {
    hasDiagrams: sections.some(s => s.type === 'mermaid'),
    hasTables: sections.some(s => s.type === 'table'),
    hasMath: sections.some(s => s.type === 'math'),
    hasCode: sections.some(s => s.type === 'code'),
  };
} 