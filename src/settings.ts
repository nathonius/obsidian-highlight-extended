import { App, PluginSettingTab, Setting } from 'obsidian';
import { ColorPalette, PluginSettings } from './interfaces';
import { ManageVariablesModal } from './modal';
import { TextColorsPlugin } from './plugin';

export class TextColorsSettings extends PluginSettingTab {
  settings: PluginSettings;
  manageVariablesModal = new ManageVariablesModal(
    this.plugin.app,
    this.addColorVariable.bind(this),
    this.removeColorVariable.bind(this)
  );
  constructor(app: App, private readonly plugin: TextColorsPlugin, savedSettings: PluginSettings) {
    super(app, plugin);
    this.settings = savedSettings;
  }

  async display(): Promise<void> {
    this.containerEl.empty();
    this.containerEl.createEl('h2', { text: 'Text Colors settings.' });
    new Setting(this.containerEl)
      .setName('Color Variables')
      .setDesc('Define custom colors.')
      .addButton((button) => {
        button.setButtonText('Manage Variables').onClick(() => {
          this.manageVariablesModal.variables = this.settings.colorVariables;
          this.manageVariablesModal.open();
        });
      });
    new Setting(this.containerEl)
      .setName('Palettes')
      .setDesc('Define combinations of foreground and background colors.')
      .addButton((button) => {
        button.setButtonText('Manage Palettes').onClick(() => {
          console.log('manage palettes');
        });
      });
  }

  private async saveSetting<K extends keyof PluginSettings>(key: K, value: PluginSettings[K]): Promise<void> {
    this.settings[key] = value;
    await this.plugin.saveData(this.settings);
  }

  private async addColorVariable(key: string, value: string): Promise<void> {
    console.log(this.settings);
    const newVariables = { ...this.settings.colorVariables };
    newVariables[key] = value;
    await this.saveSetting('colorVariables', newVariables);
  }

  private async removeColorVariable(key: string): Promise<void> {
    const newVariables = { ...this.settings.colorVariables };
    delete newVariables[key];
    await this.saveSetting('colorVariables', newVariables);
  }

  private async addPalette(key: string, value: ColorPalette): Promise<void> {
    const newPalettes = { ...this.settings.palettes };
    newPalettes[key] = value;
    await this.saveSetting('palettes', newPalettes);
  }

  private async removePalette(key: string): Promise<void> {
    const newPalettes = { ...this.settings.palettes };
    delete newPalettes[key];
    await this.saveSetting('palettes', newPalettes);
  }
}
