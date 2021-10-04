import { EDIT_MODE_PATTERN, PREVIEW_MODE_PATTERN } from './constants';
import { TextColorsPlugin } from './plugin';

export class RegexManager {
  constructor(private readonly plugin: TextColorsPlugin) {}

  get editModeRegex(): RegExp {
    return EDIT_MODE_PATTERN;
  }

  get previewModeRegex(): RegExp {
    return PREVIEW_MODE_PATTERN;
  }

  handleEditMatch(match: RegExpExecArray): {
    start: number;
    end: number;
    color: string | null;
    background: string | null;
  } {
    const start = match.index;
    const end = match.index + match[0].length;
    const color = match[1] || null;
    const background = match[3] || null;
    return { start, end, color, background };
  }

  handlePreviewMatch(match: RegExpExecArray, innerHTML: string): string {
    const color = match[3] || null;
    const backgroundColor = match[5] || null;

    let newInnerHTML = innerHTML;

    // Remove the [color]
    newInnerHTML = `${newInnerHTML.substring(0, match.index + match[1].length)}${newInnerHTML.substring(
      match.index + match[1].length + match[2].length
    )}`;

    // Add the styling
    newInnerHTML = `${newInnerHTML.substring(0, match.index + 5)} style="${this.plugin.getCSS(
      color,
      backgroundColor
    )};"${newInnerHTML.substring(match.index + 5)}`;

    return newInnerHTML;
  }
}
