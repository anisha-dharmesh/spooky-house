# Anisha's Spooky House — Game Design Spec

Source of truth: Claude Doc "Anisha's Spooky House — Game Design Spec" (rev 35). This file is an export for the repo.
Designer: Anisha (age 8). Producer: Dharmesh. Engine in repo: Godot (level 1 built).

---

## Changelog

### 2026-10-05 · repo-only edits (not in the Claude Doc yet: copy them back)

Decided by Dharmesh. The rules are in `CLAUDE.md`.

1. **New tone:** playful, cheerful, helpful and funny. A little prank is fine, nothing is serious, and every task leaves a good message. Spooky is the look of Granny's house only.
2. **Museum added** (opens at level 52, a proposal for Anisha to approve). Four rooms, not in the art pack yet.
3. **Quests are grouped Easy / Medium / Hard.** Story and Major quests are a separate series. 61 new quests were merged in (from the quest list plus new drafts): see `docs/TASK_LIST.md`.
4. **Anisha's tasks are kept.** 42 of them were lightly edited for tone. The original wording is stored in `godot/data/tasks.json`.
5. **Stakes are kept** for most tasks: caught means replay, and tasks have a watcher. Simple calm tasks with no watcher are also allowed (Dharmesh).
6. **English only.** No Hindi.

### 2026-10-05 (doc rev 32 → 35)

New rules from Anisha this session. Claude Code: implement these on top of the existing build.

1. **Realistic travel, no teleport.** The player leaves home, gets on a scooty, rides through town to granny's house, does the prank, rides the same scooty back home. No instant "stand here and arrive" teleport.
2. **One vehicle only: a scooty.** Player picks the scooty's colour at the start (same picker style as clothes colour).
3. **Unlockable looks.** Start with ONE hairstyle. New hairstyles unlock as levels progress. Same for clothes (different jeans / outfits). Winning levels = new looks.
4. **Palace rewards at level 90.** When the palace unlocks, the player gets a wand (chhadi), a bag and lots of coins.
   - **Bag of stones:** throw a stone at granny when she won't stop chasing → she is stunned for a short time, then chases again.
   - **Wand:** makes the player hide while granny chases hard. Only **2 uses in total**.
   - **Coins:** lots awarded at the palace. (What coins buy is not decided yet.)

### Known contradictions to clean up (not yet fixed in the doc)

- Roof row in the room table says "balcony is also safe" — WRONG. Balcony is NOT safe; only roof and play zone are safe.
- "Technical suggestions" still says browser / Phaser / 2D. Actual direction: **Godot**, Anisha wants **3D with a third-person (behind-the-character) camera**.
- "Draft bands" table puts the swimming pool at 50–64 and Sand Park at 65–79, but the agreed unlock levels are pool 30 → school 45 → sand park 60 → hospital 75 → palace 90. Trust the unlock levels.
- Proposed "pet help limited per level" and the stone/wand items overlap — keep all, tune later.

---

## Overview

A stealth-prank game for children aged 5 to 12: the player (Anisha herself) sneaks around the town and granny's spooky house, pulling friendly pranks and helping out, without getting caught.

**Brief (from Dharmesh)**
- At least **100 levels**.
- Difficulty rises **slowly and gradually**, never in big jumps. One new thing (room, baddie, mechanic) at a time.
- Grow Anisha's ideas; do not replace them. Her names, characters and pranks stay as she gave them.

**Tone (Dharmesh, 2026-10-05):** playful, cheerful, helpful and funny. A little prank is allowed and nothing is serious. Every task leaves a good message, and children learn where things belong (which building has which item). The game must be enjoyable, never brain-twisting. A prank surprises someone and never hurts or humiliates them. Spooky is the look of Granny's house only. Full rules, including what is and is not allowed: `CLAUDE.md`.

## Characters

