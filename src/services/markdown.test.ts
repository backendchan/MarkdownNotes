import { describe, it, expect } from 'vitest';
import { parseImageSize, formatImageSize, generateImageMarkdown, renderMarkdown } from './markdown';

describe('parseImageSize', () => {
  it('should parse width and height in pixels', () => {
    const result = parseImageSize('500x300');
    expect(result).toEqual({
      width: 500,
      widthUnit: 'px',
      height: 300,
      heightUnit: 'px',
    });
  });

  it('should parse width and height in percentages', () => {
    const result = parseImageSize('50%x30%');
    expect(result).toEqual({
      width: 50,
      widthUnit: '%',
      height: 30,
      heightUnit: '%',
    });
  });

  it('should parse mixed units (width px, height %)', () => {
    const result = parseImageSize('500x30%');
    expect(result).toEqual({
      width: 500,
      widthUnit: 'px',
      height: 30,
      heightUnit: '%',
    });
  });

  it('should parse width only with x suffix', () => {
    const result = parseImageSize('600x');
    expect(result).toEqual({
      width: 600,
      widthUnit: 'px',
    });
  });

  it('should parse width percentage only with x suffix', () => {
    const result = parseImageSize('80%x');
    expect(result).toEqual({
      width: 80,
      widthUnit: '%',
    });
  });

  it('should parse height only in pixels', () => {
    const result = parseImageSize('x200');
    expect(result).toEqual({
      height: 200,
      heightUnit: 'px',
    });
  });

  it('should parse height only in percentage', () => {
    const result = parseImageSize('x50%');
    expect(result).toEqual({
      height: 50,
      heightUnit: '%',
    });
  });

  it('should handle decimal values', () => {
    const result = parseImageSize('50.5%x30.5%');
    expect(result).toEqual({
      width: 50.5,
      widthUnit: '%',
      height: 30.5,
      heightUnit: '%',
    });
  });

  it('should return null for invalid format', () => {
    expect(parseImageSize('invalid')).toBeNull();
    expect(parseImageSize('')).toBeNull();
    expect(parseImageSize('abcxdef')).toBeNull();
  });
});

describe('formatImageSize', () => {
  it('should format width and height in pixels', () => {
    const result = formatImageSize({ width: 500, height: 300 });
    expect(result).toBe('500px x300px');
  });

  it('should format width and height in percentages', () => {
    const result = formatImageSize({ 
      width: 50, 
      widthUnit: '%', 
      height: 30, 
      heightUnit: '%' 
    });
    expect(result).toBe('50% x30%');
  });

  it('should format width only', () => {
    const result = formatImageSize({ width: 600 });
    expect(result).toBe('600px x');
  });

  it('should format height only', () => {
    const result = formatImageSize({ height: 200 });
    expect(result).toBe('x200px');
  });

  it('should format width percentage only', () => {
    const result = formatImageSize({ width: 80, widthUnit: '%' });
    expect(result).toBe('80% x');
  });
});

describe('generateImageMarkdown', () => {
  it('should generate markdown without size', () => {
    const result = generateImageMarkdown('alt text', 'https://example.com/image.png');
    expect(result).toBe('![alt text](https://example.com/image.png)');
  });

  it('should generate markdown with pixel size', () => {
    const result = generateImageMarkdown('alt text', 'https://example.com/image.png', {
      width: 500,
      height: 300,
    });
    expect(result).toBe('![alt text](https://example.com/image.png =500px x300px)');
  });

  it('should generate markdown with percentage size', () => {
    const result = generateImageMarkdown('alt text', 'https://example.com/image.png', {
      width: 50,
      widthUnit: '%',
    });
    expect(result).toBe('![alt text](https://example.com/image.png =50% x)');
  });
});

describe('renderMarkdown with image sizes', () => {
  it('should render image with pixel width and height', () => {
    const result = renderMarkdown('![test](https://example.com/img.png =500x300)');
    expect(result).toContain('width="500"');
    expect(result).toContain('height="300"');
    expect(result).toContain('alt="test"');
  });

  it('should render image with percentage width', () => {
    const result = renderMarkdown('![test](https://example.com/img.png =50%x)');
    expect(result).toContain('data-width-percent="50"');
  });

  it('should render image with percentage height only', () => {
    const result = renderMarkdown('![test](https://example.com/img.png =x50%)');
    expect(result).toContain('data-height-percent="50"');
  });

  it('should render image with mixed units', () => {
    const result = renderMarkdown('![test](https://example.com/img.png =500x30%)');
    expect(result).toContain('width="500"');
    expect(result).toContain('data-height-percent="30"');
  });

  it('should render image with height only in pixels', () => {
    const result = renderMarkdown('![test](https://example.com/img.png =x200)');
    expect(result).toContain('height="200"');
  });

  it('should render standard image without size', () => {
    const result = renderMarkdown('![test](https://example.com/img.png)');
    expect(result).toContain('<img');
    expect(result).toContain('src="https://example.com/img.png"');
  });

  it('should handle imgstore URLs', () => {
    const result = renderMarkdown('![test](imgstore://abc123 =600x)');
    expect(result).toContain('data-src="imgstore://abc123"');
    expect(result).toContain('width="600"');
  });
});
