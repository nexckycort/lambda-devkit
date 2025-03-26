#!/usr/bin/env tsx
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import http from 'node:http';
import { join } from 'node:path';
// @ts-ignore
import type { LambdaDevkitConfig } from '../src/config.js';
import { createApiGatewayEvent } from './utils.js';

interface LambdaModule {
  handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
}

const [, , configRaw] = process.argv;
const config: LambdaDevkitConfig = JSON.parse(configRaw ?? '{}');

async function importLambda(handlerPath: string): Promise<LambdaModule> {
  const modulePath = join(process.cwd(), `${handlerPath}/index.ts`);
  return (await import(modulePath)) as unknown as LambdaModule;
}

interface RouteHandler {
  method: string;
  lambda: LambdaModule;
  isWildcard: boolean;
  path: string;
}

const routeMap: RouteHandler[] = [];
for (const route of config.routes) {
  const fullPath = route.path.startsWith('/') ? route.path : `/${route.path}`;
  routeMap.push({
    method: route.method,
    lambda: await importLambda(route.lambda.handler),
    isWildcard: fullPath === '*' || fullPath.includes('*'),
    path: fullPath,
  });
}

try {
  const server = http.createServer(async (req, res) => {
    console.log(`[${req.method}] ${req.url}`);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Si es una solicitud preflight, responde inmediatamente.
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const path = url.pathname;

    const event = createApiGatewayEvent(req);

    event.body = await new Promise((resolve, reject) => {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        resolve(body);
      });

      req.on('error', (err) => {
        reject(err);
      });
    });

    try {
      let matchedRoute: RouteHandler | undefined;

      for (const route of routeMap) {
        if (route.path === '*') {
          // Coincidencia global (*)
          matchedRoute = route;
          break;
        }
        if (route.path.includes('*')) {
          // Coincidencia parcial (usando comodines como /users/*)
          const regex = new RegExp(`^${route.path.replace('*', '.*')}$`);
          if (regex.test(path)) {
            matchedRoute = route;
            break;
          }
        } else if (route.path === path) {
          // Coincidencia exacta
          matchedRoute = route;
          break;
        }
      }

      if (!matchedRoute) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Ruta no encontrada' }));
        return;
      }

      const response = await matchedRoute.lambda.handler(event);

      res.writeHead(response.statusCode, {
        'Content-Type': 'application/json',
      });
      res.end(response.body);
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);

      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Error interno del servidor' }));
    }
  });

  const PORT = +(config.port ?? 4000);
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
} catch (err) {
  console.error('Error reading directory:', err);
}
