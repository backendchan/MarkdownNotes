export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  folderId?: string;
  isPinned?: boolean;
  isDeleted?: boolean;
  deletedAt?: number;
}

export type SortOption = 'createdAt' | 'updatedAt' | 'title';

export interface NoteProps {
  note: Note;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
}
