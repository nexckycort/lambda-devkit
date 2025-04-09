#!/usr/bin/env node
import { Command } from 'commander';
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildProjects } from './build.js';
import { getConfig } from './config.js';
export type { LambdaDevkitConfig } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageManager = process.env.npm_execpath?.includes('pnpm')
  ? 'pnpm'
  : process.env.npm_execpath?.includes('yarn')
    ? 'yarn'
    : 'npm';

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
    const { server } = await getConfig();
    if (!server) {
      console.log('server config is requeried');
      return;
    }
    if (options.config) {
      console.log(`Using custom configuration file: ${options.config}`);
    }
    let tsxExecutable!: string;
    if (packageManager === 'pnpm') {
      tsxExecutable = 'pnpm dlx tsx';
    } else {
      tsxExecutable = 'npx tsx';
    }
    const watchOption = options.watch ? ' watch' : '';
    const envFile = server.environment?.ENV
      ? ` --env-file=.env.${server.environment.ENV} `
      : ' ';
    const serverScript = resolve(__dirname, './scripts/server.ts');
    const serializedConfig = `'${JSON.stringify(server)}'`;

    const command = `${tsxExecutable}${watchOption}${envFile}${serverScript} ${serializedConfig}`;

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
    if (options.debug) console.log('Debug mode enabled.');
    if (options.bundle)
      console.log('Bundling all dependencies into a single file.');
    if (options.minify) console.log('Minifying the bundled code.');
    if (options.sourcemap) console.log('Generating source maps.');

    await buildProjects({});
  });

program.parse();
