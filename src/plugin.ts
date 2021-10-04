import * as CodeMirror from 'codemirror';
import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, EDIT_MODE_PATTERN, PREVIEW_MODE_PATTERN, VAR_CHAR } from './constants';
import { ColorPalette, PluginSettings } from './interfaces';
import { RegexManager } from './regex-manager';
import { TextColorsSettings } from './settings';

import './styles.scss';

export class TextColorsPlugin extends Plugin {
  private regexManager = new RegexManager(this);
  settings!: TextColorsSettings;

  async onload(): Promise<void> {
    const savedData = await this.loadData();
    const savedSettings: PluginSettings = Object.assign({}, DEFAULT_SETTINGS, savedData);
    this.settings = new TextColorsSettings(this.app, this, savedSettings);

    this.addSettingTab(this.settings);

    this.registerCodeMirror((editor) => {
      editor.on('change', this.handleChange.bind(this));
    });

    this.registerMarkdownPostProcessor(this.markdownPostProcessor.bind(this));
  }

  private clearMarks(instance: CodeMirror.Editor, start: number, end: number): void {
    const line = instance.getLine(end);
    if (line) {
      const endLength = line.length;
      const marks = instance.findMarks({ line: start, ch: 0 }, { line: end, ch: endLength });
      marks.forEach((m) => m.clear());
    }
  }

  private handleChange(instance: CodeMirror.Editor, changeObj: CodeMirror.EditorChangeLinkedList): void {
    // Compute ranges
    const { start: startRange, end: endRange } = this.getChangeRange(instance, changeObj);

    // Clear old marks on these lines
    this.clearMarks(instance, startRange, endRange - 1);

    // Mark affected lines
    for (let lineNumber = startRange; lineNumber < endRange; lineNumber++) {
      const lineContent = instance.getLine(lineNumber);
      let match: RegExpExecArray | null = null;
      while ((match = this.regexManager.editModeRegex.exec(lineContent)) !== null) {
        const { start, end, color, background } = this.regexManager.handleEditMatch(match);

        // Create mark config
        const from: CodeMirror.Position = { line: lineNumber, ch: start };
        const to: CodeMirror.Position = { line: lineNumber, ch: end };

        // Mark text, if a color is given
        if (color || background) {
          instance.markText(from, to, {
            css: this.getCSS(color, background)
          });
        }
      }
    }
  }

  private markdownPostProcessor(el: HTMLElement): void {
    let match: RegExpExecArray | null = null;
    while ((match = this.regexManager.previewModeRegex.exec(el.innerHTML)) !== null) {
      el.innerHTML = this.regexManager.handlePreviewMatch(match, el.innerHTML);
    }
  }

  private getChangeRange(
    instance: CodeMirror.Editor,
    changeObj: CodeMirror.EditorChangeLinkedList
  ): { start: number; end: number } {
    // Make sure the start of the range doesn't go below 0, basically.
    const startRange = Math.max(changeObj.from.line, instance.firstLine());
    const endRemoveRange = changeObj.to.line + 1;
    const endAddRange = startRange + changeObj.text.length;
    // If switching from one file to another, the 'remove' range will be related to the content
    // of the previous file. So make sure the end range doesn't go past the length of the
    // current file.
    const endRange = Math.min(Math.max(endRemoveRange, endAddRange), instance.lastLine() + 1);

    return { start: startRange, end: endRange };
  }

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
