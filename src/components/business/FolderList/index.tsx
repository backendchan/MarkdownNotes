import React, { useState, useCallback } from 'react';
import { Input, Dropdown, Modal, message } from 'antd';
import {
  FolderOutlined,
  FolderAddOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useFolderStore, useNoteStore } from '../../../store';
import { storageService } from '../../../services';
import type { Folder } from '../../../types';
import { DEFAULT_FOLDER_ID } from '../../../types';
import styles from './styles.module.css';

const generateId = () => `folder-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const FolderList: React.FC = () => {
  const { folders, selectedFolderId, setSelectedFolder, addFolder, updateFolder, deleteFolder } =
    useFolderStore();
  const { notes, updateNote } = useNoteStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateFolder = useCallback(() => {
    setIsCreating(true);
    setNewFolderName('');
  }, []);

  const handleSaveNewFolder = useCallback(async () => {
    if (!newFolderName.trim()) {
      message.warning('文件夹名称不能为空');
      return;
    }

    const newFolder: Folder = {
      id: generateId(),
      name: newFolderName.trim(),
      parentId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    addFolder(newFolder);
    await storageService.saveFolders(folders.filter((f) => f.id !== DEFAULT_FOLDER_ID).concat(newFolder));
    setIsCreating(false);
    setNewFolderName('');
    message.success('文件夹创建成功');
  }, [newFolderName, addFolder, folders]);

  const handleStartEdit = useCallback((folder: Folder) => {
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingFolderId || !editingName.trim()) {
      message.warning('文件夹名称不能为空');
      return;
    }

    updateFolder(editingFolderId, { name: editingName.trim() });
    const updatedFolders = folders.map((f) =>
      f.id === editingFolderId ? { ...f, name: editingName.trim(), updatedAt: Date.now() } : f
    );
    await storageService.saveFolders(updatedFolders.filter((f) => f.id !== DEFAULT_FOLDER_ID));
    setEditingFolderId(null);
    setEditingName('');
    message.success('文件夹更新成功');
  }, [editingFolderId, editingName, updateFolder, folders]);

  const handleDeleteFolder = useCallback(
    async (folder: Folder) => {
      if (folder.id === DEFAULT_FOLDER_ID) {
        message.warning('默认文件夹不能删除');
        return;
      }

      const notesInFolder = notes.filter((n) => n.folderId === folder.id);
      if (notesInFolder.length > 0) {
        Modal.confirm({
          title: '确认删除',
          content: `文件夹 "${folder.name}" 中有 ${notesInFolder.length} 篇笔记，删除后这些笔记将移至"全部笔记"。确定要删除吗？`,
          okText: '删除',
          cancelText: '取消',
          onOk: async () => {
            notesInFolder.forEach((note) => {
              updateNote(note.id, { folderId: undefined });
            });
            deleteFolder(folder.id);
            const remainingFolders = folders.filter((f) => f.id !== folder.id);
            await storageService.saveFolders(remainingFolders.filter((f) => f.id !== DEFAULT_FOLDER_ID));
            await storageService.saveNotes(
              notes.map((n) => (n.folderId === folder.id ? { ...n, folderId: undefined } : n))
            );
            if (selectedFolderId === folder.id) {
              setSelectedFolder(null);
            }
            message.success('文件夹删除成功');
          },
        });
      } else {
        deleteFolder(folder.id);
        const remainingFolders = folders.filter((f) => f.id !== folder.id);
        await storageService.saveFolders(remainingFolders.filter((f) => f.id !== DEFAULT_FOLDER_ID));
        if (selectedFolderId === folder.id) {
          setSelectedFolder(null);
        }
        message.success('文件夹删除成功');
      }
    },
    [folders, notes, deleteFolder, updateNote, selectedFolderId, setSelectedFolder]
  );

  const handleFolderClick = useCallback(
    (folderId: string) => {
      setSelectedFolder(folderId === selectedFolderId ? null : folderId);
    },
    [selectedFolderId, setSelectedFolder]
  );

  const getFolderMenuItems = useCallback(
    (folder: Folder) => [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: '重命名',
        onClick: () => handleStartEdit(folder),
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除',
        danger: true,
        disabled: folder.id === DEFAULT_FOLDER_ID,
        onClick: () => handleDeleteFolder(folder),
      },
    ],
    [handleStartEdit, handleDeleteFolder]
  );

  const getNoteCount = useCallback(
    (folderId: string) => {
      if (folderId === DEFAULT_FOLDER_ID) {
        return notes.length;
      }
      return notes.filter((n) => n.folderId === folderId).length;
    },
    [notes]
  );

  return (
    <div className={styles.folderList}>
      <div className={styles.folderHeader}>
        <span className={styles.folderTitle}>文件夹</span>
        <FolderAddOutlined className={styles.addIcon} onClick={handleCreateFolder} />
      </div>

      <div className={styles.folderItems}>
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`${styles.folderItem} ${
              selectedFolderId === folder.id ? styles.folderItemActive : ''
            }`}
            onClick={() => handleFolderClick(folder.id)}
          >
            <FolderOutlined className={styles.folderIcon} />
            {editingFolderId === folder.id ? (
              <Input
                className={styles.folderNameInput}
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={handleSaveEdit}
                onPressEnter={handleSaveEdit}
                autoFocus
                size="small"
              />
            ) : (
              <>
                <span className={styles.folderName}>{folder.name}</span>
                <span className={styles.folderCount}>{getNoteCount(folder.id)}</span>
              </>
            )}
            {folder.id !== DEFAULT_FOLDER_ID && editingFolderId !== folder.id && (
              <Dropdown menu={{ items: getFolderMenuItems(folder) }} trigger={['click']}>
                <MoreOutlined
                  className={styles.moreIcon}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                />
              </Dropdown>
            )}
          </div>
        ))}

        {isCreating && (
          <div className={styles.folderItem}>
            <FolderOutlined className={styles.folderIcon} />
            <Input
              className={styles.folderNameInput}
              placeholder="输入文件夹名称"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={handleSaveNewFolder}
              onPressEnter={handleSaveNewFolder}
              autoFocus
              size="small"
            />
          </div>
        )}
      </div>
    </div>
  );
};
