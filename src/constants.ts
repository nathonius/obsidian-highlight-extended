import { PluginSettings } from './interfaces';

export const VAR_CHAR = '@';
export const EDIT_MODE_PATTERN = /==[^=]*?==\[([^;\s]*?)?(;(\S+?))?\]/g;
export const PREVIEW_MODE_PATTERN = /(<mark>.*?<\/mark>)(\[([^;\s]+?)?(;(\S+?))?\])/g;
export const ACTIVE_FILE = '__HIGHLIGHT_ACTIVE_FILE';

export const DEFAULT_SETTINGS: PluginSettings = {
  colorVariables: {},
  palettes: {}
};
