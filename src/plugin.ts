import { MarkdownPostProcessorContext, Plugin } from 'obsidian';
import { ACTIVE_FILE, DEFAULT_SETTINGS, EDIT_MODE_PATTERN, PREVIEW_MODE_PATTERN } from './constants';
import { PluginSettings } from './interfaces';
import { TextColorsSettings } from './settings';

export class TextColorsPlugin extends Plugin {
  settings!: TextColorsSettings;
  markedLines: Record<string, Record<number, CodeMirror.TextMarker[]>> = {};
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

  private handleChange(instance: CodeMirror.Editor, changeObj: CodeMirror.EditorChangeLinkedList): void {
    // Get key for current file
    const file = this.app.workspace.getActiveFile();
    const fileKey = file ? file.path : ACTIVE_FILE;

    // Compute ranges
    const startRange = changeObj.from.line;
    const endRemoveRange = changeObj.to.line + 1;
    const endAddRange = startRange + changeObj.text.length;
    const endRange = Math.max(endRemoveRange, endAddRange);

    // If file is null we need to clear all marks first.
    if (fileKey === ACTIVE_FILE && this.markedLines[fileKey]) {
      Object.keys(this.markedLines[fileKey]).forEach((key: string) => {
        const lineNumber = parseInt(key);
        this.markedLines[fileKey][lineNumber].forEach((mark) => {
          mark.clear();
        });
        delete this.markedLines[ACTIVE_FILE][lineNumber];
      });
    }

    // Handle each changed line
    for (let i = startRange; i < endRange; i++) {
      if (!this.markedLines[fileKey]) {
        this.markedLines[fileKey] = {};
      }

      // Unmark affected lines
      if (this.markedLines[fileKey][i]) {
        this.markedLines[fileKey][i].forEach((marker) => {
          marker.clear();
        });
        delete this.markedLines[fileKey][i];
      }

      // Mark affected lines
      const marks: CodeMirror.TextMarker[] = [];
      const line = instance.getLine(i);
      let match: RegExpExecArray | null = null;
      while ((match = EDIT_MODE_PATTERN.exec(line)) !== null) {
        const start = match.index;
        const end = match.index + match[0].length;
        const color = match[1];
        const backgroundColor = match[3] ? match[3] : 'unset';
        marks.push(
          instance.markText(
            { line: i, ch: start },
            { line: i, ch: end },
            {
              css: `color: ${this.getColorVariable(color)}; background-color: ${this.getColorVariable(
                backgroundColor
              )};`
            }
          )
        );
      }

      // Save marks if any were made
      if (marks.length > 0) {
        this.markedLines[fileKey][i] = marks;
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
