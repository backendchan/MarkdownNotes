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

export interface ParsedImageSize {
  width?: number;
  height?: number;
  widthUnit?: 'px' | '%';
  heightUnit?: 'px' | '%';
}

const SIZE_REGEX = /^(\d+(?:\.\d+)?)(%?)x(\d+(?:\.\d+)?)(%?)$/;
const WIDTH_WITH_X_REGEX = /^(\d+(?:\.\d+)?)(%?)x$/;
const WIDTH_ONLY_REGEX = /^(\d+(?:\.\d+)?)(%?)$/;
const HEIGHT_ONLY_REGEX = /^x(\d+(?:\.\d+)?)(%?)$/;

export function parseImageSize(sizeStr: string): ParsedImageSize | null {
  const trimmed = sizeStr.trim();
  
  const fullMatch = trimmed.match(SIZE_REGEX);
  if (fullMatch) {
    return {
      width: parseFloat(fullMatch[1]),
      widthUnit: fullMatch[2] === '%' ? '%' : 'px',
      height: parseFloat(fullMatch[3]),
      heightUnit: fullMatch[4] === '%' ? '%' : 'px',
    };
  }
  
  const widthWithXMatch = trimmed.match(WIDTH_WITH_X_REGEX);
  if (widthWithXMatch) {
    return {
      width: parseFloat(widthWithXMatch[1]),
      widthUnit: widthWithXMatch[2] === '%' ? '%' : 'px',
    };
  }
  
  const heightMatch = trimmed.match(HEIGHT_ONLY_REGEX);
  if (heightMatch) {
    return {
      height: parseFloat(heightMatch[1]),
      heightUnit: heightMatch[2] === '%' ? '%' : 'px',
    };
  }
  
  const widthMatch = trimmed.match(WIDTH_ONLY_REGEX);
  if (widthMatch) {
    return {
      width: parseFloat(widthMatch[1]),
      widthUnit: widthMatch[2] === '%' ? '%' : 'px',
    };
  }
  
  return null;
}

export function formatImageSize(size: ParsedImageSize): string {
  const parts: string[] = [];
  
  if (size.width !== undefined) {
    parts.push(`${size.width}${size.widthUnit || 'px'}`);
  }
  
  if (size.height !== undefined) {
    parts.push(`x${size.height}${size.heightUnit || 'px'}`);
  } else if (size.width !== undefined) {
    parts.push('x');
  }
  
  return parts.join(' ');
}

export function generateImageMarkdown(
  alt: string,
  url: string,
  size?: ParsedImageSize
): string {
  if (!size) {
    return `![${alt}](${url})`;
  }
  
  const sizeStr = formatImageSize(size);
  return `![${alt}](${url} =${sizeStr})`;
}

function parseImageUrlWithSize(url: string): { cleanUrl: string; size?: ParsedImageSize } {
  const sizeMatch = url.match(/\s*=\s*(.+)$/);
  
  if (sizeMatch) {
    const cleanUrl = url.substring(0, url.length - sizeMatch[0].length).trim();
    const sizeStr = sizeMatch[1];
    const size = parseImageSize(sizeStr);
    
    if (size) {
      return { cleanUrl, size };
    }
    
    return { cleanUrl: url };
  }
  
  return { cleanUrl: url };
}

md.inline.ruler.before('image', 'image_with_size', (state, silent) => {
  const start = state.pos;
  const max = state.posMax;
  
  if (state.src.charCodeAt(start) !== 0x21 /* ! */) {
    return false;
  }
  if (state.src.charCodeAt(start + 1) !== 0x5B /* [ */) {
    return false;
  }

  let pos = start + 2;
  let labelStart = pos;
  let labelEnd: number;
  
  while (pos < max) {
    const ch = state.src.charCodeAt(pos);
    if (ch === 0x5B /* [ */) {
      return false;
    }
    if (ch === 0x5D /* ] */) {
      labelEnd = pos;
      break;
    }
    pos++;
  }
  
  if (pos >= max || labelEnd === undefined) {
    return false;
  }
  
  pos = labelEnd + 1;
  if (pos >= max || state.src.charCodeAt(pos) !== 0x28 /* ( */) {
    return false;
  }
  
  pos++;
  const hrefStart = pos;
  let hrefEnd: number;
  
  while (pos < max) {
    const ch = state.src.charCodeAt(pos);
    if (ch === 0x29 /* ) */) {
      hrefEnd = pos;
      break;
    }
    pos++;
  }
  
  if (pos >= max || hrefEnd === undefined) {
    return false;
  }
  
  const rawUrl = state.src.slice(hrefStart, hrefEnd).trim();
  const { cleanUrl: href, size } = parseImageUrlWithSize(rawUrl);
  const alt = state.src.slice(labelStart, labelEnd);
  
  if (!silent) {
    const token = state.push('image', 'img', 0);
    
    if (href.startsWith('imgstore://')) {
      token.attrSet('data-src', href);
      token.attrSet('src', 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f5f5f5" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif"%3E加载中...%3C/text%3E%3C/svg%3E');
    } else {
      token.attrSet('src', href);
    }
    
    token.attrSet('alt', alt);
    
    if (size) {
      if (size.width !== undefined) {
        if (size.widthUnit === '%') {
          token.attrSet('data-width-percent', String(size.width));
        } else {
          token.attrSet('width', String(size.width));
        }
      }
      
      if (size.height !== undefined) {
        if (size.heightUnit === '%') {
          token.attrSet('data-height-percent', String(size.height));
        } else {
          token.attrSet('height', String(size.height));
        }
      }
    }
    
    token.content = alt;
    token.children = [];
  }
  
  state.pos = pos + 1;
  return true;
});

md.renderer.rules.image = (tokens, idx) => {
  const token = tokens[idx];
  const src = token.attrGet('src') || '';
  const alt = token.content || '';
  const dataSrc = token.attrGet('data-src');
  const width = token.attrGet('width');
  const height = token.attrGet('height');
  const widthPercent = token.attrGet('data-width-percent');
  const heightPercent = token.attrGet('data-height-percent');
  
  let attrs = `alt="${escapeHtml(alt)}"`;
  
  if (dataSrc) {
    attrs += ` data-src="${escapeHtml(dataSrc)}"`;
  }
  
  if (width) {
    attrs += ` width="${width}"`;
  }
  
  if (height) {
    attrs += ` height="${height}"`;
  }
  
  if (widthPercent) {
    attrs += ` data-width-percent="${widthPercent}"`;
  }
  
  if (heightPercent) {
    attrs += ` data-height-percent="${heightPercent}"`;
  }
  
  return `<img src="${escapeHtml(src)}" ${attrs}>`;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

const ALLOWED_ATTR = [
  'href',
  'src',
  'alt',
  'class',
  'id',
  'title',
  'style',
  'width',
  'height',
  'data-image-id',
  'data-src',
  'data-width-percent',
  'data-height-percent',
];

export const renderMarkdown = (content: string): string => {
  if (!content) return '';
  const rawHtml = md.render(content);
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ['data-image-id', 'data-src', 'data-width-percent', 'data-height-percent'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|imgstore):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
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
