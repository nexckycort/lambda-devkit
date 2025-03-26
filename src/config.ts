import { cosmiconfig } from 'cosmiconfig';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface LambdaConfig {
  /**
   * Path to the folder containing the Lambda handler.
   * The folder must contain an `index.js` or `index.ts` file with the exported handler function.
   * Example: "functions/myFunction"
   * This implies the handler is located at "functions/myFunction/index.handler".
   */
  handler: string;
  /**
   * Maximum execution time for the Lambda function in milliseconds.
   * Default: 30seg (30000).
   */
  timeout?: number;
}

interface RouteConfig {
  method: HttpMethod | 'ALL';
  /**
   * Path for the route. Supports wildcard patterns like `users/*` for dynamic routing.
   */
  path: string;
  /**
   * Configuration for the Lambda function that handles requests to this route.
   */
  lambda: LambdaConfig;
}

export type LambdaDevkitConfig = {
  /**
   * List of routes and their configurations.
   * Each route maps an HTTP method and path to a Lambda function.
   */
  routes: RouteConfig[];
  /**
   * Port on which the local server will run.
   * Default: 4000
   */
  port?: number;
  /**
   * Environment variables to be passed to the Lambda function.
   * These variables are used to configure the runtime environment of the Lambda function.
   *
   * @property {string} ENV - The environment in which the Lambda function is running.
   *                          Possible values:
   *                          - 'prod': Production environment.
   *                          - 'qa': Quality Assurance environment.
   *                          - 'dev': Development environment.
   *                          - 'local': Local development environment.
   *                          Default: 'local'.
   */
  environment?: {
    ENV: 'prod' | 'qa' | 'dev' | 'local';
  };
};

const moduleName = 'lambda-devkit';
export const getConfig = async () => {
  const explorer = cosmiconfig(moduleName, {
    searchPlaces: [
      `${moduleName}.config.ts`,
      `${moduleName}.config.js`,
      `${moduleName}.config.json`,
    ],
  });
  const searchedConfig = await explorer.search();
  if (!searchedConfig?.config) {
    throw new Error(
      `Configuration file not found. Please create a ${moduleName}.config.{ts,js,json} file.`,
    );
  }

  const config: LambdaDevkitConfig = Object.assign(
    { port: 4000, environment: { ENV: 'local' } },
    searchedConfig.config,
  );
  for (const route of config.routes) {
    if (!route.lambda?.timeout) {
      route.lambda.timeout = 30000;
    }
  }

  return config;
};
