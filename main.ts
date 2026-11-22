// Halcyon Vault hand-in: copy game/ and screenshots/ from this repository
// to the output directory and write dossier.json with buildDossier from
// vendor/makefun-game.ts. Node 22 standard library only. Deterministic:
// the same repository always writes the same bytes.

import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

for (const name of ['game', 'screenshots']) {
  cpSync(join(repoRoot, name), join(outputDir, name), { recursive: true });
}

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});

writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`Wrote ${outputDir}/dossier.json (${dossier.length} bytes)`);
