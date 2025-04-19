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

The first time you run `aic`, it will automatically create a configuration file at `~/.aic.conf` and guide you through setting up your API keys for various providers. See [aic.conf.example](aic.conf.example) for the API key names.

To import existing API keys from a .env file during first-time setup:
```bash
aic --from .env
```

To view or update your settings at any time:
```bash
aic config
aic config --from .env  # to import again from elsewhere
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

The CLI offers several interactive commands you can enter at the main prompts:

- **Prompt Text**: Enter prompt text to generate an AI image.
- **next/n**: Show the next image in the store.
- **open/o**: Open the last generated image.
- **help/h/?**: Display this help message.
- **exit/e**: Exit the application.

## Sample Prompt Test

Try these for fun:

```
A Japanese bobtail cat eating ramen in Kyoto at dusk.
A day gecko in the afternoon sun in Kauai in the style of a watercolor painting.
A Northern white rhino on a clifftop looking out toward the Mozambique channel.
```

## Author

Walter Korman &middot; [GitHub](https://github.com/shaper) &middot; [X](https://x.com/shaper) &middot; [LinkedIn](https://www.linkedin.com/in/shaper/)

## License

AI Image Commander is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
