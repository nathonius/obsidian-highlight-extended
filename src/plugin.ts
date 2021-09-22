import { MarkdownPostProcessorContext, Plugin } from 'obsidian';

type RenderLineEvent = CodeMirror.LineHandle & Pick<CodeMirror.EditorChange, 'from' | 'to'>;

export class TextColorsPlugin extends Plugin {
  markedLines: Record<number, CodeMirror.TextMarker[]> = {};
  async onload(): Promise<void> {
    this.registerMarkdownPostProcessor(this.processor.bind(this));

    this.registerCodeMirror((editor) => {
      // editor.on('change', this.handleChange.bind(this));
      editor.on('change', this.handleChange.bind(this));
    });
  }

  private handleChange(instance: CodeMirror.Editor, changeObj: CodeMirror.EditorChangeLinkedList): void {
    // const pattern = /(\[.*?\])(\{.*?\})/g;
    // const pattern = /(==.*?==)(\[.*?\])/g;
    const pattern = /==[^=]*?==\[(.*?)\]/g;
    console.log(changeObj);
    const startRange = changeObj.from.line;
    const endRemoveRange = changeObj.to.line + 1;
    const endAddRange = startRange + changeObj.text.length;
    const endRange = Math.max(endRemoveRange, endAddRange);

    // Unmark lines
    // for(let i = startRange; i < endRange; i++) {

    // }
    // const endRange = changeObj.to.line + changeObj.text.length - (changeObj.removed?.length || 1) + 1;
    // const removedCount = (changeObj.removed?.length || 1) - 1;

    // const unmarkLine = (lineNo: number) => {

    // };

    // // Unmark removed lines
    // for (let i = startRange; i < removedCount + startRange; i++) {
    //   unmarkLine(i);
    // }

    // // Unmark changed lines
    // for (let i = startRange; i < endRange; i++) {
    //   unmarkLine(i);
    // }

    for (let i = startRange; i < endRange; i++) {
      // Unmark line
      if (this.markedLines[i]) {
        this.markedLines[i].forEach((marker) => {
          marker.clear();
        });
        delete this.markedLines[i];
      }

      const marks: CodeMirror.TextMarker[] = [];
      const line = instance.getLine(i);
      let match: RegExpExecArray | null = null;
      while ((match = pattern.exec(line)) !== null) {
        console.log(match);
        const start = match.index;
        const end = match.index + match[0].length;
        const color = match[1];
        // console.log(instance.getRange({ line: i, ch: start }, { line: i, ch: end }));
        // const line = instance.getLineHandle(i);
        // console.log(line);
        // console.log(instance.getLineTokens(i));
        marks.push(
          instance.markText(
            { line: i, ch: start },
            { line: i, ch: end },
            { css: `color: ${color}; background-color: unset;` }
          )
        );
      }
      if (marks.length > 0) {
        this.markedLines[i] = marks;
      }
      // line.matchAll()
      // if (match) {
      //   console.log(match);
      //   // console.log(instance.getRange({ line: i, ch: match.index }, { line: i, ch: match.index + match[0].length }));
      // }
    }
  }

  private async processor(element: HTMLElement, context: MarkdownPostProcessorContext): Promise<void> {
    console.log(element);
    console.log(context);
  }
}
