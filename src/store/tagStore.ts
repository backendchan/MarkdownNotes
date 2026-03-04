import { create } from 'zustand';
import type { Tag } from '../types';
import { TAG_COLORS } from '../types';
import { generateId } from '../utils';

interface TagStore {
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
  addTag: (name: string, color?: string) => Tag;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  getTagByName: (name: string) => Tag | undefined;
  getTagById: (id: string) => Tag | undefined;
}

export const useTagStore = create<TagStore>((set, get) => ({
  tags: [],

  setTags: (tags) => set({ tags }),

  addTag: (name, color) => {
    const existingTag = get().getTagByName(name);
    if (existingTag) {
      return existingTag;
    }

    const tagCount = get().tags.length;
    const tagColor = color || TAG_COLORS[tagCount % TAG_COLORS.length];

    const newTag: Tag = {
      id: generateId(),
      name,
      color: tagColor,
      createdAt: Date.now(),
    };

    set((state) => ({
      tags: [...state.tags, newTag],
    }));

    return newTag;
  },

  updateTag: (id, updates) =>
    set((state) => ({
      tags: state.tags.map((tag) =>
        tag.id === id ? { ...tag, ...updates } : tag
      ),
    })),

  deleteTag: (id) =>
    set((state) => ({
      tags: state.tags.filter((tag) => tag.id !== id),
    })),

  getTagByName: (name) => {
    return get().tags.find((tag) => tag.name.toLowerCase() === name.toLowerCase());
  },

  getTagById: (id) => {
    return get().tags.find((tag) => tag.id === id);
  },
}));
