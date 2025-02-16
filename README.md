# AI Image Commander (`aic`) CLI Tool

`aic` is a command-line tool for generating AI images interactively. The tool requires a configuration file with your API key and other settings. You can set this up manually or use the interactive configuration wizard.

## Installation

Clone this repository and install dependencies:

```bash
git clone git@github.com:shaper/ai-image-commander.git
cd ai-image-commander
pnpm install
```

## Configuration

The first time you run `aic`, it will automatically create a configuration file at `~/.aic.conf` and guide you through setting up your API keys for various providers.

You can also run the configuration wizard at any time to view or update your settings:

```bash
aic config
```

This command will walk you through viewing and updating your configuration details.

## Building

To build the project, run:

```bash
pnpm build
```

## Running the CLI Tool

You can launch the CLI tool with:

```bash
aic [OPTIONS]
```

### Available Options

- `-d, --dir <directory>`: Directory where generated images will be stored (default: `saved-images`).

### Interactive Commands

Once running, the CLI offers several interactive commands:

- **Prompt Text**: Enter a prompt to generate an AI image.
- **next/n**: Show the next image in the store.
- **open/o**: Open the last generated image.
- **help/h/?**: Display this help message.
- **exit/e**: Exit the application.

## Features

- **Interactive Prompts:** Generate images by simply entering a text prompt.
- **Configuration Wizard:** Easily manage your API key and settings via `aic config`.
- **Provider & Model Selection:** Choose from available providers and image models during image generation.

## License

`aic` is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
