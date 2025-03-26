#!/usr/bin/env node
import { Command } from 'commander';
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getConfig } from './config.js';
export type { LambdaDevkitConfig } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();

program
  .name('lambda-devkit')
  .description(
    'A development toolkit for compiling and running AWS Lambda functions locally with API Gateway simulation.',
  )
  .version('1.0.0');

program
  .command('dev')
  .description(
    'Start a local development server to simulate API Gateway and run Lambda functions.',
  )
  .option(
    '-p, --port <number>',
    'Specify the port for the local server (default: 4000)',
    '4000',
  )
  .option(
    '--watch',
    'Enable watch mode to automatically reload on file changes',
  )
  .option(
    '--config <path>',
    'Specify the path to the configuration file (default: lambda-devkit.config.ts)',
  )
  .action(async (options) => {
    const config = await getConfig();
    if (options.config) {
      console.log(`Using custom configuration file: ${options.config}`);
    }

    const tsxPath = resolve(__dirname, './node_modules/.bin/tsx');
    const command = `${tsxPath}${options.watch ? ' watch' : ''} --env-file=${process.cwd()}/.env.${config.environment?.ENV} ${resolve(__dirname, './scripts/server.ts')} '${JSON.stringify(config)}'`;

    execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  });

program
  .command('build')
  .description(
    'Build your project with versatile bundling and optimization options.',
  )
  .option(
    '--debug',
    'Generate debuggable output by retaining original source code and preserving comments.',
  )
  .option(
    '--bundle',
    'Bundle all dependencies and source code into a single file.',
  )
  .option('--minify', 'Minify the bundled code for optimized performance.')
  .option('--sourcemap', 'Generate source maps for debugging purposes.')
  .action(async (options) => {
    console.log('Building project with the following options:', options);
    if (options.debug) console.log('Debug mode enabled.');
    if (options.bundle)
      console.log('Bundling all dependencies into a single file.');
    if (options.minify) console.log('Minifying the bundled code.');
    if (options.sourcemap) console.log('Generating source maps.');
  });

program.parse();
