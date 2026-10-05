import { describe, expect, it } from 'vitest';
import { allModels, MAX_TRIS } from '../scripts/make-models.mjs';
import { RECIPES } from '../scripts/models/recipes.mjs';

const EPS = 0.021; // a model may not stick out of its footprint by more than 2 cm

describe('generated 3D models (recipes in scripts/models/recipes.mjs)', () => {
  for (const { id, model, foot, kind } of allModels()) {
    describe(id, () => {
      const b = model.bounds();
      it('stays inside its footprint and stands on the floor', () => {
        expect(b.min[1]).toBeGreaterThan(-0.01);
        if (kind !== 'character') {
          expect(Math.max(-b.min[0], b.max[0])).toBeLessThanOrEqual(foot[0] / 2 + EPS);
          expect(Math.max(-b.min[2], b.max[2])).toBeLessThanOrEqual(foot[1] / 2 + EPS);
        }
      });

      it('is low-poly', () => {
        expect(model.triangles()).toBeLessThanOrEqual(RECIPES[id].maxTris ?? MAX_TRIS[kind] ?? 3000);
      });

      it('has every triangle facing outward', () => {
        for (const node of model.nodes)
          for (const list of node.prims.values())
            for (const g of list)
              for (let i = 0; i < g.idx.length; i += 3) {
                const [a, bb, c] = [g.idx[i], g.idx[i + 1], g.idx[i + 2]];
                const p = (k) => [g.pos[k * 3], g.pos[k * 3 + 1], g.pos[k * 3 + 2]];
                const [pa, pb, pc] = [p(a), p(bb), p(c)];
                const e1 = pb.map((v, k) => v - pa[k]);
                const e2 = pc.map((v, k) => v - pa[k]);
                const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
                const avg = [0, 1, 2].map((k) => g.nor[a * 3 + k] + g.nor[bb * 3 + k] + g.nor[c * 3 + k]);
                const len = Math.hypot(...n);
                if (len < 1e-10) continue; // a collapsed triangle at a cone tip
                expect(n[0] * avg[0] + n[1] * avg[1] + n[2] * avg[2]).toBeGreaterThan(0);
              }
      });

      it('writes a valid .glb', () => {
        const glb = model.toGLB();
        expect(glb.readUInt32LE(0)).toBe(0x46546c67);
        expect(glb.readUInt32LE(8)).toBe(glb.length);
        const jsonLen = glb.readUInt32LE(12);
        const json = JSON.parse(glb.subarray(20, 20 + jsonLen).toString('utf8'));
        const binLen = glb.readUInt32LE(20 + jsonLen);
        expect(json.buffers[0].byteLength).toBe(binLen);
        for (const v of json.bufferViews) expect(v.byteOffset + v.byteLength).toBeLessThanOrEqual(binLen);
        for (const acc of json.accessors) expect(json.bufferViews[acc.bufferView]).toBeDefined();
        for (const mesh of json.meshes)
          for (const prim of mesh.primitives) expect(json.accessors[prim.attributes.POSITION].count).toBeGreaterThan(0);
      });
    });
  }
});
