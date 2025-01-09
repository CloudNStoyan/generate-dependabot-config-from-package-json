# `@elbaph/generate-dependabot-config-from-package-json`

[![NPM Version](https://img.shields.io/npm/v/%40elbaph%2Fgenerate-dependabot-config-from-package-json)](https://www.npmjs.com/package/@elbaph/generate-dependabot-config-from-package-json)
[![NPM License](https://img.shields.io/npm/l/%40elbaph%2Fgenerate-dependabot-config-from-package-json)](https://github.com/CloudNStoyan/elbaph/blob/main/generate-dependabot-config-from-package-json/LICENSE)

A CLI for generating dependabot config from package.json

## Usage

```sh
# Generate .github/dependabot.yml from root level package.json
$ npx @elbaph/generate-dependabot-config-from-package-json

# Generate .github/dependabot.yml from specific package.json
$ npx @elbaph/generate-dependabot-config-from-package-json ./package.json

# Generate .github/dependabot.yml from many package.json files
$ npx @elbaph/generate-dependabot-config-from-package-json ./package.json ./mock-app/package.json
```

## Configuration

The CLI supports many ways to customize the generated dependabot.yml config

### Options

#### help

Show help information and exit.

In the CLI: --help, -h

```sh
$ npx @elbaph/generate-dependabot-config-from-package-json --help
```

#### version

Print the current version of the CLI and exit.

In the CLI: --version, -v

```sh
$ npx @elbaph/generate-dependabot-config-from-package-json --help
```

#### labels

Specify your own labels separated by a comma(,) for all pull requests raised by dependabot (default: "dependencies").

In the CLI: --labels

```sh
$ npx @elbaph/generate-dependabot-config-from-package-json --labels <label1>
# OR
$ npx @elbaph/generate-dependabot-config-from-package-json --labels <label1,label2>
```

#### output

The output path of the generated dependabot.yml config (default: ".github").

In the CLI: --output, -o

```sh
$ npx @elbaph/generate-dependabot-config-from-package-json --output <path/to/dependabot/config/folder>
```

#### no-major-updates

Disallow dependabot to raise PRs for major semver updates for all dependencies.

In the CLI: --no-major-updates

```sh
$ npx @elbaph/generate-dependabot-config-from-package-json --no-major-updates
```

#### no-minor-updates

Disallow dependabot to raise PRs for minor semver updates for all dependencies.

In the CLI: --no-minor-updates

```sh
$ npx @elbaph/generate-dependabot-config-from-package-json --no-minor-updates
```

#### no-patch-updates

Disallow dependabot to raise PRs for patch semver updates for all dependencies.

In the CLI: --no-patch-updates

```sh
$ npx @elbaph/generate-dependabot-config-from-package-json --no-patch-updates
```

#### separate-security-fixes

Whether or not to separate security fixes into their own 2 groups (default: true)

In the CLI: --separate-security-fixes

```sh
$ npx @elbaph/generate-dependabot-config-from-package-json --separate-security-fixes
```

#### schedule-interval

Define whether to look for version updates: daily, weekly, or monthly (choices: "daily", "weekly", "monthly").

In the CLI: --schedule-interval

```sh
$ npx @elbaph/generate-dependabot-config-from-package-json --schedule-interval <interval>
```

#### versioning-strategy

Define how dependabot should edit manifest files (choices: "auto", "increase", "increase-if-necessary", "lockfile-only", "widen").

In the CLI: --versioning-strategy

```sh
$ npx @elbaph/generate-dependabot-config-from-package-json --versioning-strategy <strategy>
```
