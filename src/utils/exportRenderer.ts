import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Conversation, Message } from '../types/chat';

// Server-side safe Markdown renderer for export
function ExportMarkdownRenderer({ content }: { content: string }) {
  // Simple but effective content processing that mirrors ModernMarkdownRenderer logic
  const processContent = (text: string) => {
    // Handle Mermaid diagrams - convert to placeholder that will be replaced
    const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
    let processed = text.replace(mermaidRegex, (match, code) => {
      // Basic validation to avoid rendering invalid diagrams
      const trimmedCode = code.trim();
      if (!trimmedCode || 
          (trimmedCode.includes('title:') && trimmedCode.includes('column_') && trimmedCode.includes('row_'))) {
        // Skip invalid or table-like structures
        return `<div class="invalid-diagram">Invalid diagram format (possibly a table): <pre>${escapeHtml(trimmedCode)}</pre></div>`;
      }
      return `<div class="mermaid-diagram" data-diagram="${encodeURIComponent(trimmedCode)}">${trimmedCode}</div>`;
    });

    // Handle code blocks with syntax highlighting placeholder
    processed = processed.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
      const language = lang || 'text';
      return `<pre class="code-block" data-language="${language}"><code>${escapeHtml(code.trim())}</code></pre>`;
    });

    // Handle inline code
    processed = processed.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Handle math expressions
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, '<div class="math-block">$$1$</div>');
    processed = processed.replace(/\$([^$]+)\$/g, '<span class="math-inline">$1$</span>');

    // Handle markdown formatting
    processed = processed
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Handle markdown tables with proper parsing
    processed = parseMarkdownTables(processed);

    return processed;
  };

  const processedContent = processContent(content);
  
  return React.createElement('div', {
    className: 'message-content',
    dangerouslySetInnerHTML: { __html: `<p>${processedContent}</p>` }
  });
}

// Message component for export
function ExportMessage({ message }: { message: Message }) {
  const timestamp = new Date(message.timestamp).toLocaleString();
  const role = message.role === 'user' ? 'User' : 'Assistant';
  const roleClass = message.role === 'user' ? 'user-message' : 'assistant-message';

  return React.createElement('div', {
    className: `message ${roleClass}`,
    children: [
      React.createElement('div', {
        key: 'header',
        className: 'message-header',
        children: [
          React.createElement('span', { key: 'role', className: 'role' }, role),
          React.createElement('span', { key: 'timestamp', className: 'timestamp' }, timestamp)
        ]
      }),
      React.createElement(ExportMarkdownRenderer, {
        key: 'content',
        content: message.content
      })
    ]
  });
}

// Main export document component
function ExportDocument({ conversation }: { conversation: Conversation }) {
  return React.createElement('html', {
    lang: 'zh-CN',
    children: [
      React.createElement('head', {
        key: 'head',
        children: [
          React.createElement('meta', { key: 'charset', charSet: 'UTF-8' }),
          React.createElement('meta', { 
            key: 'viewport', 
            name: 'viewport', 
            content: 'width=device-width, initial-scale=1.0' 
          }),
          React.createElement('title', { key: 'title' }, conversation.title),
          React.createElement('script', {
            key: 'mermaid',
            src: 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
          }),
          React.createElement('script', {
            key: 'katex',
            src: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js'
          }),
          React.createElement('link', {
            key: 'katex-css',
            rel: 'stylesheet',
            href: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css'
          }),
          React.createElement('script', {
            key: 'prism',
            src: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js'
          }),
          React.createElement('script', {
            key: 'prism-autoloader',
            src: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js'
          }),
          React.createElement('link', {
            key: 'prism-css',
            rel: 'stylesheet',
            href: 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css'
          }),
          React.createElement('style', {
            key: 'styles',
            dangerouslySetInnerHTML: { __html: getExportStyles() }
          })
        ]
      }),
      React.createElement('body', {
        key: 'body',
        children: [
          React.createElement('div', {
            key: 'header',
            className: 'header',
            children: [
              React.createElement('h1', { key: 'title' }, conversation.title),
              React.createElement('div', {
                key: 'meta',
                className: 'meta',
                children: [
                  React.createElement('div', { key: 'created' }, `Created: ${new Date(conversation.createdAt).toLocaleString()}`),
                  React.createElement('div', { key: 'updated' }, `Updated: ${new Date(conversation.updatedAt).toLocaleString()}`),
                  React.createElement('div', { key: 'model' }, `Model: ${conversation.model}`)
                ]
              })
            ]
          }),
          React.createElement('div', {
            key: 'conversation',
            className: 'conversation',
            children: conversation.messages.map((message, index) =>
              React.createElement(ExportMessage, { key: index, message })
            )
          }),
          React.createElement('script', {
            key: 'init-script',
            dangerouslySetInnerHTML: { __html: getInitScript() }
          })
        ]
      })
    ]
  });
}

