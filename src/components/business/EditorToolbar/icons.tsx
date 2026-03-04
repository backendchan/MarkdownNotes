import { BoldOutlined, ItalicOutlined, UnderlineOutlined } from '@ant-design/icons';

const createIcon = (path: string, viewBox: string = '0 0 24 24') => {
  return () => (
    <svg viewBox={viewBox} width="1em" height="1em" fill="currentColor">
      <path d={path} />
    </svg>
  );
};

export const H1Outlined = createIcon('M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm14.5 0c.28 0 .5.22.5.5v1c0 .28-.22.5-.5.5H17v14h-1V6h-1.5c-.28 0-.5-.22-.5-.5v-1c0-.28.22-.5.5-.5h4z');
export const H2Outlined = createIcon('M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm12.5 4c.83 0 1.5.67 1.5 1.5 0 .53-.27 1-.68 1.27L15.5 12.5H21v2h-8v-1.5l3.5-2.5H13V8h3.5z');
export const H3Outlined = createIcon('M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm12.5 4c.83 0 1.5.67 1.5 1.5 0 .71-.49 1.3-1.15 1.47l1.65 2.03H21v2h-3.5l-2.17-2.67H14v2.67h-2V8h4.5zm-2.5 2v1.5h2.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5H14z');

export { BoldOutlined, ItalicOutlined, UnderlineOutlined };
export { OrderedListOutlined, UnorderedListOutlined } from '@ant-design/icons';
export { CodeOutlined, LinkOutlined, PictureOutlined } from '@ant-design/icons';
export { MinusOutlined } from '@ant-design/icons';

const QuotePath = 'M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z';
export const QuoteOutlined = createIcon(QuotePath);
