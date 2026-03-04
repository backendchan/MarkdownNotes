import { describe, it, expect, beforeEach } from 'vitest';
import { useFolderStore } from './folderStore';
import { DEFAULT_FOLDER_ID, DEFAULT_FOLDER_NAME } from '../types';

describe('folderStore', () => {
  beforeEach(() => {
    useFolderStore.setState({
      folders: [
        {
          id: DEFAULT_FOLDER_ID,
          name: DEFAULT_FOLDER_NAME,
          parentId: null,
          createdAt: 0,
          updatedAt: 0,
        },
      ],
      selectedFolderId: null,
      isLoading: true,
    });
  });

  describe('addFolder', () => {
    it('should add a new folder', () => {
      const { addFolder } = useFolderStore.getState();
      const folder = {
        id: 'folder-1',
        name: 'Work',
        parentId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      addFolder(folder);

      expect(useFolderStore.getState().folders).toHaveLength(2);
      expect(useFolderStore.getState().folders[1].name).toBe('Work');
    });

    it('should add folder to the end of the list', () => {
      const { addFolder } = useFolderStore.getState();
      const folder1 = {
        id: 'folder-1',
        name: 'Work',
        parentId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const folder2 = {
        id: 'folder-2',
        name: 'Personal',
        parentId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      addFolder(folder1);
      addFolder(folder2);

      expect(useFolderStore.getState().folders).toHaveLength(3);
      expect(useFolderStore.getState().folders[2].name).toBe('Personal');
    });
  });

  describe('updateFolder', () => {
    it('should update folder name', () => {
      const { addFolder, updateFolder } = useFolderStore.getState();
      const folder = {
        id: 'folder-1',
        name: 'Work',
        parentId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addFolder(folder);

      updateFolder('folder-1', { name: 'Work Updated' });

      const updatedFolder = useFolderStore.getState().folders.find((f) => f.id === 'folder-1');
      expect(updatedFolder?.name).toBe('Work Updated');
    });

    it('should update updatedAt timestamp', async () => {
      const { addFolder, updateFolder } = useFolderStore.getState();
      const folder = {
        id: 'folder-1',
        name: 'Work',
        parentId: null,
        createdAt: Date.now(),
        updatedAt: 1000,
      };
      addFolder(folder);

      await new Promise((resolve) => setTimeout(resolve, 10));
      updateFolder('folder-1', { name: 'Updated' });

      const updatedFolder = useFolderStore.getState().folders.find((f) => f.id === 'folder-1');
      expect(updatedFolder?.updatedAt).toBeGreaterThan(1000);
    });
  });

  describe('deleteFolder', () => {
    it('should delete folder by id', () => {
      const { addFolder, deleteFolder } = useFolderStore.getState();
      const folder = {
        id: 'folder-1',
        name: 'Work',
        parentId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addFolder(folder);
      expect(useFolderStore.getState().folders).toHaveLength(2);

      deleteFolder('folder-1');
      expect(useFolderStore.getState().folders).toHaveLength(1);
    });

    it('should clear selectedFolderId when deleting selected folder', () => {
      const { addFolder, deleteFolder, setSelectedFolder } = useFolderStore.getState();
      const folder = {
        id: 'folder-1',
        name: 'Work',
        parentId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addFolder(folder);
      setSelectedFolder('folder-1');

      deleteFolder('folder-1');

      expect(useFolderStore.getState().selectedFolderId).toBeNull();
    });

    it('should not affect other folders', () => {
      const { addFolder, deleteFolder } = useFolderStore.getState();
      const folder1 = {
        id: 'folder-1',
        name: 'Work',
        parentId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const folder2 = {
        id: 'folder-2',
        name: 'Personal',
        parentId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addFolder(folder1);
      addFolder(folder2);

      deleteFolder('folder-1');

      expect(useFolderStore.getState().folders).toHaveLength(2);
      expect(useFolderStore.getState().folders[1].id).toBe('folder-2');
    });
  });

  describe('setFolders', () => {
    it('should replace all folders', () => {
      const { setFolders } = useFolderStore.getState();
      const newFolders = [
        {
          id: DEFAULT_FOLDER_ID,
          name: DEFAULT_FOLDER_NAME,
          parentId: null,
          createdAt: 0,
          updatedAt: 0,
        },
        {
          id: 'folder-1',
          name: 'Work',
          parentId: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      setFolders(newFolders);

      expect(useFolderStore.getState().folders).toHaveLength(2);
      expect(useFolderStore.getState().folders[1].name).toBe('Work');
    });

    it('should add default folder if not present', () => {
      const { setFolders } = useFolderStore.getState();
      const newFolders = [
        {
          id: 'folder-1',
          name: 'Work',
          parentId: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      setFolders(newFolders);

      expect(useFolderStore.getState().folders).toHaveLength(2);
      expect(useFolderStore.getState().folders[0].id).toBe(DEFAULT_FOLDER_ID);
    });
  });

  describe('setSelectedFolder', () => {
    it('should set selected folder id', () => {
      const { setSelectedFolder } = useFolderStore.getState();

      setSelectedFolder('folder-1');

      expect(useFolderStore.getState().selectedFolderId).toBe('folder-1');
    });

    it('should allow setting to null', () => {
      const { setSelectedFolder } = useFolderStore.getState();
      setSelectedFolder('folder-1');

      setSelectedFolder(null);

      expect(useFolderStore.getState().selectedFolderId).toBeNull();
    });
  });

  describe('getFolderById', () => {
    it('should find folder by id', () => {
      const { addFolder, getFolderById } = useFolderStore.getState();
      const folder = {
        id: 'folder-1',
        name: 'Work',
        parentId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addFolder(folder);

      const found = getFolderById('folder-1');

      expect(found?.name).toBe('Work');
    });

    it('should return undefined for non-existent id', () => {
      const { getFolderById } = useFolderStore.getState();

      const found = getFolderById('non-existent-id');

      expect(found).toBeUndefined();
    });

    it('should find default folder', () => {
      const { getFolderById } = useFolderStore.getState();

      const found = getFolderById(DEFAULT_FOLDER_ID);

      expect(found?.name).toBe(DEFAULT_FOLDER_NAME);
    });
  });

  describe('getChildFolders', () => {
    it('should return folders with matching parentId', () => {
      const { addFolder, getChildFolders } = useFolderStore.getState();
      const parentFolder = {
        id: 'parent-1',
        name: 'Parent',
        parentId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const childFolder1 = {
        id: 'child-1',
        name: 'Child 1',
        parentId: 'parent-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const childFolder2 = {
        id: 'child-2',
        name: 'Child 2',
        parentId: 'parent-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const otherFolder = {
        id: 'other-1',
        name: 'Other',
        parentId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      addFolder(parentFolder);
      addFolder(childFolder1);
      addFolder(childFolder2);
      addFolder(otherFolder);

      const children = getChildFolders('parent-1');

      expect(children).toHaveLength(2);
      expect(children.map((f) => f.name)).toContain('Child 1');
      expect(children.map((f) => f.name)).toContain('Child 2');
    });

    it('should return empty array when no children', () => {
      const { getChildFolders } = useFolderStore.getState();

      const children = getChildFolders('non-existent');

      expect(children).toHaveLength(0);
    });

    it('should return root folders when parentId is null', () => {
      const { addFolder, getChildFolders } = useFolderStore.getState();
      const rootFolder = {
        id: 'root-1',
        name: 'Root',
        parentId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const childFolder = {
        id: 'child-1',
        name: 'Child',
        parentId: 'root-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      addFolder(rootFolder);
      addFolder(childFolder);

      const rootFolders = getChildFolders(null);

      expect(rootFolders).toHaveLength(2);
      expect(rootFolders.map((f) => f.name)).toContain('全部笔记');
      expect(rootFolders.map((f) => f.name)).toContain('Root');
    });
  });
});
