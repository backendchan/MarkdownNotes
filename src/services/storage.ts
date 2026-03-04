import localforage from 'localforage';
import { STORAGE_KEYS, DATA_VERSION } from '../constants';
import type { Note, Settings, AppState, Tag, Folder } from '../types';
import { defaultSettings } from '../types';
import { defaultAppState } from '../types';

localforage.config({
  name: 'markdown-notes',
  storeName: 'notes',
});

export const storageService = {
  async getNotes(): Promise<Note[]> {
    const notes = await localforage.getItem<Note[]>(STORAGE_KEYS.NOTES);
    return notes || [];
  },

  async saveNotes(notes: Note[]): Promise<void> {
    await localforage.setItem(STORAGE_KEYS.NOTES, notes);
  },

  async getSettings(): Promise<Settings> {
    const settings = await localforage.getItem<Settings>(STORAGE_KEYS.SETTINGS);
    return settings || defaultSettings;
  },

  async saveSettings(settings: Settings): Promise<void> {
    await localforage.setItem(STORAGE_KEYS.SETTINGS, settings);
  },

  async getAppState(): Promise<AppState> {
    const state = await localforage.getItem<AppState>(STORAGE_KEYS.STATE);
    return state || defaultAppState;
  },

  async saveAppState(state: AppState): Promise<void> {
    await localforage.setItem(STORAGE_KEYS.STATE, state);
  },

  async getTags(): Promise<Tag[]> {
    const tags = await localforage.getItem<Tag[]>(STORAGE_KEYS.TAGS);
    return tags || [];
  },

  async saveTags(tags: Tag[]): Promise<void> {
    await localforage.setItem(STORAGE_KEYS.TAGS, tags);
  },

  async getFolders(): Promise<Folder[]> {
    const folders = await localforage.getItem<Folder[]>(STORAGE_KEYS.FOLDERS);
    return folders || [];
  },

  async saveFolders(folders: Folder[]): Promise<void> {
    await localforage.setItem(STORAGE_KEYS.FOLDERS, folders);
  },

  async getVersion(): Promise<string | null> {
    return localforage.getItem<string>(STORAGE_KEYS.VERSION);
  },

  async setVersion(): Promise<void> {
    await localforage.setItem(STORAGE_KEYS.VERSION, DATA_VERSION);
  },

  async clearAll(): Promise<void> {
    await localforage.clear();
  },
};
