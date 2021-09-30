import * as CodeMirror from 'codemirror';
import { MarkdownPostProcessorContext, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, EDIT_MODE_PATTERN, PREVIEW_MODE_PATTERN } from './constants';
import { PluginSettings } from './interfaces';
import { TextColorsSettings } from './settings';

import './styles.scss';

export class TextColorsPlugin extends Plugin {
  settings!: TextColorsSettings;

  async onload(): Promise<void> {
    const savedData = await this.loadData();
    const savedSettings: PluginSettings = Object.assign({}, DEFAULT_SETTINGS, savedData);
    console.log(savedSettings);
    this.settings = new TextColorsSettings(this.app, this, savedSettings);

    this.addSettingTab(this.settings);

    this.registerCodeMirror((editor) => {
      editor.on('change', this.handleChange.bind(this));
    });

    this.registerMarkdownPostProcessor(this.markdownPostProcessor.bind(this));
  }

  private clearMarks(instance: CodeMirror.Editor, start: number, end: number): void {
    console.log(`start: ${start}; end: ${end}`);
    const line = instance.getLine(end);
    console.log(line);
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
      while ((match = EDIT_MODE_PATTERN.exec(lineContent)) !== null) {
        const start = match.index;
        const end = match.index + match[0].length;
        const color = match[1];
        const backgroundColor = match[3] ? match[3] : 'unset';

        // Create mark config
        const from: CodeMirror.Position = { line: lineNumber, ch: start };
        const to: CodeMirror.Position = { line: lineNumber, ch: end };

        // Mark text, if a color is given
        if (color) {
          instance.markText(from, to, {
            css: `color: ${this.getColorVariable(color)}; background-color: ${this.getColorVariable(backgroundColor)};`
          });
        }
      }
    }
  }

  private markdownPostProcessor(el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    let match: RegExpExecArray | null = null;
    while ((match = PREVIEW_MODE_PATTERN.exec(el.innerHTML)) !== null) {
      console.log(match);
      const color = match[3];
      const backgroundColor = match[5] ? match[5] : 'unset';

      // Remove the [color]
      el.innerHTML = `${el.innerHTML.substring(0, match.index + match[1].length)}${el.innerHTML.substring(
        match.index + match[1].length + match[2].length
      )}`;

      // Add the styling
      el.innerHTML = `${el.innerHTML.substring(0, match.index + 5)} style="color: ${this.getColorVariable(
        color
      )}; background-color: ${this.getColorVariable(backgroundColor)};"${el.innerHTML.substring(match.index + 5)}`;
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

  private getColorVariable(key: string): string {
    if (key.startsWith('$')) {
      const variableName = key.substring(1);
      if (this.settings.settings.colorVariables[variableName]) {
        return this.settings.settings.colorVariables[variableName];
      }
    }
    return key;
  }
}
