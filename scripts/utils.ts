import type { APIGatewayProxyEvent } from 'aws-lambda';
import type { IncomingMessage } from 'node:http';

export function createApiGatewayEvent(req: IncomingMessage) {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method || 'GET';

  return {
    resource: req.url,
    httpMethod: method,
    path: path,
    pathParameters: {},
    queryStringParameters: Object.fromEntries(url.searchParams.entries()),
    headers: req.headers,
    body: '',
    requestContext: {
      domainName: 'example',
    },
  } as APIGatewayProxyEvent;
}
