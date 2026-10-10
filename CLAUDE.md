# Anisha's Spooky House: instructions for Claude

A 3D stealth-prank game in Godot (`godot/`) for children aged 5 to 12. Designer: Anisha (age 8). Producer: Dharmesh.
Design spec: `GAME_DESIGN.md`. Task data: `godot/data/tasks.json`. Readable task list: `docs/TASK_LIST.md`. English only (no Hindi).

## Tone: follow this every time

The game is playful, cheerful and helpful. A little prank is allowed and nothing is serious.

- **Every task leaves a good message** (one short line, the `message` field) and ends on a kind or funny beat: the target laughs,
  or Anisha tidies up, puts things back, shares or says sorry.
- **Children learn where things belong.** A task should make a child think "which building or room would have this?"
  (bandages at the hospital, paint at school, seeds in the garden, a squeaky toy in the animal room). Say where every item comes from.
- **Fun first, never brain-twisting.** Plain words, short sentences, one new idea per task. A task can be a little clever, but it must
  never be a puzzle that stops the play.
- **Surprise, never hurt, humiliate or really frighten.**
  - Fine: swaps, hiding things, silly sounds, stickers, ribbons, bubbles, slime, confetti, googly eyes, toy bugs, snakes or spiders
    with smiley or googly eyes, food colour, a squeeze of lemon or a pinch of salt, tying things in bows, washable paint and glue.
  - Not fine: breaking, tearing, stealing or ruining things for good; anything near eyes; anything that makes someone slip, fall or feel
    ill (lots of chilli, bitter juice, oil on floors); water or juice on electronics; hurting plants or animals; real scares.
- **Spooky is the look of Granny's house only.** The town is normal and the little house is cosy. The spirit of every task is cheerful.

## Keep the stakes (but simple tasks are allowed)

Stakes matter for Anisha, so most tasks keep them, even the kind and helpful ones. Dharmesh says a simple calm task with nobody to get
caught by is also fine (for example the morning routine at home). For those, set `watcher` to `none` and say so in the note.

- Caught means replay: she wakes up in her room, drops what she carries, and the task starts again.
- Baddies patrol and chase. Hiding spots and the pet helpers (parrot, dog, cat) are how she gets away.
- A task has a `watcher`: the baddie who can catch her (or `none` for a calm task). Use the cast in the spec (scary teacher, Labubu, Kabla, granny). Do not invent
  new baddies without asking.

## Anisha's ideas stay

- Keep all of Anisha's tasks (`A1` to `A45`) and the approved suggestions (`S1` to `S59`). Her names and characters stay.
- If one breaks the tone rules, change it as little as possible: keep the objects, room and target, and swap only the harmful part.
  Keep the old wording in `original_text` and the reason in `tone_edit`. Tell Dharmesh which ones changed.
- Levels 1 and 2 are fixed: cement in the scary teacher's shoe, and granny and Kamala (or Rani and Kamala) in a pretend rocket with a
  confetti-pop "bomb".

## Difficulty, series and kind

- `difficulty` is easy, medium or hard, by the spec's rule of thumb: items needed, rooms crossed, baddies awake, timing.
  - Easy: one room, or one fetch, with a slow baddie.
  - Medium: items from two or three places, or timing matters.
  - Hard: four or more places, a chain of steps, or faster baddies.
  - The little house is the start, so fetching from home is free.
- `series` is separate from difficulty: `main` (normal), `story` (moves the story on) or `major` (a big one that changes the world for good).
- `kind` is a flavour tag, not a category: `prank`, `help`, `mystery`, `event`, `build`. Mix them so the game is not endless fetch-A-to-B.
- Difficulty is not order. Each building opens with its own easy tasks (one new thing at a time). Unlock order is in the spec's World map.

## Writing a task

Fields: `id`, `text`, `place`, `room`, `collect_from` (rooms), `target`, `pack_objects` (art-pack items that really exist in those rooms),
`missing_objects` (not in the pack yet), `earliest`, `difficulty`, `series`, `kind`, `learn` (where things are found), `message` (the good
message), `watcher`, `note`. Check pack items against `godot/data/rooms/*.json`. The museum rooms (`mu_*`) are not in the pack yet.
We design tasks one at a time with Dharmesh.

## Housekeeping

- `GAME_DESIGN.md` is an export of the Claude Doc "Anisha's Spooky House — Game Design Spec". Copy repo-only changes back to the doc
  (see its changelog).
- `godot/data/tasks.json` is both the planning map and the game's task file. The game plays only the tasks that have `steps`, in
  `play` order (see `docs/ADDING_TASKS.md`). Run `npm run check` after changing it. The home tasks (`docs/HOME_TASKS.md`) are built.
