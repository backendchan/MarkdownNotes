import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import Prism from 'prismjs';

import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-css-extras';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-nginx';
import 'prismjs/components/prism-xml-doc';

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: (code: string, lang: string): string => {
    if (lang && Prism.languages[lang]) {
      try {
        return Prism.highlight(code, Prism.languages[lang], lang);
      } catch {
        return escapeHtml(code);
      }
    }
    
    if (lang) {
      const aliases: Record<string, string> = {
        js: 'javascript',
        ts: 'typescript',
        sh: 'bash',
        shell: 'bash',
        yml: 'yaml',
        md: 'markdown',
        dockerfile: 'docker',
      };
      const resolvedLang = aliases[lang.toLowerCase()];
      if (resolvedLang && Prism.languages[resolvedLang]) {
        try {
          return Prism.highlight(code, Prism.languages[resolvedLang], resolvedLang);
        } catch {
          return escapeHtml(code);
        }
      }
    }
    
    return escapeHtml(code);
  },
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  's',
  'del',
  'code',
  'pre',
  'span',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'a',
  'img',
  'blockquote',
  'hr',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
];

const ALLOWED_ATTR = ['href', 'src', 'alt', 'class', 'id', 'title'];

export const renderMarkdown = (content: string): string => {
  if (!content) return '';
  const rawHtml = md.render(content);
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
};

export const extractTitle = (content: string): string => {
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^#\s+(.+)$/);
    if (match) {
      return match[1].trim();
    }
  }
  return '';
};

export const getSupportedLanguages = (): string[] => {
  return [
    'javascript',
    'typescript',
    'jsx',
    'tsx',
    'css',
    'python',
    'java',
    'c',
    'cpp',
    'csharp',
    'go',
    'rust',
    'bash',
    'json',
    'yaml',
    'markdown',
    'sql',
    'docker',
    'nginx',
    'xml',
  ];
};
