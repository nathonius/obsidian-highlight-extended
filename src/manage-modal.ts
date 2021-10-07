import { Modal } from 'obsidian';
import { VAR_CHAR } from './constants';

export abstract class ManageModal extends Modal {
  variables!: Record<string, string>;

  /**
   * Given a string, return the string or -
   */
  protected getTextValue(input: string | null): string {
    if (!input) {
      return '-';
    }
    return input;
  }

  /**
   * Evaluate variables and return the value of a color
   */
  protected getStyleValue(input: string | null): string {
    if (!input) {
      return 'transparent';
    } else if (input.startsWith(VAR_CHAR) && this.variables[input.substring(1)]) {
      return this.variables[input.substring(1)];
    }
    return input;
  }

  /**
   * Given a color that could be a variable or a hex color,
   * or null returns null or a hex color
   */
  protected getColorValue(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed) {
      return null;
    } else {
      return trimmed;
    }
  }
}
