#!/usr/bin/env node

import path from 'node:path';
import fs from 'node:fs';
import { program, Option } from 'commander';
import yaml from 'yaml';
import c from 'tinyrainbow';
import { type GeneratorOptions, generateConfig } from './generate.js';

program
  .name('generate-dependabot-config-from-package-json')
  .description('CLI for generating dependabot config from package.json')
  .version('1.0.0');

program
  .option(
    '--labels <string>',
    'specify your own labels separated by a comma(,) for all pull requests raised by dependabot',
    'dependencies'
  )
  .option(
    '-o, --output <string>',
    'the output path of the generated dependabot.yml config',
    '.github'
  )
  .option(
    '--no-major-updates',
    'disallow dependabot to raise PRs for major semver updates for all dependencies'
  )
  .option(
    '--no-minor-updates',
    'disallow dependabot to raise PRs for minor semver updates for all dependencies'
  )
  .option(
    '--no-patch-updates',
    'disallow dependabot to raise PRs for patch semver updates for all dependencies'
  )
  .option(
    '--separate-security-fixes',
    'whether or not to separate security fixes into their own 2 groups',
    true
  )
  .addOption(
    new Option(
      '--schedule-interval',
      'define whether to look for version updates: daily, weekly, or monthly'
    )
      .default('weekly')
      .choices(['daily', 'weekly', 'monthly'])
  )
  .addOption(
    new Option(
      '--versioning-strategy',
      'define how dependabot should edit manifest files'
    )
      .default('increase')
      .choices([
        'auto',
        'increase',
        'increase-if-necessary',
        'lockfile-only',
        'widen',
      ])
  )
  .argument('[string...]', 'the path to the package.json file', 'package.json');

program.parse();

const options = program.opts() as GeneratorOptions;

const args = program.args;

const yamlSerializerOptions = {
  singleQuote: true,
  aliasDuplicateObjects: false,
};

try {
  const dependabotConfigYaml = yaml.stringify(
    generateConfig(options, args),
    yamlSerializerOptions
  );

  fs.mkdirSync(path.join(process.cwd(), options.output), { recursive: true });
  fs.writeFileSync(
    path.join(process.cwd(), options.output, 'dependabot.yml'),
    dependabotConfigYaml
  );
} catch (error) {
  console.error(
    c.red('There were unhandled errors during the dependabot config generation')
  );

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  if (process.exitCode === null) {
    process.exitCode = 1;
  }

  process.exit();
}
