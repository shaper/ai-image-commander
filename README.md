# AI Image Commander (`aic`) CLI Tool

<img src="assets/quetzal.jpg" width="256" align="left" style="margin-right: 10px" alt="A resplendent quetzal, the official mascot of AI Image Commander">

AI Image Commander (`aic`) is a command-line tool for generating AI images interactively. `aic` is built with the [AI SDK by Vercel](https://sdk.vercel.ai/) and supports a variety of providers and models.

<br clear="all">

## Features

- **Interactive Prompts:** Generate images by simply entering a text prompt.
- **Configuration Wizard:** Easily manage your API key and settings via `aic config`.
- **Provider & Model Selection:** Choose from available providers and image models during image generation.

## Installation

As a command-line tool, installing it globally is most useful so that it's available in your `PATH`, allowing you to run `aic` from any directory.

```bash
pnpm install -g ai-image-commander
```

## Configuration

The first time you run `aic` it will automatically create a configuration file at `~/.aic.conf` and guide you through setting up your API keys for various providers. See [aic.conf.example](aic.conf.example) for the API key names. If you already have a configuration file with some of these API keys, you can import it during first run:

```bash
aic --from .env
```

You can also run the configuration wizard at any time to view or update your settings:

```bash
aic config
```

This command will walk you through viewing and updating your configuration details. If you already have a configuration file with some or all of the involved API keys with the same names, you can import settings from an existing file:

```bash
aic config --from .env
```

## Running the CLI Tool

You can launch the CLI tool with:

```bash
aic [OPTIONS]
```

### Available Options

- `-d, --dir <directory>`: Directory where generated images will be stored (default: `saved-images`).
- `--from <file>`: Path to an existing .env or config file to import settings from. This is useful for first-time setup or when running `aic config`.

### Interactive Commands

Once running, the CLI offers several interactive commands you can enter at the main prompts:

- **Prompt Text**: Enter your sprompt text to generate an AI image.
- **next/n**: Show the next image in the store.
- **open/o**: Open the last generated image.
- **help/h/?**: Display this help message.
- **exit/e**: Exit the application.

## Sample Prompts

Try these for fun:

```
A Japanese bobtail cat eating ramen in Kyoto at dusk, in the style of ukiyo-e.
A day gecko winking at you in the afternoon sun against the natural wonder of Kauai forests, in the style of watercolor.
A Northern white rhino and an egret playing video games in a condo in Hong Kong at night.
```

## Author

Walter Korman &middot; [GitHub](https://github.com/shaper) &middot; [X](https://x.com/shaper) &middot; [LinkedIn](https://www.linkedin.com/in/shaper/)

## License

AI Image Commander is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
