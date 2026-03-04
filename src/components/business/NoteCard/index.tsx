import { Popconfirm, Dropdown, Tag } from 'antd';
import { DeleteOutlined, PushpinOutlined, ExportOutlined, MoreOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { Note } from '../../../types';
import { formatDate, getPreviewText } from '../../../utils';
import { exportImportService } from '../../../services';
import { useTagStore } from '../../../store';
import styles from './styles.module.css';

interface NoteCardProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export const NoteCard = ({ note, isActive, onClick, onDelete }: NoteCardProps) => {
  const { tags } = useTagStore();

  const handleDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
  };

  const handleExport = () => {
    exportImportService.exportNoteAsMarkdown(note);
  };

  const getTagColor = (tagName: string): string => {
    const tag = tags.find((t) => t.name === tagName);
    return tag?.color || '#f50';
  };

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'export',
      icon: <ExportOutlined />,
      label: '导出为 Markdown',
      onClick: handleExport,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
    },
  ];

  return (
    <div
      className={`${styles.noteCard} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <div className={styles.header}>
        <div className={styles.title}>
          {note.isPinned && <PushpinOutlined className={styles.pinIcon} />}
          <span>{note.title || '无标题'}</span>
        </div>
        <div className={styles.actions}>
          <Dropdown
            menu={{ items: dropdownItems }}
            trigger={['click']}
            onOpenChange={(open) => open}
          >
            <button
              className={styles.moreBtn}
              onClick={(e) => e.stopPropagation()}
              aria-label="更多操作"
            >
              <MoreOutlined />
            </button>
          </Dropdown>
          <Popconfirm
            title="确认删除"
            description="确定要删除这篇笔记吗？"
            onConfirm={onDelete}
            onCancel={handleDelete}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <button
              className={styles.deleteBtn}
              onClick={(e) => e.stopPropagation()}
              aria-label="删除笔记"
            >
              <DeleteOutlined />
            </button>
          </Popconfirm>
        </div>
      </div>
      {note.tags && note.tags.length > 0 && (
        <div className={styles.tags}>
          {note.tags.slice(0, 3).map((tagName) => (
            <Tag key={tagName} color={getTagColor(tagName)} className={styles.tag}>
              {tagName}
            </Tag>
          ))}
          {note.tags.length > 3 && (
            <span className={styles.moreTags}>+{note.tags.length - 3}</span>
          )}
        </div>
      )}
      <div className={styles.meta}>
        <span className={styles.date}>{formatDate(note.updatedAt)}</span>
        <span className={styles.preview}>{getPreviewText(note.content)}</span>
      </div>
    </div>
  );
};
