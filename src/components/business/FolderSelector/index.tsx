import React, { useMemo } from 'react';
import { Select } from 'antd';
import { FolderOutlined } from '@ant-design/icons';
import { useFolderStore, useNoteStore } from '../../../store';
import { storageService } from '../../../services';
import { DEFAULT_FOLDER_ID } from '../../../types';
import styles from './styles.module.css';

interface FolderSelectorProps {
  currentFolderId?: string;
  noteId: string;
}

export const FolderSelector: React.FC<FolderSelectorProps> = ({ currentFolderId, noteId }) => {
  const { folders } = useFolderStore();
  const { updateNote, notes } = useNoteStore();

  const folderOptions = useMemo(() => {
    return folders.map((folder) => ({
      value: folder.id === DEFAULT_FOLDER_ID ? undefined : folder.id,
      label: folder.name,
    }));
  }, [folders]);

  const handleChange = async (folderId: string | undefined) => {
    updateNote(noteId, { folderId });
    await storageService.saveNotes(
      notes.map((n) => (n.id === noteId ? { ...n, folderId, updatedAt: Date.now() } : n))
    );
  };

  return (
    <Select
      className={styles.folderSelector}
      value={currentFolderId || undefined}
      onChange={handleChange}
      options={folderOptions}
      placeholder="选择文件夹"
      suffixIcon={<FolderOutlined />}
      size="small"
      variant="borderless"
      popupMatchSelectWidth={false}
    />
  );
};
