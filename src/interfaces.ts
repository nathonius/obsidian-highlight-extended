export interface ColorPalette {
  foreground: string;
  background: string;
}

export interface PluginSettings {
  colorVariables: Record<string, string>;
  palettes: Record<string, ColorPalette>;
}
