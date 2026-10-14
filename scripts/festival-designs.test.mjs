import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const designs = JSON.parse(readFileSync(resolve(root, 'src/lib/festival-designs.json'), 'utf8'));
const experience = readFileSync(resolve(root, 'src/components/FestivalExperience.tsx'), 'utf8');
const culture = readFileSync(resolve(root, 'src/components/FestivalCultureScene.tsx'), 'utf8');

test('every festival identity has complete visual tokens and artwork', () => {
  const ids = Object.keys(designs);
  assert.ok(ids.length >= 30);
  for (const id of ids) {
    const design = designs[id];
    assert.ok(design.effect && design.composition && design.typography && design.eyebrow && design.buttonStyle, id);
    assert.ok(existsSync(resolve(root, 'public/festivals', `${id}.svg`)), `${id} artwork missing`);
  }
});

test('every predefined festival is routed to a bespoke hero scene', () => {
  const presetIds = Object.keys(designs).filter(id => id !== 'custom');
  const routedIds = new Set([...experience.matchAll(/\[([^\]]+)\]\.includes\(theme\.source/g)]
    .flatMap(([, list]) => [...list.matchAll(/'([a-z0-9-]+)'/g)].map(([, id]) => id)));
  const artIds = new Set([...culture.matchAll(/^\s*'?([a-z][a-z0-9-]*)'?: \{ className:/gm)].map(([, id]) => id));
  const motionIds = new Set([...culture.matchAll(/^\s*'?([a-z][a-z0-9-]*)'?: \{ target:/gm)].map(([, id]) => id));
  for (const id of presetIds) {
    assert.ok(routedIds.has(id), `${id} is not routed to a bespoke hero scene`);
    if (!['diwali', 'makar-sankranti', 'holi', 'christmas'].includes(id)) {
      assert.ok(artIds.has(id), `${id} has no individual culture-scene art direction`);
      assert.ok(motionIds.has(id), `${id} has no individual culture-scene motion recipe`);
    }
  }
});
