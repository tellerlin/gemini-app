export function fixMermaidSyntax(mermaidCode: string): string {
  // Fix common Chinese syntax issues in Mermaid diagrams
  let fixed = mermaidCode;
  
  // Fix invalid |>|> syntax - replace with proper arrow syntax
  fixed = fixed.replace(/\|\>\|\>/g, '-->');
  
  // Fix standalone pipe symbols that should be arrows
  fixed = fixed.replace(/\s+\|\s+/g, ' --> ');
  fixed = fixed.replace(/\|\s+([A-Z])/g, '--> $1');
  fixed = fixed.replace(/([A-Z])\s+\|/g, '$1 -->');
  
  // Fix malformed edge labels with angle brackets
  fixed = fixed.replace(/-->\|([^|]*?)>\|>/g, '-->|$1|');
  fixed = fixed.replace(/-->\|>\s+/g, '--> ');
  
  // Replace "-- text -->" with "-->|text|" format for Chinese labels
  fixed = fixed.replace(/--\s*([^-]+?)\s*-->/g, '-->|$1|');
  
  // Remove extra parentheses from decision node labels that cause parsing issues
  fixed = fixed.replace(/\{([^{}]*?)\s*\([^)]*?\)\s*\}/g, '{$1}');
  
  // Clean up malformed arrow syntax
  fixed = fixed.replace(/-->\|\>\|/g, '-->');
  fixed = fixed.replace(/-->\|([^|]*?)\|\>/g, '-->|$1|');
  
  // Fix arrows that end with |> instead of proper syntax
  fixed = fixed.replace(/-->\|\>/g, '-->');
  
  // Ensure proper spacing around arrows
  fixed = fixed.replace(/(\w+)\s*-->\s*(\w+)/g, '$1 --> $2');
  fixed = fixed.replace(/(\w+)\s*-->\|([^|]+?)\|\s*(\w+)/g, '$1 -->|$2| $3');
  
  // Remove trailing semicolons which can cause issues
  fixed = fixed.replace(/;\s*$/gm, '');
  
  return fixed.trim();
}

export interface ParsedSection {
  type: 'text' | 'mermaid' | 'table' | 'chart' | 'math' | 'code';
  content: string | TableRow[] | ChartDataPoint[];
  config?: SectionConfig;
  startIndex: number;
  endIndex: number;
}

export interface SectionConfig {
  headers?: string[];
  type?: string;
  language?: string;
  displayMode?: 'block' | 'inline';
  xAxis?: string;
  yAxis?: string;
  series?: ChartSeries[];
  title?: string;
  height?: number;
  width?: number;
}

export interface TableRow {
  [key: string]: string | number | boolean;
}

export interface TableData {
  headers: string[];
  data: TableRow[];
}

export interface ChartDataPoint {
  [key: string]: string | number | undefined;
}

export interface ChartSeries {
  name: string;
  dataKey: string;
  color?: string;
  type?: 'line' | 'bar' | 'area';
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area' | 'radar' | 'composed' | 'scatter';
  data: ChartDataPoint[];
  config: {
    xAxis?: string;
    yAxis?: string;
    series?: ChartSeries[];
    title?: string;
    height?: number;
    width?: number;
  };
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

  // Parse charts
  const chartRegex = /```chart\n([\s\S]*?)\n```/g;
  while ((match = chartRegex.exec(content)) !== null) {
    // Add text before chart
    if (match.index > currentIndex) {
      sections.push({
        type: 'text',
        content: content.slice(currentIndex, match.index),
        startIndex: currentIndex,
        endIndex: match.index
      });
    }

    try {
      const chartData = JSON.parse(match[1]) as ChartData;
      sections.push({
        type: 'chart',
        content: chartData.data,
        config: { type: chartData.type, ...chartData.config },
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    } catch (e) {
      console.error('Failed to parse chart data:', e);
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

  // Parse code blocks (excluding mermaid, table, chart)
  const codeRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
  while ((match = codeRegex.exec(content)) !== null) {
    // Skip if already processed as mermaid, table, or chart
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
  hasCharts: boolean;
  hasMath: boolean;
  hasCode: boolean;
} {
  return {
    hasDiagrams: sections.some(s => s.type === 'mermaid'),
    hasTables: sections.some(s => s.type === 'table'),
    hasCharts: sections.some(s => s.type === 'chart'),
    hasMath: sections.some(s => s.type === 'math'),
    hasCode: sections.some(s => s.type === 'code'),
  };
} 