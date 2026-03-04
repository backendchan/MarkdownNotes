import { useState, useCallback } from 'react';
import { Tag as AntTag, Input, Popover, Button } from 'antd';
import { PlusOutlined, TagsOutlined } from '@ant-design/icons';
import { useTagStore } from '../../../store';
import { TAG_COLORS } from '../../../types';
import styles from './styles.module.css';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export const TagSelector = ({ selectedTags, onTagsChange }: TagSelectorProps) => {
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { tags, addTag, getTagByName } = useTagStore();

  const handleClose = useCallback(
    (tagName: string) => {
      onTagsChange(selectedTags.filter((t) => t !== tagName));
    },
    [selectedTags, onTagsChange]
  );

  const handleAddTag = useCallback(() => {
    if (inputValue.trim()) {
      const trimmedValue = inputValue.trim();
      let tag = getTagByName(trimmedValue);

      if (!tag) {
        tag = addTag(trimmedValue);
      }

      if (!selectedTags.includes(tag.name)) {
        onTagsChange([...selectedTags, tag.name]);
      }
    }
    setInputValue('');
    setInputVisible(false);
  }, [inputValue, getTagByName, addTag, selectedTags, onTagsChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    } else if (e.key === 'Escape') {
      setInputValue('');
      setInputVisible(false);
    }
  };

  const getTagColor = (tagName: string): string => {
    const tag = tags.find((t) => t.name === tagName);
    return tag?.color || TAG_COLORS[0];
  };

  const tagManagementContent = (
    <div className={styles.popoverContent}>
      <div className={styles.existingTags}>
        {tags.map((tag) => (
          <AntTag
            key={tag.id}
            color={tag.color}
            className={styles.tagItem}
            onClick={() => {
              if (!selectedTags.includes(tag.name)) {
                onTagsChange([...selectedTags, tag.name]);
              }
            }}
          >
            {tag.name}
          </AntTag>
        ))}
        {tags.length === 0 && <span className={styles.emptyHint}>暂无标签</span>}
      </div>
      <div className={styles.addTagSection}>
        {inputVisible ? (
          <Input
            autoFocus
            size="small"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleAddTag}
            onKeyDown={handleKeyDown}
            placeholder="输入标签名"
            className={styles.tagInput}
          />
        ) : (
          <Button
            type="dashed"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setInputVisible(true)}
            className={styles.addBtn}
          >
            新建标签
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.tagsWrapper}>
        {selectedTags.map((tagName) => (
          <AntTag
            key={tagName}
            color={getTagColor(tagName)}
            closable
            onClose={(e) => {
              e.preventDefault();
              handleClose(tagName);
            }}
          >
            {tagName}
          </AntTag>
        ))}
        <Popover
          content={tagManagementContent}
          trigger="click"
          placement="bottomLeft"
          onOpenChange={(open) => {
            if (!open) {
              setInputVisible(false);
              setInputValue('');
            }
          }}
        >
          <Button
            type="text"
            size="small"
            icon={<TagsOutlined />}
            className={styles.manageBtn}
          >
            标签
          </Button>
        </Popover>
      </div>
    </div>
  );
};
