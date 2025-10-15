# Skald CLI

This is the official CLI for Skald. It enables you to add memos, chat with your knowledge base, and even generate docs from your knowledge base.

## Installation

```bash
npm install -g @skald-labs/cli

# you should run this before any other commands, it will prompt you for an API key
skald auth
```


## Usage

After installation, you can use the `skald` command:

```bash
# Show help
skald --help

# Authenticate with your API key (first time setup)
skald auth

# Initialize documentation structure
skald docs init

# Add a memo from a file
skald memo add --title "Meeting Notes" --file-path ./notes.md

# Add a memo with tags
skald memo add -t "Project Update" -f ./update.md --tags "project,update"

# Write a memo using vi editor
skald memo write

# Write a memo with tags
skald memo write --tags "meeting,notes"

# Ask a question to your knowledge base
skald chat ask "What are our quarterly goals?"

# Ask about specific topics
skald chat ask "Tell me about the API authentication process"

# Show help for a specific command
skald docs --help

# Generate documentation (uses current directory by default)
skald docs generate

# Generate with custom paths
skald docs generate --config-path ./config --output-path ./dist/docs

# Using short flags
skald docs generate -c ./config -o ./dist/docs
```

## Commands

### Authentication
- `skald auth` - Authenticate with your project API key
  - Prompts for API key and stores it securely in `~/.skald/config` (macOS/Linux) or `%USERPROFILE%\.skald\config` (Windows)
  - **Required**: Must run this command before using any other commands

### Documentation Commands
- `skald docs init` - Initialize documentation structure with example outline.yml
  - `--config-path, -c <path>` - Path to configuration directory (defaults to current directory)
- `skald docs generate` - Generate documentation (requires authentication)
  - `--config-path, -c <path>` - Path to configuration file (defaults to current directory)
  - `--output-path, -o <path>` - Path to output directory (defaults to current directory)
  - **Required files**:
    - `<config-path>/.skald/outline.yml` - Outline configuration file (YAML format)

### Memo Commands
- `skald memo add` - Add a new memo from a file (requires authentication)
  - `--title, -t <title>` - Title of the memo (required)
  - `--file-path, -f <path>` - Path to the file containing memo content (required)
  - `--tags <tags>` - Comma-separated tags for the memo
  - `--source <source>` - Source of the memo (defaults to "cli")
  - `--reference-id <id>` - External reference ID for the memo
- `skald memo write` - Write a new memo using vi editor (requires authentication)
  - `--tags <tags>` - Comma-separated tags for the memo
  - `--source <source>` - Source of the memo (defaults to "cli")
  - `--reference-id <id>` - External reference ID for the memo

### Chat Commands
- `skald chat ask <question>` - Ask a question to your knowledge base (requires authentication)
  - Streams the response in real-time to the console

#### Expected Directory Structure for Documentation

When running `skald docs generate`, your project should have:

```
<config-path>/
└── .skald/
    ├── outline.yml     # Required: documentation outline (YAML format)
```

#### YAML Outline Format

The `outline.yml` file uses the `_docs` key to define documentation files:

```yaml
api:
  _docs:
    - name: authentication.md
      title: Authentication
      description: API authentication guide
  reference:
    _docs:
      - name: user.md
        title: User API
        description: User endpoints

features:
  _docs:
    - name: features.md
      title: Features Overview
```


## Development

Install dependencies:
```bash
npm install
```

Build the project:
```bash
npm run build
```

Link the CLI globally to make the `skald` command available:
```bash
npm link
```

Uninstall:
```bash
npm unlink 
```
