import { useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import MarkdownIt from 'markdown-it';

const testCode = `function hello(name: string) {
  const greeting = "Hello, " + name;
  console.log(greeting);
  return greeting;
}`;

const testMarkdown = `
\`\`\`javascript
function hello(name) {
  const greeting = "Hello, " + name;
  console.log(greeting);
  return greeting;
}
\`\`\`

\`\`\`python
def hello(name):
    greeting = f"Hello, {name}"
    print(greeting)
    return greeting
\`\`\`
`;

export function TestPage() {
  const [result, setResult] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
    console.log(msg);
  };

  const testPrismDirect = () => {
    addLog('=== 测试 Prism.js 直接调用 ===');
    addLog('Prism.languages.javascript: ' + !!Prism.languages.javascript);
    
    const highlighted = Prism.highlight(testCode, Prism.languages.javascript, 'javascript');
    addLog('高亮结果长度: ' + highlighted.length);
    addLog('高亮结果预览: ' + highlighted.substring(0, 200));
    
    setResult(highlighted);
  };

  const testMarkdownIt = () => {
    addLog('=== 测试 MarkdownIt + Prism.js ===');
    
    let highlightCalled = false;
    
    const md = new MarkdownIt({
      html: false,
      linkify: true,
      highlight: (code, lang) => {
        highlightCalled = true;
        addLog('highlight 被调用! lang: ' + lang + ', code长度: ' + code.length);
        
        if (lang && Prism.languages[lang]) {
          const result = Prism.highlight(code, Prism.languages[lang], lang);
          addLog('Prism.highlight 返回长度: ' + result.length);
          return result;
        }
        return code;
      }
    });
    
    const html = md.render(testMarkdown);
    addLog('MarkdownIt.render 完成');
    addLog('highlight 被调用: ' + highlightCalled);
    addLog('HTML 长度: ' + html.length);
    addLog('HTML 预览: ' + html.substring(0, 500));
    
    setResult(html);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Prism.js 语法高亮测试</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testPrismDirect} style={{ marginRight: '10px', padding: '10px 20px' }}>
          测试 Prism.js 直接调用
        </button>
        <button onClick={testMarkdownIt} style={{ padding: '10px 20px' }}>
          测试 MarkdownIt + Prism.js
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>日志输出:</h3>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>渲染结果:</h3>
        <div 
          style={{ 
            background: '#fff',
            border: '1px solid #ddd',
            padding: '10px',
            borderRadius: '4px'
          }}
          dangerouslySetInnerHTML={{ __html: result }}
        />
      </div>
      
      <div>
        <h3>原始 HTML:</h3>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '10px',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {result}
        </pre>
      </div>
    </div>
  );
}
