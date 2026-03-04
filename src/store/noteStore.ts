import { create } from 'zustand';
import type { Note } from '../types';

interface NoteStore {
  notes: Note[];
  currentNoteId: string | null;
  isLoading: boolean;

  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setNotes: (notes: Note[]) => void;
  setCurrentNote: (id: string | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useNoteStore = create<NoteStore>((set) => ({
  notes: [],
  currentNoteId: null,
  isLoading: true,

  addNote: (note) =>
    set((state) => ({
      notes: [note, ...state.notes],
    })),

  updateNote: (id, updates) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note
      ),
    })),

  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      currentNoteId: state.currentNoteId === id ? null : state.currentNoteId,
    })),

  setNotes: (notes) => set({ notes }),

  setCurrentNote: (id) => set({ currentNoteId: id }),

  setIsLoading: (loading) => set({ isLoading: loading }),
}));
