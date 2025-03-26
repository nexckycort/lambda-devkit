#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

const pkg = await import(`${cwd()}/package.json`, {
  with: { type: 'json' },
}).then((value) => value.default);

const projectRoot = join(cwd(), 'dist', 'package.json');

Reflect.deleteProperty(pkg, 'scripts');
Reflect.deleteProperty(pkg, 'devDependencies');

writeFileSync(projectRoot, JSON.stringify(pkg, null, '  '));
