import { create } from 'zustand';
import type { Folder } from '../types';
import { DEFAULT_FOLDER_ID, DEFAULT_FOLDER_NAME } from '../types';

interface FolderStore {
  folders: Folder[];
  selectedFolderId: string | null;
  isLoading: boolean;

  addFolder: (folder: Folder) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  setFolders: (folders: Folder[]) => void;
  setSelectedFolder: (id: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  getFolderById: (id: string) => Folder | undefined;
  getChildFolders: (parentId: string | null) => Folder[];
}

const defaultFolder: Folder = {
  id: DEFAULT_FOLDER_ID,
  name: DEFAULT_FOLDER_NAME,
  parentId: null,
  createdAt: 0,
  updatedAt: 0,
};

export const useFolderStore = create<FolderStore>((set, get) => ({
  folders: [defaultFolder],
  selectedFolderId: null,
  isLoading: true,

  addFolder: (folder) =>
    set((state) => ({
      folders: [...state.folders, folder],
    })),

  updateFolder: (id, updates) =>
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === id ? { ...folder, ...updates, updatedAt: Date.now() } : folder
      ),
    })),

  deleteFolder: (id) =>
    set((state) => ({
      folders: state.folders.filter((folder) => folder.id !== id),
      selectedFolderId: state.selectedFolderId === id ? null : state.selectedFolderId,
    })),

  setFolders: (folders) => {
    const hasDefaultFolder = folders.some((f) => f.id === DEFAULT_FOLDER_ID);
    if (hasDefaultFolder) {
      set({ folders });
    } else {
      set({ folders: [defaultFolder, ...folders] });
    }
  },

  setSelectedFolder: (id) => set({ selectedFolderId: id }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  getFolderById: (id) => {
    return get().folders.find((folder) => folder.id === id);
  },

  getChildFolders: (parentId) => {
    return get().folders.filter((folder) => folder.parentId === parentId);
  },
}));
