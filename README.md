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
npm install @nexckycort/lambda-devkit --save-dev
```

---

## Quick Start

1. **Create a Configuration File**  
   Create a file named `lambda-devkit.config.ts` in the root of your project. Here's an example configuration:

   ```typescript
   const config = {
     "routes": [
       {
         "method": "GET",
         "path": "users",
         "lambda": {
           "handler": "src/getUsers",
           "timeout": 5000
         }
       },
       {
         "method": "POST",
         "path": "users",
         "lambda": {
           "handler": "src/createUser",
           "timeout": 10000
         }
       }
     ],
     "port": 4000
   }

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

The configuration file (`lambda-devkit.config.ts`) allows you to define routes, handlers, and other settings. Below is a detailed explanation of each field:

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
| `handler`     | `string`         | Path to the folder containing the Lambda handler (e.g., `src/myFunction`). |
| `timeout`     | `number`         | Maximum execution time for the Lambda function in milliseconds.            |

### `port`

The port on which the local server will run. Default: `4000`.

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
const config = {
  "routes": [
    {
      "method": "GET",
      "path": "users",
      "lambda": {
        "handler": "src/getUsers",
        "timeout": 5000
      }
    }
  ],
  "port": 4000
}

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
