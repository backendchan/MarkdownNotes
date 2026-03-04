export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface FolderProps {
  folder: Folder;
  onClick?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const DEFAULT_FOLDER_ID = 'default';
export const DEFAULT_FOLDER_NAME = '全部笔记';
