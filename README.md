# Anisha's Spooky House

A spooky stealth-prank game, designed by Anisha. Sneak around a haunted house, pull pranks on the baddies, don't get caught.
Built with [Phaser 3](https://phaser.io), TypeScript and Vite. Runs in any browser (desktop, phone, tablet).

The game design is in [docs/](docs/). The rooms and objects come from the art pack (see `docs/art/`).

## Run it

```bash
npm install
npm run dev        # play at http://localhost:5173
```

Controls: arrows or WASD to move, **Shift** to sneak, **E** or Space to use, **H** to hide, **C** to call a pet, **P** to pause.
On a phone or tablet, on-screen buttons appear automatically (add `?touch=1` to the address to see them on a computer).

## Check your work

```bash
npm run check      # type-check + tests (also proves every level can be won)
```

## Publish

```bash
npm run build      # makes the dist/ folder (about 2.7 MB)
npm run zip        # dist/ as spooky-house.zip, ready for itch.io
```

- **itch.io:** new project, kind "HTML", upload `spooky-house.zip`, tick "played in the browser".
- **GitHub Pages / Netlify / Cloudflare Pages:** publish the `dist/` folder.
- **Game portals (Poki, CrazyGames, Newgrounds):** upload the same zip; each has its own review.

## Adding levels and details

See [docs/ADDING_LEVELS.md](docs/ADDING_LEVELS.md). In short: pick rooms from the art pack and add one entry to
`src/data/levels.json`. No code needed.

## Where things live

| Folder | What |
| --- | --- |
| `public/assets/` | The art pack: object atlas, room layouts and floors |
| `docs/art/` | Pack notes and labelled pictures of every room |
| `src/data/levels.json` | One entry per level: rooms, task, steps, baddies, tips, text in English and Hindi |
| `src/data/baddies.json` | The kinds of baddie (speed, sight range) |
| `src/scenes/` | Title, map, game, caught and complete screens |
| `src/game/` | Player, baddie, sight and wall maths |
| `src/i18n.ts` | Menu text in English and Hindi |
| `tests/` | Checks, including "can this level be won?" |

Hindi text was written by Claude and should be checked by a Hindi speaker.