| Character | Role | First appears | Behaviour |
| --- | --- | --- | --- |
| Anisha (player) | Hero | Level 1 | Walks, sneaks, hides, picks up and uses items. Clothes colour chosen at start; hairstyles and outfits unlock with progress. |
| Scary teacher | Baddie 1 | Level 1 | Patrols. Slow and alone early; speeds up around level 10. Loves plums, cake, chocolate. |
| Labubu | Baddie 2 | ~Level 10 | First only guards one spot; starts chasing a few levels later. Owns a back-massage machine. |
| Kabla | Baddie 3 | ~Level 20 | Sneaky: moves quietly, harder to spot coming. |
| Granny | Main target, also chases | Early | Owner of the big house. Does yoga, cooks, bathes, rides a scooty, a Bullet and a big bicycle; owns trophies, medals, jewellery, a big TV and an Alexa. Chases you when she catches you pranking. |
| Rani | Target | Prank tasks | Rocket and eye-drop pranks. |
| Kamala | Target | Prank tasks | Rocket, eye-drop and bouncy-ball pranks. |
| Parrot, dog, cat | Pet helpers | Player's house | Live in the animal room; one runs out to distract a chaser. |

Each baddie is introduced on its own, with a few calm levels before the next new scare.

## World map

Everything sits inside one connected **Town**. The player starts at home and **rides the scooty** to granny's house (no teleport).

| Place | Opens at | What's there |
| --- | --- | --- |
| My little house | Level 1 | Start point; four rooms incl. the pet animal room. |
| Granny's big house | Level 1 (rooms unlock one by one) | Main play space; many floors, stairs, lift, roof, slide, pool. |
| Playground | Level 5 | Open area; baddies can chase you here. |
| Garden | Level 10 | Granny's plants, watering can; chase area. |
| Swimming pool | Level 30 | Three or four different slides (straight, curvy, wavy) plus roof-to-pool slide. |
| School | Level 45 | Fits the scary teacher. Rooms not decided yet. |
| Museum (proposal) | Level 52 | Old things, a dinosaur, paintings and statues. Four rooms: see the Museum section. |
| Sand Park | Level 60 | Beach-like sand, slides, monkey bars, swings, see-saw. |
| Hospital | Level 75 | Emergency room, animal room (sick animals), medicine room (needles, syringes, medicines). |
| Palace | Level 90 | King and queen's palace, queen's and king's things, jewellery to steal. Gives wand, bag of stones, coins. |

**Order rule (Anisha):** all of granny's house rooms unlock FIRST (one by one), then the big outside places: pool 30 → school 45 → museum 52 (proposal) → sand park 60 → hospital 75 → palace 90.

Town streets connect places with roads and street lamps. Vehicles parked outside granny's: scooty, Bullet motorbike, big bicycle (granny's — prank targets). The player's own vehicle is one scooty.

## Granny's house

Multi-floor haunted house from Anisha's drawing, joined by **stairs and a lift** (also escape routes).

**Layout**
- Ground floor: kitchen, hall, store room, front door.
- Next floor: bedrooms, dining room, bathroom.
- Next floor: craft room, office, puja room, exercise room.
- Top floor: mountain climbing room, dance room, study, yoga room.
- Roof: play zone (safe zone), solar panels for hot water.
- Outside: swimming pool, long slide from roof into pool. Garden and parked vehicles nearby.

**Room unlock order:** kitchen → hall → store room → bedroom → dining room → dance room → craft office → study → puja room → play zone → swimming pool → mountain climbing room (hardest, last). Exercise, yoga, bathroom, granny's room and science lab slot in where their tasks need them.

| Room | Contents | Hiding / special |
| --- | --- | --- |
| Kitchen | Fridge, gas stove, utensils, knife, spices, chilli, lemon, salt, sugar jars, tea, Maggi, cashews | Source of most food-prank items |
| Hall | Sofa, big TV, TV remote, Alexa, big cupboard holding piano, skates and lots of things | **Hide inside the cupboard** |
| Store room | Baby stroller, big plant pots, boxes | **Hide behind the pots** |
| Bedroom | Three stacked bunk beds, small wardrobe, under-bed drawers with trophies and watches | **Hide under the bed / drawers** |
| Dining room | Dining table, chairs, plates and thalis | Glue-on-chair prank |
| Bathroom | Big white bathtub, shower, soap, shampoo, toothpaste, towels | Slime / slippery floor pranks |
| Dance room | JBL speaker, mirror, disco lights | |
| Craft room / office | Big instruction books, coloured paper, scissors, glue, pencil, eraser | Source of glue, colour, scissors |
| Study | Favourite books, pens, pencils | |
| Puja room | Idols of the gods, thali with diyas, matchsticks | |
| Exercise room | Treadmill, exercise equipment | Treadmill pranks |
| Yoga room | Yoga mat, soft calm music | Music swap, mat tearing |
| Mountain climbing room | Climbing wall, hanging safety jacket, sponge mat | Hardest room, unlocks last |
| Play zone (roof) | Big TV, remote controller | **Safe zone** |
| Roof | Solar panels for hot water, top of the slide | **Safe zone** |
| Balcony | — | **NOT safe** — granny can catch you here |
| Pool | Swimming pool, towels | Reached by the slides |
| Science lab | Straws/tubes, colourful bottles, Eno (bubbles), mix-up items for experiments or a toy bomb | Make prank items here |

