import { Plugin } from 'obsidian';
import { ACTIVE_FILE, EDIT_MODE_PATTERN } from './constants';

export class TextColorsPlugin extends Plugin {
  markedLines: Record<string, Record<number, CodeMirror.TextMarker[]>> = {};
  async onload(): Promise<void> {
    this.registerCodeMirror((editor) => {
      editor.on('change', this.handleChange.bind(this));
    });
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
        marks.push(
          instance.markText(
            { line: i, ch: start },
            { line: i, ch: end },
            { css: `color: ${color}; background-color: unset;` }
          )
        );
      }

      // Save marks if any were made
      if (marks.length > 0) {
        this.markedLines[fileKey][i] = marks;
      }
    }
  }
}
