export interface ColorPalette {
  foreground: string | null;
  background: string | null;
}

export interface PluginSettings {
  colorVariables: Record<string, string>;
  palettes: Record<string, ColorPalette>;
  syntaxBefore: boolean;
}
