## Highlight Extended

An Obsidian plugin that extends the Obsidian highlight syntax to support custom foreground and background colors.

## Install

~~Install from the community plugin registry~~ or by cloning this repo into your `.obsidian/plugins` folder and enable the plugin.

## Use

To set the color for a highlight, add `{foreground;background}` before or after the highlighted text, depending on how the plugin is configured. For example:

`{#12263A;#06BCC1}==highlighted text==`

or

`==highlighted text=={#12263A;#06BCC1}`

Colors are not limited to hex codes; any valid CSS color will do like `hsl`, `rgb`, or even a css variable. However, long color codes or hsl values can be difficult to remember on the fly, so you can also use custom color variables defined in plugin settings with an `@`:

`{@fancyfg;@fancybg}==highlighted text==`

To set only the foreground color, do not specify a background color:

`{@foreground}==highlighted text==`

Similarly, to set only the background color, provide only a background color after a semi-colon:

`{;@background}==highlighted text==`

### Custom variables

Accessed in plugin settings or via the `Manage color variables` command.

### Custom palettes

Accessed in plugin settings or via the `Manage color palettes` command. Palettes act exactly like color variables, except they allow configuring both a foreground and background color. To use them, provide only the palette variable:

`{@paletteName}==highlighted text==`

Custom color palettes can make use of custom color variables.

## Contributing

I'd welcome any and all PRs for fixes and new features.
