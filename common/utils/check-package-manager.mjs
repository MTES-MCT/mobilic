#!/usr/bin/env node
import { existsSync } from 'fs';
import { resolve } from 'path';

const FORBIDDEN = ['yarn.lock', 'package-lock.json'];
const REQUIRED = 'pnpm-lock.yaml';

const errors = [];

FORBIDDEN.forEach(file => {
  if (existsSync(resolve(file))) {
    errors.push(`❌ Fichier interdit détecté: ${file}`);
  }
});

if (!existsSync(resolve(REQUIRED))) {
  errors.push(`❌ Fichier requis manquant: ${REQUIRED}`);
}

if (errors.length > 0) {
  console.error('\n🚨 ERREUR PACKAGE MANAGER:\n');
  errors.forEach(e => console.error(`  ${e}`));
  console.error('\n💡 Solution: pnpm install\n');
  process.exit(1);
}

console.log('✅ Configuration pnpm valide');
process.exit(0);
