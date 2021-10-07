import { App, PluginSettingTab, Setting } from 'obsidian';
import { VAR_CHAR } from './constants';
import { ColorPalette, PluginSettings } from './interfaces';
import { ManagePalettesModal } from './manage-palettes-modal';
import { ManageVariablesModal } from './manage-variables-modal';
import { HighlightExtendedPlugin } from './plugin';

export class HighlightExtendedSettings extends PluginSettingTab {
  settings: PluginSettings;
  manageVariablesModal = new ManageVariablesModal(
    this.plugin.app,
    this.addColorVariable.bind(this),
    this.removeColorVariable.bind(this)
  );
  managePalettesModal = new ManagePalettesModal(
    this.plugin.app,
    this.addPalette.bind(this),
    this.removePalette.bind(this)
  );
  constructor(app: App, private readonly plugin: HighlightExtendedPlugin, savedSettings: PluginSettings) {
    super(app, plugin);
    this.settings = savedSettings;
  }

  async display(): Promise<void> {
    this.containerEl.empty();
    this.containerEl.createEl('h2', { text: 'Text Colors settings.' });

    // Add syntax before setting
    new Setting(this.containerEl)
      .setName('Color Before Text')
      .setDesc('Look for the extra [color] identifier before the highlighted text.')
      .addToggle((toggle) => {
        toggle.setValue(this.settings.syntaxBefore).onChange((value) => {
          this.saveSetting('syntaxBefore', value);
        });
      });

    // Add manage variables setting
    new Setting(this.containerEl)
      .setName('Color Variables')
      .setDesc(`Define custom colors. Color variables can be referenced using the ${VAR_CHAR} symbol.`)
      .addButton((button) => {
        button.setButtonText('Manage Variables').onClick(() => {
          this.manageVariablesModal.variables = this.settings.colorVariables;
          this.manageVariablesModal.open();
        });
      });

    // Add manage palette setting
    new Setting(this.containerEl)
      .setName('Palettes')
      .setDesc(
        `Define combinations of foreground and background colors. Palettes can be referenced using the ${VAR_CHAR} symbol.`
      )
      .addButton((button) => {
        button.setButtonText('Manage Palettes').onClick(() => {
          this.managePalettesModal.variables = this.settings.colorVariables;
          this.managePalettesModal.palettes = this.settings.palettes;
          this.managePalettesModal.open();
        });
      });
  }

  openManageVariablesModal(): void {
    this.manageVariablesModal.variables = this.settings.colorVariables;
    this.manageVariablesModal.open();
  }

  openManagePalettesModal(): void {
    this.managePalettesModal.variables = this.settings.colorVariables;
    this.managePalettesModal.palettes = this.settings.palettes;
    this.managePalettesModal.open();
  }

  private async saveSetting<K extends keyof PluginSettings>(key: K, value: PluginSettings[K]): Promise<void> {
    this.settings[key] = value;
    await this.plugin.saveData(this.settings);
  }

  private async addColorVariable(key: string, value: string): Promise<boolean> {
    if (!this.settings.colorVariables[key]) {
      const newVariables = { ...this.settings.colorVariables };
      newVariables[key] = value;
      await this.saveSetting('colorVariables', newVariables);
      return true;
    }
    return false;
  }

  private async removeColorVariable(key: string): Promise<void> {
    const newVariables = { ...this.settings.colorVariables };
    delete newVariables[key];
    await this.saveSetting('colorVariables', newVariables);
  }

  private async addPalette(key: string, value: ColorPalette): Promise<boolean> {
    if (!this.settings.palettes[key]) {
      const newPalettes = { ...this.settings.palettes };
      newPalettes[key] = value;
      await this.saveSetting('palettes', newPalettes);
      return true;
    }
    return false;
  }

  private async removePalette(key: string): Promise<void> {
    const newPalettes = { ...this.settings.palettes };
    delete newPalettes[key];
    await this.saveSetting('palettes', newPalettes);
  }
}
