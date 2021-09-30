import { App, Modal } from 'obsidian';
import { ColorPalette } from './interfaces';

export class ManagePalettesModal extends Modal {
  variables!: Record<string, string>;
  palettes!: Record<string, ColorPalette>;

  constructor(
    app: App,
    private readonly addPalette: (key: string, value: ColorPalette) => Promise<boolean>,
    private readonly removePalette: (key: string) => Promise<void>
  ) {
    super(app);
  }

  onOpen(): void {
    this.render();
  }

  private render(): void {
    this.modalEl.addClass('text-color-plugin-modal');
    this.titleEl.setText('Manage Color Palettes');
    this.contentEl.empty();

    const table = this.contentEl.createEl('table', { cls: 'text-color-table--table' });
    const headerRow = table.createEl('tr', { cls: 'text-color-table--table-header' });
    headerRow.createEl('th', { text: 'Palette' });
    headerRow.createEl('th', { text: 'Foreground' });
    headerRow.createEl('th', { text: 'Background' });
    headerRow.createEl('th');

    // Build rows of existing palettes
    if (this.palettes && Object.keys(this.palettes).length > 0) {
      Object.keys(this.palettes).forEach((key) => {
        const row = table.createEl('tr', { cls: 'text-color-table--table-row' });
        row.createEl('td', { text: key });
        const foregroundCell = row.createEl('td', { text: this.getTextValue(this.palettes[key].foreground) });
        foregroundCell.createSpan({
          cls: 'text-color-table--color-square',
          attr: { style: `background-color: ${this.getStyleValue(this.palettes[key].foreground)};` }
        });
        const backgroundCell = row.createEl('td', { text: this.getTextValue(this.palettes[key].background) });
        backgroundCell.createSpan({
          cls: 'text-color-table--color-square',
          attr: { style: `background-color: ${this.getStyleValue(this.palettes[key].background)};` }
        });
        const deleteCell = row.createEl('td', { cls: 'text-color-table--button-cell' });
        const deleteButton = deleteCell.createEl('button', { text: 'Delete' });
        deleteButton.addEventListener('click', () => {
          this.removePalette(key);
          delete this.palettes[key];
          this.render();
        });
      });
    }

    // Build row of inputs for new palettes
    const inputRow = table.createEl('tr', {
      cls: ['text-color-table--table-row', 'text-color-table--input-row']
    });
    const palNameCell = inputRow.createEl('td');
    const palNameInput = palNameCell.createEl('input', { attr: { placeholder: 'Palette', type: 'text' } });

    const palForegroundCell = inputRow.createEl('td');
    const palForegroundInput = palForegroundCell.createEl('input', {
      attr: { placeholder: 'Foreground', type: 'text' }
    });

    const palBackgroundCell = inputRow.createEl('td');
    const palBackgroundInput = palBackgroundCell.createEl('input', {
      attr: { placeholder: 'Background', type: 'text' }
    });

    const addCell = inputRow.createEl('td', { cls: 'text-color-table--button-cell' });
    const addButton = addCell.createEl('button', { cls: 'mod-cta', text: 'Add' });
    addButton.addEventListener('click', async () => {
      if (palNameInput.value && (palForegroundInput.value || palBackgroundInput.value)) {
        const foregroundValue = this.getColorValue(palForegroundInput.value);
        const backgroundValue = this.getColorValue(palBackgroundInput.value);
        const added = await this.addPalette(palNameInput.value, {
          foreground: foregroundValue,
          background: backgroundValue
        });
        if (added) {
          this.palettes[palNameInput.value] = { foreground: foregroundValue, background: backgroundValue };
          this.render();
        }
      }
    });
  }

  private getTextValue(input: string | null): string {
    if (!input) {
      return '-';
    }
    return input;
  }

  private getStyleValue(input: string | null): string {
    if (!input) {
      return 'transparent';
    } else if (input.startsWith('$') && this.variables[input.substring(1)]) {
      return this.variables[input.substring(1)];
    }
    return input;
  }

  private getColorValue(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed) {
      return null;
    } else if (trimmed.startsWith('#') || trimmed.startsWith('$')) {
      return trimmed;
    } else {
      return `#${trimmed}`;
    }
  }
}
