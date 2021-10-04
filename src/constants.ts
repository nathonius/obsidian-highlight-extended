import { PluginSettings } from './interfaces';

/**
 * The character that identifies a color variable/palette.
 */
export const VAR_CHAR = '@';

// Regex
export const AFTER_EDIT_MODE_PATTERN = /==(?:(?!==|\r\n\r\n|\r\r|\n\n)[\s\S])+==\[([^;\s]*?)?(?:;(\S+?))?\]/g;
export const BEFORE_EDIT_MODE_PATTERN = /\[([^;\s]*?)?(?:;(\S+?))?\]==(?:(?!==|\r\n\r\n|\r\r|\n\n)[\s\S])+(?:==)?/g;
export const AFTER_PREVIEW_MODE_PATTERN = /(<mark>[\s\S]*?<\/mark>)(\[([^;\s]+?)?(?:;(\S+?))?\])/g;
export const BEFORE_PREVIEW_MODE_PATTERN = /(\[([^;\s]+?)?(?:;(\S+?))?\])(<mark>[\s\S]*?<\/mark>)/g;

export const DEFAULT_SETTINGS: PluginSettings = {
  colorVariables: {},
  palettes: {},
  syntaxBefore: true
};
