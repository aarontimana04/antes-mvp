import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const dist = new URL('dist/', root);
const target = new URL('streamlit_frontend/', root);
const files = await readdir(dist);
if (!files.includes('index.html')) throw new Error('Ejecuta primero npm run build.');
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(dist, target, { recursive: true });
console.log(`Frontend preparado: ${fileURLToPath(target)}`);
