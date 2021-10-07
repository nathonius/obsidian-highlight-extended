import * as CodeMirror from 'codemirror';
import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, VAR_CHAR } from './constants';
import { ColorPalette, PluginSettings } from './interfaces';
import { RegexManager } from './regex-manager';
import { HighlightExtendedSettings } from './settings';

import './styles.scss';

export class HighlightExtendedPlugin extends Plugin {
  settings!: HighlightExtendedSettings;
  private regexManager = new RegexManager(this);

  async onload(): Promise<void> {
    // Load settings
    const savedData = await this.loadData();
    const savedSettings: PluginSettings = Object.assign({}, DEFAULT_SETTINGS, savedData);
    this.settings = new HighlightExtendedSettings(this.app, this, savedSettings);

    // Add settings tab and settings commands
    this.addSettingTab(this.settings);

    this.addCommand({
      id: 'text-colors-plugin-manage-variables',
      name: 'Manage color variables',
      callback: () => {
        this.settings.openManageVariablesModal();
      }
    });

    this.addCommand({
      id: 'text-colors-plugin-manage-palettes',
      name: 'Manage color palettes',
      callback: () => {
        this.settings.openManagePalettesModal();
      }
    });

    // Register processors
    this.registerCodeMirror((editor) => {
      editor.on('change', this.handleChange.bind(this));
    });

    this.registerMarkdownPostProcessor(this.markdownPostProcessor.bind(this));
  }

  /**
   * Given a color key and background key, both of which
   * could be null, resolves any palettes and color variables.
   *
   * If null is the specified value, the color will resolve to
   * 'unset' to remove the color entirely.
   *
   * @todo: What is unset going to set the color to? For
   * background it's obviously transparent, but what about
   * for color? Should I use the text color css var instead?
   */
  getCSS(colorKey: string | null, backgroundKey: string | null): string {
    // Look for potential color vars
    const palette = this.getColorPalette(colorKey);
    const foregroundVar =
      palette && palette.foreground
        ? this.getColorVariable(palette.foreground) || palette.foreground
        : this.getColorVariable(colorKey);
    const backgroundVar =
      palette && palette.background
        ? this.getColorVariable(palette.background) || palette.background
        : this.getColorVariable(backgroundKey);

    // Get actual values
    const foregroundValue = foregroundVar ? foregroundVar : colorKey ? colorKey : 'unset';
    const backgroundValue = backgroundVar ? backgroundVar : backgroundKey ? backgroundKey : 'unset';

    // Build CSS
    return `color: ${foregroundValue}; background-color: ${backgroundValue}`;
  }

  /**
   * When any line changes, reprocess the entire file for marks.
   *
   * @todo: It's possible to make this more efficient by only
   * marking/unmarking affected lines. It's just going to take
   * lots of logic, and I'm not sure it's worth it.
   */
  private handleChange(instance: CodeMirror.Editor): void {
    // Clear all marks
    instance.getAllMarks().forEach((mark) => {
      mark.clear();
    });

    // Get all regex matches over the whole file
    const value = instance.getValue();
    let match: RegExpExecArray | null = null;
    while ((match = this.regexManager.editModeRegex.exec(value)) !== null) {
      // Get the exact positions for this match
      const startIndex = match.index;
      const endIndex = startIndex + match[0].length;
      const { from, to } = this.getLineRangeFromIndex(value, startIndex, endIndex);

      // Get the color and background values (possibly unresolved variables) for this match
      const { color, background } = this.regexManager.handleEditMatch(match);

      // Mark the text
      instance.markText(from, to, { css: this.getCSS(color, background) });
    }
  }

  /**
   * Given the value of the entire file, the index of a match,
   * and the ending index of a match, return two CodeMirror.Position
   * objects to use for text marking.
   *
   * @todo: this could be reworked to be more efficient by
   * remembering the location of the previous match in the file and
   * beginning at that point and line number;
   */
  private getLineRangeFromIndex(
    value: string,
    startIndex: number,
    endIndex: number
  ): { from: CodeMirror.Position; to: CodeMirror.Position } {
    const from = { line: 0, ch: 0 };
    const to = { line: 0, ch: 0 };
    let lineNumber = 0;
    let lineIndex = 0;
    for (let i = 0; i < endIndex; i++) {
      if (value[i] && value[i].match(/\r\n|\r|\n/)) {
        lineNumber += 1;
        lineIndex = 0;
      } else {
        if (i === startIndex) {
          from.line = lineNumber;
          from.ch = lineIndex;
        } else if (i === endIndex - 1) {
          to.line = lineNumber;
          to.ch = lineIndex + 1;
        }
        lineIndex += 1;
      }
    }
    return { from, to };
  }

  /**
   * Handle setting text color in preview mode.
   */
  private markdownPostProcessor(el: HTMLElement): void {
    let match: RegExpExecArray | null = null;
    while ((match = this.regexManager.previewModeRegex.exec(el.innerHTML)) !== null) {
      el.innerHTML = this.regexManager.handlePreviewMatch(match, el.innerHTML);
    }
  }

  /**
   * Given a key like '@abc' return color palette
   * abc if it exists
   */
  private getColorPalette(key: string | null): ColorPalette | null {
    if (key && key.startsWith(VAR_CHAR)) {
      const variableName = key.substring(1);
      if (this.settings.settings.palettes[variableName]) {
        return this.settings.settings.palettes[variableName];
      }
    }
    return null;
  }

  /**
   * Given a key like '@abc' return color variable
   * abc if it exists
   */
  private getColorVariable(key: string | null): string | null {
    if (key && key.startsWith(VAR_CHAR)) {
      const variableName = key.substring(1);
      if (this.settings.settings.colorVariables[variableName]) {
        return this.settings.settings.colorVariables[variableName];
      }
    }
    return null;
  }
}