Every room should be fully furnished with many small objects. Dining room, study, bathroom and pool contents were filled in by Claude and still need Anisha's approval.

## My little house

Every level starts here. The player walks out, gets on the scooty and rides to granny's house.

| Room | Contents |
| --- | --- |
| Hall | Sofa, TV, wall clock, photos |
| Bathroom | Bathtub, shower, mirror, soap, toothbrush |
| Animal room | Pets: parrot, dog, cat, with their food and toys |
| Fluffy room | Very fluffy, pretty decorative room: soft toys, cushions, decorations |

## Museum (proposal)

Opens at level 52, after the school. **Not in the art pack yet** (rooms and models still to make). Anisha to approve.

| Room (id) | Contents |
| --- | --- |
| Entrance hall (`mu_hall`) | Guard's statue, knight statue, ticket desk, information boards, display cases |
| Dinosaur hall (`mu_dino_hall`) | Dinosaur skeleton, fossil footprint, display cases |
| Painting gallery (`mu_gallery`) | Paintings, easels, one faded painting to restore, display frames |
| Back store room (`mu_store`) | Old photographs, books, boxes, the giant spoon, a mysterious object under a cloth |

The baddie that watches here is Kabla (sneaky and quiet). Tasks that use it: see `docs/TASK_LIST.md`.

## Gameplay rules

Each level gives one prank task: ride over, sneak in, collect what you need, do the prank, get out without being caught, ride home.

**Core rules (Anisha)**
1. Every level has a task (a prank on a baddie or target).
2. Baddies patrol and chase you, especially in the garden and playground.
3. **Safe zones:** roof and play zone only. Balcony is NOT safe.
4. **Hiding spots:** hall cupboard, behind store-room pots, under the bedroom bed/drawers. Hidden = not seen.
5. **Caught = replay the level.**
6. **Pet help:** when a chaser is after you, a pet (parrot, dog or cat) runs out of the animal room and distracts the chaser.
7. **Stairs and lift** move you between floors and work as escape routes.
8. **Slides** go from the roof into the pool.

**Noise toys:** blocks and balls on the floor (no dishes). Running into them makes noise; baddies may hear. Move slowly and carefully.

**Character colour:** at the start the player picks clothes colour from several options (a boy may not want pink or purple).

**Travel (new):** no teleport. One scooty, round trip home → granny's → home. Player picks scooty colour at start.

**Unlockable looks (new):** one hairstyle at start; more hairstyles, jeans and outfits unlock with level progress.

**Palace rewards at level 90 (new)**
- **Bag of stones:** throw at granny to stun her briefly; she then chases again.
- **Wand (chhadi):** hide from a hard chase; **2 uses total**.
- **Coins:** lots awarded.

**Stars**
- Nobody sees you all level: 3 stars.
- Seen and chased, but you hide and escape: 2 stars.
- Caught: replay.

**Controls:** tap or click only (mouse on desktop, finger on touch), no D-pad. Tap the ground to walk there; tap a thing that matters to walk there and use it (pick up, use an item, hide). A bubble with the item's picture and a few words shows what a tapped thing is, and a thing that is not ready wiggles. Other actions: call pet (button), use lift, ride scooty, throw stone, use wand. There is no sneak.

