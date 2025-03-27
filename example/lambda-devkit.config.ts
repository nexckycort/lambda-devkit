import type { LambdaDevkitConfig } from '@nexckycort/lambda-devkit';

const config: LambdaDevkitConfig = {
  server: {
    routes: [
      {
        method: 'GET',
        path: 'users',
        lambda: {
          handler: 'functions/getUsers',
        },
      },
    ],
  },
  build: {
    entryPoint: 'functions/**',
    bundle: true,
    minify: true,
    external: ['@aws-sdk/*'],
  },
};

export default config;
