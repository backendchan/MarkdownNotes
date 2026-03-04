import { Tooltip } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  CodeOutlined,
  LinkOutlined,
  PictureOutlined,
  MinusOutlined,
  QuoteOutlined,
  H1Outlined,
  H2Outlined,
  H3Outlined,
} from './icons';
import styles from './styles.module.css';

export interface ToolbarAction {
  type: string;
  prefix: string;
  suffix: string;
  placeholder?: string;
}

export const toolbarActions: Record<string, ToolbarAction> = {
  h1: {
    type: 'heading1',
    prefix: '# ',
    suffix: '',
    placeholder: '标题',
  },
  h2: {
    type: 'heading2',
    prefix: '## ',
    suffix: '',
    placeholder: '标题',
  },
  h3: {
    type: 'heading3',
    prefix: '### ',
    suffix: '',
    placeholder: '标题',
  },
  bold: {
    type: 'bold',
    prefix: '**',
    suffix: '**',
    placeholder: '粗体文本',
  },
  italic: {
    type: 'italic',
    prefix: '*',
    suffix: '*',
    placeholder: '斜体文本',
  },
  strikethrough: {
    type: 'strikethrough',
    prefix: '~~',
    suffix: '~~',
    placeholder: '删除线文本',
  },
  code: {
    type: 'code',
    prefix: '`',
    suffix: '`',
    placeholder: '代码',
  },
  codeBlock: {
    type: 'codeBlock',
    prefix: '```\n',
    suffix: '\n```',
    placeholder: '代码块',
  },
  link: {
    type: 'link',
    prefix: '[',
    suffix: '](url)',
    placeholder: '链接文本',
  },
  image: {
    type: 'image',
    prefix: '![',
    suffix: '](url)',
    placeholder: '图片描述',
  },
  quote: {
    type: 'quote',
    prefix: '> ',
    suffix: '',
    placeholder: '引用文本',
  },
  ulist: {
    type: 'ulist',
    prefix: '- ',
    suffix: '',
    placeholder: '列表项',
  },
  olist: {
    type: 'olist',
    prefix: '1. ',
    suffix: '',
    placeholder: '列表项',
  },
  hr: {
    type: 'hr',
    prefix: '\n---\n',
    suffix: '',
  },
};

interface ToolbarButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

const ToolbarButton = ({ icon, title, onClick }: ToolbarButtonProps) => (
  <Tooltip title={title}>
    <button className={styles.toolbarButton} onClick={onClick} type="button">
      {icon}
    </button>
  </Tooltip>
);

interface EditorToolbarProps {
  onAction: (action: ToolbarAction) => void;
}

export const EditorToolbar = ({ onAction }: EditorToolbarProps) => {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarGroup}>
        <ToolbarButton
          icon={<H1Outlined />}
          title="一级标题"
          onClick={() => onAction(toolbarActions.h1)}
        />
        <ToolbarButton
          icon={<H2Outlined />}
          title="二级标题"
          onClick={() => onAction(toolbarActions.h2)}
        />
        <ToolbarButton
          icon={<H3Outlined />}
          title="三级标题"
          onClick={() => onAction(toolbarActions.h3)}
        />
      </div>
      
      <div className={styles.toolbarDivider} />
      
      <div className={styles.toolbarGroup}>
        <ToolbarButton
          icon={<BoldOutlined />}
          title="粗体"
          onClick={() => onAction(toolbarActions.bold)}
        />
        <ToolbarButton
          icon={<ItalicOutlined />}
          title="斜体"
          onClick={() => onAction(toolbarActions.italic)}
        />
        <ToolbarButton
          icon={<UnderlineOutlined />}
          title="删除线"
          onClick={() => onAction(toolbarActions.strikethrough)}
        />
      </div>
      
      <div className={styles.toolbarDivider} />
      
      <div className={styles.toolbarGroup}>
        <ToolbarButton
          icon={<CodeOutlined />}
          title="行内代码"
          onClick={() => onAction(toolbarActions.code)}
        />
        <ToolbarButton
          icon={<QuoteOutlined />}
          title="引用"
          onClick={() => onAction(toolbarActions.quote)}
        />
      </div>
      
      <div className={styles.toolbarDivider} />
      
      <div className={styles.toolbarGroup}>
        <ToolbarButton
          icon={<UnorderedListOutlined />}
          title="无序列表"
          onClick={() => onAction(toolbarActions.ulist)}
        />
        <ToolbarButton
          icon={<OrderedListOutlined />}
          title="有序列表"
          onClick={() => onAction(toolbarActions.olist)}
        />
      </div>
      
      <div className={styles.toolbarDivider} />
      
      <div className={styles.toolbarGroup}>
        <ToolbarButton
          icon={<LinkOutlined />}
          title="链接"
          onClick={() => onAction(toolbarActions.link)}
        />
        <ToolbarButton
          icon={<PictureOutlined />}
          title="图片"
          onClick={() => onAction(toolbarActions.image)}
        />
      </div>
      
      <div className={styles.toolbarDivider} />
      
      <div className={styles.toolbarGroup}>
        <ToolbarButton
          icon={<MinusOutlined />}
          title="分割线"
          onClick={() => onAction(toolbarActions.hr)}
        />
      </div>
    </div>
  );
};
