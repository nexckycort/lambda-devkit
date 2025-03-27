# Lambda DevKit

[![npm version](https://img.shields.io/npm/v/@nexckycort/lambda-devkit.svg)](https://www.npmjs.com/package/@nexckycort/lambda-devkit)
[![License](https://img.shields.io/npm/l/@nexckycort/lambda-devkit.svg)](https://github.com/nexckycort/lambda-devkit/blob/main/LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/nexckycort/lambda-devkit/ci.yml?branch=main)](https://github.com/nexckycort/lambda-devkit/actions)

A development toolkit for compiling and running AWS Lambda functions locally with API Gateway simulation.

---

## Features

- **Local Execution**: Run your AWS Lambda functions locally without deploying to AWS.
- **API Gateway Simulation**: Simulate API Gateway routes and methods (e.g., GET, POST, PUT, DELETE).
- **Compilation Support**: Automatically compile TypeScript or JavaScript Lambda functions.
- **Flexible Configuration**: Define routes, handlers, and environment variables in a simple configuration file.
- **Developer-Friendly CLI**: Use the `ldk` command to manage and test your Lambda functions.

---

## Installation

Install the package as a project dependency:

```bash
pnpm add @nexckycort/lambda-devkit -D
```

---

## Quick Start

1. **Create a Configuration File**  
  Create a file named `lambda-devkit.config.ts` in the root of your project. Here's an example configuration:

  ```typescript
  import type { LambdaDevkitConfig } from '@nexckycort/lambda-devkit';

  const config: LambdaDevkitConfig = {
    server: {
      routes: [
        {
          method: 'GET',
          path: 'users',
          lambda: {
            handler: 'functions/getUsers',
            timeout: 5000,
          },
        },
        {
          method: 'POST',
          path: 'users',
          lambda: {
            handler: 'functions/createUser',
            timeout: 10000,
          },
        },
      ],
      port: 4000,
      environment: {
        ENV: 'dev',
      },
    },
    build: {
      bundle: true,
      minify: true,
      external: ['@aws-sdk/*'],
    },
  };

  export default config;
   ```

2. **Start the Local Server**  
   Run the following command to start the local server:

   ```bash
   ldk dev
   ```

3. **Test Your Endpoints**  
   Use tools like [Postman](https://www.postman.com/) or `curl` to test your endpoints:

   ```bash
   curl http://localhost:4000/users
   ```

---

## Usage

### Commands

The `ldk` CLI provides the following commands:

| Command          | Description                                         |
|------------------|-----------------------------------------------------|
| `ldk dev`        | Start the local server with API Gateway simulation. |
| `ldk build`      | Compile your Lambda functions.                      |

### Example

Here’s an example of how to use the CLI:

```bash
# Build your Lambda functions
ldk build

# Start the local server
ldk dev
```

---

## Configuration

Lambda DevKit uses a configuration file (`lambda-devkit.config.ts`) to define routes, handlers, and other settings. Below is a detailed explanation of each field:

### `server`

Server configuration for local development.

| Field         | Type             | Description                                                                 |
|---------------|------------------|-----------------------------------------------------------------------------|
| `routes`      | `RouteConfig[]`  | List of routes and their configurations.                                   |
| `port`        | `number`         | Port on which the local server will run. Default: `4000`.                  |
| `environment` | `object`         | Environment variables to be passed to the Lambda function.                 |

### `routes`

An array of route configurations. Each route maps an HTTP method and path to a Lambda function.

| Field         | Type             | Description                                                                 |
|---------------|------------------|-----------------------------------------------------------------------------|
| `method`      | `string`         | HTTP method (e.g., `GET`, `POST`, `PUT`, `DELETE`).                         |
| `path`        | `string`         | Path for the route. Supports wildcards like `users/*`.                     |
| `lambda`      | `LambdaConfig`   | Configuration for the Lambda function that handles requests to this route. |

### `lambda`

Configuration for a Lambda function.

| Field         | Type             | Description                                                                 |
|---------------|------------------|-----------------------------------------------------------------------------|
| `handler`     | `string`         | Path to the folder containing the Lambda handler (e.g., `functions/myFunction`). |
| `timeout`     | `number`         | Maximum execution time for the Lambda function in milliseconds.            |

### `build`

Build configuration for the Lambda functions.

| Field         | Type             | Description                                                                 |
|---------------|------------------|-----------------------------------------------------------------------------|
| `entryPoint`  | `string`         | Entry point for the build process. Default: `"functions/**"`.              |
| `bundle`      | `boolean`        | Whether to bundle the Lambda function code into a single file.             |
| `minify`      | `boolean`        | Whether to minify the Lambda function code during the build process.       |
| `sourcemap`   | `boolean \| string` | Sourcemap generation options (`true`, `'linked'`, `'inline'`, etc.).    |
| `outbase`     | `string`         | Base directory for resolving entry points. Default: `"functions"`.         |
| `external`    | `string[]`       | External libraries that should be excluded from the build. Default: `["@aws-sdk/*"]`. |

---

## Examples

### Basic Example

Here’s a simple example of a Lambda function and its configuration:

#### `src/getUsers/index.ts`

```typescript
export const handler = async (event: any) => {
  console.log("Event:", event);

  return {
    statusCode: 200,
    body: JSON.stringify([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]),
  };
};
```

#### `lambda-devkit.config.ts`

```typescript
import type { LambdaDevkitConfig } from '@nexckycort/lambda-devkit';

const config: LambdaDevkitConfig = {
  server: {
    routes: [
      {
        method: 'GET',
        path: 'users',
        lambda: {
          handler: 'functions/getUsers'
        },
      },
    ],
    port: 4000,
  },
  build: {
    bundle: true,
    minify: true,
    external: ['@aws-sdk/*'],
  },
};

export default config;
```

Run the server:

```bash
ldk dev
```

Test the endpoint:

```bash
curl http://localhost:4000/users
```

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
