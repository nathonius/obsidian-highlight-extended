import { App, Modal, setIcon } from 'obsidian';

export class ManageVariablesModal extends Modal {
  variables!: Record<string, string>;

  constructor(
    app: App,
    private readonly addVariable: (key: string, value: string) => Promise<void>,
    private readonly removeVariable: (key: string) => Promise<void>
  ) {
    super(app);
  }

  onOpen(): void {
    this.render();
  }

  private render(): void {
    this.contentEl.empty();
    this.contentEl.createDiv('Manage Color Variables');
    Object.keys(this.variables).forEach((key) => {
      const variableContainer = this.contentEl.createDiv();
      variableContainer.createSpan({ text: key });
      variableContainer.createSpan({ text: this.variables[key] });
      const deleteButton = variableContainer.createEl('button', { attr: { 'aria-label': 'Delete' } });
      setIcon(deleteButton, 'trash');
      deleteButton.addEventListener('click', () => {
        this.removeVariable(key);
        delete this.variables[key];
        this.render();
      });
    });
    const inputContainer = this.contentEl.createDiv({ cls: 'setting-item-control' });
    const varNameInput = inputContainer.createEl('input', { attr: { placeholder: 'Variable', type: 'text' } });
    const varValueInput = inputContainer.createEl('input', { attr: { placeholder: 'Value', type: 'text' } });
    const addButton = inputContainer.createEl('button', { text: 'Add' });
    addButton.addEventListener('click', () => {
      this.addVariable(varNameInput.value, varValueInput.value);
      this.variables[varNameInput.value] = varValueInput.value;
      this.render();
    });
  }
}
