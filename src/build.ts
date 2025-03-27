import { type BuildOptions, build as esbuild } from 'esbuild';
import { type LambdaDevkitConfig, getConfig } from './config.js';

type OptionsCommandBuild = {
  debug?: boolean;
  bundle?: boolean;
  minify?: boolean;
  sourcemap?: boolean;
};

function logBuildTime(startTime: number) {
  const endTime = performance.now();
  const elapsedTimeInMilliseconds = Number(endTime - startTime);
  const formattedTime =
    elapsedTimeInMilliseconds >= 1000
      ? (elapsedTimeInMilliseconds / 1000).toFixed(3)
      : Math.ceil(elapsedTimeInMilliseconds);
  const timeUnit = elapsedTimeInMilliseconds >= 1000 ? 's' : 'ms';
  console.log(`\x1b[32mDone in ${formattedTime}${timeUnit}.\x1b[0m`);
}

function updateConfigForBuild(
  config: BuildOptions,
  options: OptionsCommandBuild,
  build: LambdaDevkitConfig['build'],
) {
  if (options?.bundle || build?.bundle) {
    config.bundle = true;
    config.packages = undefined;
    config.external = ['@aws-sdk/*'];

    // Update entry points to include `index.*` files
    if (Array.isArray(config.entryPoints)) {
      config.entryPoints = config.entryPoints.map(
        (entry) => `${entry}/index.*`,
      );
    }
  } else {
    config.external = undefined;
  }

  if (options?.minify) {
    config.minify = true;
  }
  if (options?.sourcemap || build?.sourcemap) {
    config.sourcemap = options?.sourcemap ?? build?.sourcemap;
  }
  if (build?.external && config?.bundle) {
    config.external = build.external;
  }
}

export async function buildProjects(options: OptionsCommandBuild) {
  const startTime = performance.now();
  try {
    const { build: buildConfig } = await getConfig();

    const config: BuildOptions = {
      entryPoints: buildConfig?.entryPoint
        ? [buildConfig.entryPoint]
        : ['functions/**'],
      bundle: false,
      minify: false,
      platform: 'node',
      target: 'node22',
      outdir: 'dist',
      outbase: buildConfig?.outbase ?? 'functions',
      format: 'cjs',
      packages: 'external',
      loader: {
        '.env': 'empty',
        '.example': 'empty',
      },
    };

    Object.assign(config, buildConfig);
    Reflect.deleteProperty(config, 'entryPoint');

    updateConfigForBuild(config, options, buildConfig);

    await esbuild(config);
    logBuildTime(startTime);
  } catch (error) {
    console.error('\x1b[31mBuild failed:\x1b[0m', error);
    process.exit(1);
  }
}
