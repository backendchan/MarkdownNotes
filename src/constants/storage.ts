export const STORAGE_KEYS = {
  NOTES: 'md-notes:notes',
  SETTINGS: 'md-notes:settings',
  STATE: 'md-notes:state',
  VERSION: 'md-notes:version',
  TAGS: 'md-notes:tags',
  FOLDERS: 'md-notes:folders',
  IMAGES: 'md-notes:images',
} as const;

export const DATA_VERSION = '1.0.0';

export const AUTO_SAVE_DELAY = 1000;
export const DEBOUNCE_DELAY = 300;
export const MAX_NOTE_CONTENT_LENGTH = 100000;

export const APP_NAME = 'Markdown Notes';
