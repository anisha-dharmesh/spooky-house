// Builds the models, then takes a picture of some of them side by side, to check them against the reference pictures.
//   node scripts/sheet.mjs --out /tmp/home.png fridge sofa bunk_bed [--cols 4] [--real] [--grey] [--yaw 40] [--anim walk --time 0.2] [--no-build]
// Needs Godot installed (a window opens for a moment). The picture is a PNG at --out.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const take = (flag, withValue) => {
  const i = args.indexOf(flag);
  if (i < 0) return withValue ? null : false;
  const v = withValue ? args[i + 1] : true;
  args.splice(i, withValue ? 2 : 1);
  return v;
};
const out = path.resolve(take('--out', true) ?? 'sheet.png');
const cols = take('--cols', true);
const real = take('--real', false);
const grey = take('--grey', false);
const yaw = take('--yaw', true);
const anim = take('--anim', true);
const atTime = take('--time', true);
const size = take('--size', true) ?? '1600x900';
const noBuild = take('--no-build', false);
const ids = args;
if (ids.length === 0) {
  console.error('usage: node scripts/sheet.mjs --out file.png id1 id2 ...');
  process.exit(1);
}

const run = (cmd, a) => execFileSync(cmd, a, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
if (!noBuild) {
  run('node', ['scripts/make-models.mjs']);
  run('godot', ['--headless', '--path', 'godot', '--import']);
}

const dir = fs.mkdtempSync(path.join(process.env.TMPDIR ?? '/tmp', 'sheet-'));
const frames = path.join(dir, 'f.png');
const extra = ['--sheet', ids.join(','), ...(cols ? ['--cols', cols] : []), ...(real ? ['--real'] : []), ...(grey ? ['--grey'] : []), ...(yaw ? ['--yaw', yaw] : []), ...(anim ? ['--anim', anim] : []), ...(atTime ? ['--time', atTime] : [])];
const log = run('godot', ['--path', 'godot', '--resolution', size, '--write-movie', frames, '--fixed-fps', '30', '--quit-after', '4', '--', ...extra]);
const errors = log.split('\n').filter((l) => /ERROR|SCRIPT ERROR|Parse Error/.test(l) && !/ObjectDB|resources still/.test(l));
if (errors.length) console.error(errors.join('\n'));
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort();
fs.copyFileSync(path.join(dir, files[files.length - 1]), out);
fs.rmSync(dir, { recursive: true, force: true });
console.log(out);