function parseMarkdownTables(content: string): string {
  // Better regex to match complete markdown tables
  const tableRegex = /(\|[^\r\n]*\|[\r\n]+\|[-\s:|]*\|[\r\n]+((\|[^\r\n]*\|[\r\n]*)+))/g;
  
  return content.replace(tableRegex, (match) => {
    const lines = match.trim().split(/[\r\n]+/).filter(line => line.trim() && line.includes('|'));
    
    if (lines.length < 3) return match; // Need at least header, separator, and one data row
    
    const headerLine = lines[0];
    const separatorLine = lines[1];
    const dataLines = lines.slice(2);
    
    // Parse header
    const headers = headerLine.split('|')
      .slice(1, -1) // Remove first and last empty elements
      .map(cell => cell.trim())
      .filter(cell => cell);
    
    if (headers.length === 0) return match;
    
    // Parse alignment from separator line
    const alignments = separatorLine.split('|')
      .slice(1, -1)
      .map(cell => {
        const trimmed = cell.trim();
        if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
        if (trimmed.endsWith(':')) return 'right';
        return 'left';
      });
    
    // Parse data rows
    const rows = dataLines.map(line => {
      return line.split('|')
        .slice(1, -1) // Remove first and last empty elements
        .map(cell => cell.trim());
    }).filter(row => row.length > 0);
    
    // Generate HTML table
    let tableHtml = '<table class="markdown-table">';
    
    // Header
    tableHtml += '<thead><tr>';
    headers.forEach((header, index) => {
      const align = alignments[index] || 'left';
      tableHtml += `<th style="text-align: ${align}">${escapeHtml(header)}</th>`;
    });
    tableHtml += '</tr></thead>';
    
    // Body
    if (rows.length > 0) {
      tableHtml += '<tbody>';
      rows.forEach(row => {
        tableHtml += '<tr>';
        headers.forEach((_, index) => {
          const cell = row[index] || '';
          const align = alignments[index] || 'left';
          tableHtml += `<td style="text-align: ${align}">${escapeHtml(cell)}</td>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody>';
    }
    
    tableHtml += '</table>';
    return tableHtml;
  });
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getExportStyles(): string {
  return `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 2em;
    }
    .header .meta {
      opacity: 0.9;
      font-size: 0.9em;
    }
    .conversation {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .message {
      margin-bottom: 25px;
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #e0e0e0;
    }
    .user-message {
      background-color: #f0f9ff;
      border-left-color: #3b82f6;
    }
    .assistant-message {
      background-color: #f9fafb;
      border-left-color: #10b981;
    }
    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 0.9em;
    }
    .role {
      font-weight: 600;
      color: #374151;
    }
    .timestamp {
      color: #6b7280;
    }
    .message-content {
      font-size: 1em;
      line-height: 1.7;
    }
    .message-content p {
      margin: 0 0 12px 0;
    }
    .message-content p:last-child {
      margin-bottom: 0;
    }
    .inline-code {
      background-color: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.9em;
    }
    .code-block {
      background-color: #1f2937;
      color: #f9fafb;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 12px 0;
    }
    .code-block code {
      background: none;
      padding: 0;
      color: inherit;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }
    .mermaid-diagram {
      margin: 20px 0;
      padding: 20px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      text-align: center;
    }
    .invalid-diagram {
      margin: 20px 0;
      padding: 20px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #dc2626;
    }
    .invalid-diagram pre {
      background: #fee2e2;
      padding: 10px;
      border-radius: 4px;
      margin: 10px 0;
      overflow-x: auto;
    }
    .math-block {
      margin: 16px 0;
      text-align: center;
      font-size: 1.1em;
    }
    .math-inline {
      font-size: 1em;
    }
    strong {
      font-weight: 600;
      color: #111827;
    }
    em {
      font-style: italic;
      color: #374151;
    }
    table, .markdown-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 0.9em;
    }
    td, th {
      border: 1px solid #e5e7eb;
      padding: 8px 12px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    .markdown-table tbody tr:nth-child(even) {
      background-color: #fafafa;
    }
    .markdown-table tbody tr:hover {
      background-color: #f0f9ff;
    }
    @media print {
      body {
        background-color: white;
      }
      .header {
        background: #667eea !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `;
}

function getInitScript(): string {
  return `
    // Initialize Mermaid diagrams
    document.addEventListener('DOMContentLoaded', function() {
      // Configure Mermaid
      if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: '"Noto Sans CJK SC", "Microsoft YaHei", "SimHei", sans-serif'
        });

        // Render Mermaid diagrams
        const diagrams = document.querySelectorAll('.mermaid-diagram');
        diagrams.forEach(async (element, index) => {
          try {
            const code = decodeURIComponent(element.getAttribute('data-diagram'));
            const elementId = 'mermaid-' + index;
            const { svg } = await mermaid.render(elementId, code);
            element.innerHTML = svg;
          } catch (error) {
            console.error('Mermaid rendering error:', error);
            element.innerHTML = '<div style="color: red; padding: 10px;">图表渲染失败: ' + error.message + '</div>';
          }
        });
      }

      // Initialize KaTeX math rendering
      if (typeof katex !== 'undefined') {
        const mathBlocks = document.querySelectorAll('.math-block');
        mathBlocks.forEach(block => {
          try {
            const math = block.textContent.replace(/^\$+|\$+$/g, '');
            katex.render(math, block, { displayMode: true });
          } catch (error) {
            console.error('KaTeX rendering error:', error);
          }
        });

        const mathInlines = document.querySelectorAll('.math-inline');
        mathInlines.forEach(inline => {
          try {
            const math = inline.textContent.replace(/^\$+|\$+$/g, '');
            katex.render(math, inline, { displayMode: false });
          } catch (error) {
            console.error('KaTeX rendering error:', error);
          }
        });
      }

      // Initialize Prism syntax highlighting
      if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
      }
    });
  `;
}

// Enhanced export function that renders React components to static HTML
export function generateAdvancedHTMLExport(conversation: Conversation): string {
  try {
    const documentElement = React.createElement(ExportDocument, { conversation });
    const htmlString = renderToStaticMarkup(documentElement);
    return '<!DOCTYPE html>' + htmlString;
  } catch (error) {
    console.error('Export rendering error:', error);
    // Fallback to simple export
    return generateSimpleHTMLExport(conversation);
  }
}

// Fallback simple export function
function generateSimpleHTMLExport(conversation: Conversation): string {
  const htmlContent = conversation.messages.map(message => {
    const timestamp = new Date(message.timestamp).toLocaleString();
    const role = message.role === 'user' ? 'User' : 'Assistant';
    const roleClass = message.role === 'user' ? 'user-message' : 'assistant-message';
    
    return `
      <div class="message ${roleClass}">
        <div class="message-header">
          <span class="role">${role}</span>
          <span class="timestamp">${timestamp}</span>
        </div>
        <div class="message-content">
          <p>${escapeHtml(message.content).replace(/\n/g, '<br>')}</p>
        </div>
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(conversation.title)}</title>
    <style>${getExportStyles()}</style>
</head>
<body>
    <div class="header">
        <h1>${escapeHtml(conversation.title)}</h1>
        <div class="meta">
            <div>Created: ${new Date(conversation.createdAt).toLocaleString()}</div>
            <div>Updated: ${new Date(conversation.updatedAt).toLocaleString()}</div>
            <div>Model: ${conversation.model}</div>
        </div>
    </div>
    <div class="conversation">
        ${htmlContent}
    </div>
</body>
</html>
  `.trim();
}