**Supporting systems (Claude's suggestions, confirm with Anisha):** small inventory for prank items; faint baddie sight cones; pet help limited per level.

## Baddie progression

| Levels | Baddies active | Change |
| --- | --- | --- |
| 1–9 | Scary teacher | Alone and slow |
| ~10 | Scary teacher | Speeds up |
| ~10–14 | + Labubu | Labubu guards one spot |
| ~15–19 | Teacher, Labubu | Labubu starts chasing |
| ~20+ | + Kabla | Sneaky and quiet |
| Later | All three + granny | Tougher combos, bigger areas |

Exact numbers are flexible; the rule is gradual, never drastic.

## Level structure

100+ levels, one task each. Only levels 1 and 2 are fixed:
- **Level 1:** put cement in the scary teacher's shoe.
- **Level 2:** put granny and Kamala (also told as Rani and Kamala) into a pretend rocket with a confetti-pop "bomb".

Area unlocks follow the World map table. Difficulty rule of thumb: items needed, rooms crossed, baddies awake, whether timing matters.

**Quest tiers (new).** Every task is Easy, Medium or Hard by that rule. **Story** quests (move the story on) and **Major** quests (big, change the world for good) are a separate series, not a difficulty. A flavour tag says what kind of task it is: prank, help, mystery, event or build. Each new building opens with its own easy tasks. The full merged list is in `docs/TASK_LIST.md`.

## Task list

104 prank tasks (45 Anisha's, 59 approved suggestions). The wording below is the original. Tone-edited wording, difficulty and the new quests are in `docs/TASK_LIST.md` and `godot/data/tasks.json`.

**Anisha's own tasks**
1. Put cement in the scary teacher's shoe (level 1).
2. Put granny and Kamala / Rani and Kamala in a rocket with a bomb (level 2).
3. Put onion juice in Rani and Kamala's eye drops.
4. Cut a plum, squeeze lemon on it, leave it in a bowl for the plum-loving scary teacher.
5. Put cement in Labubu's back-massage machine.
6. Make soup in granny's favourite bowl with something bitter in it.
7. Glue the bouncy ball so Kamala sticks to it.
8. Colour a flower and put it on the scary teacher's favourite cake labelled "edible" so her mouth gets messy.
9. Put colours on the scary teacher's clothes, then wash and dry them so they come out colourful.
10. Mix lemon or something bitter into the scary teacher's shampoo.
11. Rub chilli all over her favourite chocolate.
12. Pour water on the dance-room JBL speaker so it breaks (Anisha still deciding).
13. Mix lemon and strawberry juice into the water tank / RO.
14. Rub pencil shavings and pen over her favourite books.
15. Put glue on a dining chair so whoever sits sticks.
16. Break the glass of all her favourite photos.
17. Change her clock so she rushes to a birthday party that isn't happening.
18. Secretly speed up the treadmill so she runs too fast and falls.
19. Put oil on the treadmill and set it to slow so she slips.
20. Turn the astronaut light very bright so it shines in granny's eyes.
21. Swap the yoga room's calm music for very loud music.
22. Put glue all over granny's scooty.
23. Put grass in granny's Maggi while she turns to grab the TV remote.
24. Tear her clothes.
25. Break granny's specs.
26. Break granny's favourite thalis.
27. Switch off all lights (except the bathroom) at the inverter while granny bathes, so she comes out to no light and no towel.
28. Pour mango juice on granny's charging watch.
29. Make a drink in her favourite glass: a little milk, lots of water, crushed strawberry, lots of chilli.
30. Pour mango juice mixed with water on the roof solar panel so there's no hot water.
31. Pull out the roots of granny's garden plants.
32. Put cement all over granny's big bicycle.
33. Put oil and water on the bathroom floor before granny bathes.
34. Put water in the engine of granny's Bullet.
35. Take the wheels off granny's toy car.
36. Fill the big white bathtub with slime.
37. Break granny's medals and trophies and set them in front of her.
38. Break granny's very big TV (then hide and laugh).
39. Break granny's Alexa so she can't turn on the TV when the remote is lost.
40. In the Sand Park, lure the scary teacher there and throw sand in her eyes.
41. Tear granny's yoga mat while she cooks.
42. Pour orange juice on granny's pizza while she turns for the remote.
43. Put lots of oil in the swimming pool.
44. Steal granny's necklaces and earrings from the palace.
45. Put salt and a little karela juice in the cashews.

**Claude-suggested, approved by Anisha**
1. Put lots of salt in the scary teacher's tea.
2. Cut small holes in her favourite hat with craft-room scissors.
3. Hide her slippers near the puja room.
4. Wet her towel near the pool so there's no dry towel.
5. Swap the sugar and salt jars.
6. Tie granny's shoelaces together.
7. Put a fake spider in her slipper.
8. Fill her umbrella with confetti.
9. Hide all the TV remotes.
10. Put bubble soap in the kitchen tap.
11. Swap her reading glasses with funny coloured ones.
12. Stick googly eyes on everything in the fridge.
13. Set all clocks to different wrong times.
14. Put a whoopee cushion on granny's favourite chair.
15. Put jelly in granny's shoes.
16. Swap her toothpaste with something sour.
17. Hide a toy frog in her teapot.
18. Tie a balloon to her chair so it floats up when she stands.
19. Put glitter in her hairbrush.
20. Swap family photos with funny cartoon faces.
21. Fill her handbag with ping-pong balls.
22. Put a tiny animal-sound speaker under her bed.
23. Tape all her pens to the table.
24. Swap her shampoo with colourful bubble liquid.
25. Put a rubber duck in her soup bowl.
26. Fill her gloves with jelly.
27. Hide a toy snake in her garden hat.
28. Put bubble wrap under the doormat.
29. Swap the remote batteries so nothing works.
30. Put food colouring in the milk so it turns blue.
31. Glue a coin to the floor.
32. Fill her slippers with cotton.
33. Put a tiny bell in her bag.
34. Swap her shampoo and ketchup bottles.
35. Hide all the left shoes.
36. Put a fake cockroach on her toast.
37. Tie her curtains in a big knot.
38. Put sand in her watering can.
39. Change her ringtone to a loud cow sound.
40. Fill her umbrella with feathers.
41. Put double-sided tape on the TV remote.
42. Hide her reading glasses in the fridge.
43. Put a tiny toy car in her shoe.
44. Fill her pillow with bells.
45. Put clear nail polish on the soap.
46. Sew her socks together.
47. Put everything in the fridge upside down.
48. Fill her pen with invisible ink.
49. Hang the wall clock upside down.
50. Glue her book's pages together.
51. Make her umbrella refuse to open.
52. Put lemon in her tea so it curdles.
53. Make her shoelaces disappear.
54. Fill her bed with toys.
55. Put salt on her toothbrush.
56. Tie colourful ribbons on the fan.
57. Dip her comb in honey.
58. Change the doorbell to a laughing sound.
59. Put stickers on her glasses.

## Visual and audio style

- **Colours:** black, grey and white only. No green, pink, purple or blue.
- **Detail:** every room fully furnished with many small objects.
- **Mood:** night sky, crescent moon, bats, owl, cobwebs, flickering bulbs, dead tree, fog, gravestones.
- **Navigation visuals:** lift shaft, zigzag stairs, three or four different pool slides plus roof-to-pool slide.
- **Reference:** https://claude.ai/artifact/KUn594AqRnJ9b6S36eCGxm
- **Audio (proposed):** creepy ambience, footsteps louder as a baddie nears, funny sound when a prank lands.

## Build notes for Claude Code

- Engine: **Godot**. Target: 3D, third-person camera (Anisha's wish). Start simple, grow it.
- Keep levels, rooms, items, tasks, unlocks (areas, hairstyles, outfits) in data files, not code.
- Per-level data: rooms open, baddies active, speeds, task, required items, rewards.
- Player profile save: current level, stars, unlocked looks, chosen clothes + scooty colour, wand uses left, stones, coins.
- Large readable UI for an 8-year-old; English only (no Hindi).

## Open questions

- [ ] Sort the 104 tasks by difficulty and assign to levels (with Anisha).
- [ ] What do coins buy?
- [ ] How many stones in the bag; refill or fixed?
- [ ] Anisha's starting look (hair, clothes).
- [ ] Keep or drop the dance-room speaker task (#12)?
- [ ] School interior rooms; more hospital detail.
- [ ] Contents of dining room, study, play zone, pool surroundings, palace interior, Sand Park.
- [ ] Animal room and fluffy room details.
- [ ] Rocket task: Rani and Kamala, or granny and Kamala?
