import {
  AFTER_EDIT_MODE_PATTERN,
  AFTER_PREVIEW_MODE_PATTERN,
  BEFORE_EDIT_MODE_PATTERN,
  BEFORE_PREVIEW_MODE_PATTERN
} from './constants';
import { HighlightExtendedPlugin } from './plugin';

export class RegexManager {
  constructor(private readonly plugin: HighlightExtendedPlugin) {}

  get editModeRegex(): RegExp {
    return this.plugin.settings.settings.syntaxBefore ? BEFORE_EDIT_MODE_PATTERN : AFTER_EDIT_MODE_PATTERN;
  }

  get previewModeRegex(): RegExp {
    return this.plugin.settings.settings.syntaxBefore ? BEFORE_PREVIEW_MODE_PATTERN : AFTER_PREVIEW_MODE_PATTERN;
  }

  handleEditMatch(match: RegExpExecArray): {
    color: string | null;
    background: string | null;
  } {
    const color = match[1] || null;
    const background = match[2] || null;
    return { color, background };
  }

  handlePreviewMatch(match: RegExpExecArray, innerHTML: string): string {
    // Match indicies are different depending on syntax placement
    const syntaxBefore = this.plugin.settings.settings.syntaxBefore;
    const markMatchId = syntaxBefore ? 4 : 1;
    const syntaxMatchId = syntaxBefore ? 1 : 2;
    const colorMatchId = syntaxBefore ? 2 : 3;
    const backgroundMatchId = syntaxBefore ? 3 : 4;

    const mark = match[markMatchId];
    const syntax = match[syntaxMatchId];
    const color = match[colorMatchId] || null;
    const backgroundColor = match[backgroundMatchId] || null;

    let newInnerHTML = innerHTML;

    // Remove the [color]
    if (syntaxBefore) {
      newInnerHTML = `${newInnerHTML.substring(0, match.index)}${newInnerHTML.substring(match.index + syntax.length)}`;
    } else {
      newInnerHTML = `${newInnerHTML.substring(0, match.index + mark.length)}${newInnerHTML.substring(
        match.index + mark.length + syntax.length
      )}`;
    }

    // Add the styling
    newInnerHTML = `${newInnerHTML.substring(0, match.index + 5)} style="${this.plugin.getCSS(
      color,
      backgroundColor
    )};"${newInnerHTML.substring(match.index + 5)}`;

    return newInnerHTML;
  }
}
