# Anisha's Spooky House — Game Design Spec

Oct 4, 2026 · @Dharmesh Patel

## Overview

A spooky stealth-prank game: the player (Anisha herself) sneaks around a dark town and granny's haunted house, pulling pranks on baddies without getting caught. Designed by Anisha (age 8); Dharmesh is producing it.

**Brief (from Dharmesh)**

- At least **100 levels**.
- Difficulty rises **slowly and gradually**, never in big jumps. One new thing (room, baddie, mechanic) at a time.
- Grow Anisha's ideas; do not replace them. Her names, characters and pranks stay as she gave them.

**Genre in one line:** top-down or side-view stealth with fetch-and-use prank tasks, safe zones, hiding spots and a pet-distraction helper.

**Tone:** spooky, not cute, inside Granny's house (the rest of the town is normal; see Visual and audio style). Pranks are cartoon mischief (sticky, sour, spicy, messy, broken things). No gore, no injury shown; a baddie who "falls" just lands on a sponge mat or bum and looks cross.

## Characters

The player is Anisha herself; three baddies chase her, and granny, Rani and Kamala are prank targets.

| Character | Role | First appears | Behaviour |
| --- | --- | --- | --- |
| Anisha (player) | Hero | Level 1 | Walks, sneaks, hides, picks up and uses items. Look not finalised (see Open questions). |
| Scary teacher | Baddie 1 | Level 1 | Patrols. Slow and alone early; speeds up around level 10. Loves plums, cake, chocolate. |
| Labubu | Baddie 2 | \~Level 10 | First only guards one spot; starts chasing a few levels later. Owns a back-massage machine. |
| Kabla | Baddie 3 | \~Level 20 | Sneaky: moves quietly, harder to spot coming. |
| Granny | Main target, also chases | Early | Owner of the big house. Does yoga, cooks, bathes, rides a scooty, a Bullet and a big bicycle, owns trophies, medals, jewellery, a big TV and an Alexa. Chases you when she catches you pranking. |
| Rani | Target | Prank tasks | Appears in rocket and eye-drop pranks. |
| Kamala | Target | Prank tasks | Appears in rocket, eye-drop and bouncy-ball pranks. |
| Parrot, dog, cat | Pet helpers | Player's house | Live in the animal room; one runs out to distract a chaser (see Gameplay). |

Each baddie is introduced on its own, with a few calm levels before the next new scare.

## World map

Everything sits inside one connected **Town**, so moving between places feels real. The player starts at home, sneaks to granny's house, and new places open with levels.

| Place | Opens at | What's there |
| --- | --- | --- |
| My little house | Level 1 | Start point; four rooms incl. the pet animal room. |
| Granny's big house | Level 1 (rooms unlock one by one) | Main play space; many floors, stairs, lift, roof, slide, pool. |
| Playground | Level 5 | Open area; baddies can chase you here. |
| Garden | Level 10 | Granny's plants, watering can; chase area. |
| Sand Park | After garden (exact level TBD) | Beach-like sand, slides, monkey bars, swings, see-saw. |
| Palace | Later (exact level TBD) | King and queen's palace with the queen's things, the king's things and lots of mischief items (jewellery to steal). |

Town streets connect them with roads and street lamps. Vehicles parked outside granny's: scooty, Bullet motorbike, big bicycle.

## Granny's house

A multi-floor haunted house from Anisha's own drawing, joined by **stairs and a lift** (both requested by Anisha; also escape routes). Rooms unlock one at a time in the order below.

**Layout (from the drawing)**

- Ground floor: kitchen, hall, store room, front door.
- Next floor: bedrooms, dining room, bathroom.
- Next floor: craft room, office, puja room, exercise room.
- Top floor: mountain climbing room, dance room, study, yoga room.
- Roof: play zone (safe zone), solar panels for hot water.
- Outside: swimming pool, with a long slide from the roof down into the pool. Garden and parked vehicles nearby.

**Room unlock order (agreed with Anisha):** kitchen → hall → store room → bedroom → dining room → dance room → craft office → study → puja room → play zone → swimming pool → mountain climbing room (hardest, last). Exercise, yoga, bathroom and granny's room slot in where their tasks need them.

| Room | Contents | Hiding / special |
| --- | --- | --- |
| Kitchen | Fridge, gas stove, utensils, knife, spices, chilli, lemon, salt, sugar jars, tea, Maggi, cashews | Source of most food-prank items |
| Hall | Sofa, big TV, TV remote, Alexa, big cupboard holding piano, skates and lots of things | **Hide inside the cupboard** |
| Store room | Baby stroller, big plant pots, boxes | **Hide behind the pots** |
| Bedroom | Three stacked bunk beds, small wardrobe, under-bed drawers with trophies and watches | **Hide under the bed / drawers** |
| Dining room | Dining table, chairs, plates and thalis | Glue-on-chair prank |
| Bathroom | Big white bathtub, shower, soap, shampoo, toothpaste, towels | Slime / slippery floor pranks |
| Dance room | JBL speaker, mirror, disco lights |  |
| Craft room / office | Big instruction books, coloured paper, scissors, glue, pencil, eraser | Source of glue, colour, scissors |
| Study | Favourite books, pens, pencils |  |
| Puja room | Idols of the gods, thali with diyas, matchsticks |  |
| Exercise room | Treadmill, exercise equipment | Treadmill pranks |
| Yoga room | Yoga mat, soft calm music | Music swap, mat tearing |
| Mountain climbing room | Climbing wall (hands and feet), hanging safety jacket, sponge mat | Hardest room, unlocks last |
| Play zone (roof) | Big TV, remote controller | **Safe zone** |
| Roof | Solar panels for hot water, top of the slide | **Safe zone**; balcony is also safe |
| Pool | Swimming pool, towels | Reached by the slide |

Anisha asked for every room to be drawn in full detail, with many small objects, not just one or two. Dining room, study, bathroom and pool contents above were filled in by Claude for the visual and still need Anisha's approval.

## My little house

The player's own small home: every level starts here, then the player walks through town to granny's house.

| Room | Contents |
| --- | --- |
| Hall | Sofa, TV, wall clock, photos |
| Bathroom | Bathtub, shower, mirror, soap, toothbrush |
| Animal room | Home of the pets: parrot, dog, cat, with their food and toys |
| Fluffy room | Very fluffy, pretty decorative room: soft toys, cushions, decorations |

Animal room and fluffy room details beyond the above are still to come from Anisha.

## Gameplay rules

Each level gives one prank task; sneak in, collect what you need, do the prank, get out without being caught.

**Rules decided by Anisha**

1. Every level has a task (a prank on a baddie or target).
2. Baddies patrol and chase you, especially in the garden and playground.
3. **Safe zones:** the balcony and the roof (incl. the play zone). Baddies cannot catch you there.
4. **Hiding spots:** inside the hall cupboard, behind the store-room pots, under the bedroom bed/drawers. Hidden = not seen.
5. **Caught = replay the level.**
6. **Pet help:** when granny (or a baddie) is chasing you and you need help, a pet (parrot, dog or cat) runs out of the animal room and distracts the chaser so you can escape.
7. **Stairs and lift** move you between floors and work as escape routes.
8. **Slide** goes from the roof straight down into the pool.

**Controls (to build; Anisha raised that the game needs "things to move with")**

- Proposed: arrow keys / WASD on computer, plus on-screen touch buttons (D-pad + action button) on phone and tablet.
- Actions: walk, sneak (slower, quieter), pick up / use item, hide (when next to a hiding spot), call pet, use lift.

**Proposed supporting systems (Claude's suggestions, confirm with Anisha)**

- Small inventory for prank items (glue, chilli, lemon, cement, etc.), picked up from the room that holds them.
- Baddie sight cones shown faintly so an 8-year-old can read the danger.
- Pet help limited per level (e.g. once or twice) so it stays special.
- Star rating per level (done / not seen / fast).

## Baddie progression

One new scare at a time: the scary teacher alone first, then faster, then Labubu, then sneaky Kabla.

| Levels | Baddies active | Change introduced |
| --- | --- | --- |
| 1-9 | Scary teacher | Alone and slow; learn sneaking and hiding |
| \~10 | Scary teacher | Speeds up |
| \~10-14 | + Labubu | Labubu only guards one spot |
| \~15-19 | Scary teacher, Labubu | Labubu starts chasing |
| \~20+ | + Kabla | Kabla is sneaky and quiet |
| Later | All three + granny | Tougher combos, bigger areas |

Exact level numbers inside these bands are flexible; the rule is gradual, never drastic.

## Level structure

100 levels, one task each. Only levels 1 and 2 are fixed by Anisha; the bands below are a draft until the task list is sorted by difficulty with her.

**Fixed**

- Level 1: put cement in the scary teacher's shoe.
- Level 2: put granny and Kamala (also told as Rani and Kamala) into a rocket with a bomb.

**Draft bands (to confirm)**

| Levels | Area open | Typical tasks |
| --- | --- | --- |
| 1-4 | Kitchen, hall | Simple swaps and food pranks, one item |
| 5-9 | + store room, bedroom, playground | Hiding introduced; outdoor chasing |
| 10-19 | + dining room, dance room, garden | Two-item pranks; Labubu arrives |
| 20-34 | + craft office, study, puja room | Glue, colour, scissors pranks; Kabla arrives |
| 35-49 | + play zone, exercise, yoga, bathroom | Timed pranks (while granny cooks / bathes) |
| 50-64 | + swimming pool, vehicles outside | Pool, scooty, Bullet, bicycle pranks |
| 65-79 | + Sand Park | Lure-a-baddie pranks |
| 80-94 | + Palace | Steal-and-escape pranks |
| 95-100 | + Mountain climbing room | Hardest multi-step finales |

Rule of thumb for difficulty: number of items needed, number of rooms crossed, baddies awake, and whether timing matters.

## Task list

104 prank tasks collected (45 Anisha's, 59 approved suggestions); not yet sorted by difficulty. Anisha's style is cheeky pranks on the baddies, not fetch quests (she rejected "find a key" style tasks).

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

> **Update, Oct 5, 2026: only Granny's house is spooky.** The rest of the town (my little house, park, school, hospital,
> palace, swimming pool, streets) is **not** spooky: normal and bright. The dark look below (night sky, fog, cobwebs, bats,
> black, grey and white only) applies to Granny's house. Whether town objects may use real colours is still to confirm with
> Anisha.

Spooky, not cute: Anisha rejected the first colourful version.

- **Colours:** black, grey and white only. **No green, pink, purple or blue.**
- **Detail:** every room fully furnished with many small objects so it feels real.
- **Mood:** night sky, crescent moon, bats, owl, cobwebs in room corners, flickering hanging bulbs, dead tree, fog, gravestones outside.
- **Navigation visuals:** lift shaft with car and up/down arrows; zigzag stairs between every floor; slide from roof to pool.
- **Reference:** the approved spooky picture of the world, [Anisha's Spooky Game World](https://claude.ai/artifact/KUn594AqRnJ9b6S36eCGxm) (granny's house, my little house, dark town tabs).
- **Audio (proposed):** quiet creepy ambience, footsteps that get louder as a baddie nears, a funny sound when a prank lands, the loud yoga-music swap as a gag.

## Build notes for Claude Code

Build a playable vertical slice first, so Anisha can see herself walk, then grow it level by level.

**Suggested build order**

1. One room (kitchen) with Anisha walking via arrow keys and on-screen touch buttons.
2. Scary teacher patrol + sight cone; caught → restart level.
3. Item pickup and use: level 1 (cement in shoe) end to end.
4. Hiding spots and safe zones.
5. Multiple rooms on one floor, then stairs and lift between floors.
6. Pet help mechanic.
7. Level data file driving the 100 levels (rooms open, baddies active, speeds, task, required items).
8. Town map and outdoor areas (playground, garden, Sand Park, Palace).

> **Update, Oct 5, 2026: the game is built in 3D with Godot** (see `godot/`). A first 2D version in Phaser was built and then
> removed; it is still in the git history (commit `fff3950`). The suggestions below are the original ones.

**Technical suggestions**

- Target browser (desktop + phone/tablet touch), e.g. Phaser 3 or plain Canvas; 2D top-down or side-view with floors.
- Keep levels, rooms, items and tasks in JSON so new pranks are data, not code.
- Save progress locally (current level, stars).
- Large, readable UI and text for an 8-year-old; Hindi and English both useful.
- Use the spooky reference picture for layout and palette.

## Open questions

- [ ] Sort the 104 tasks by difficulty and assign each to a level (with Anisha).
- [ ] Anisha's look as the player: hair, clothes, any special item (torch, bag, magic thing).
- [ ] Keep or drop the dance-room speaker task (#12)?
- [ ] Exact unlock levels for the Sand Park and Palace.
- [ ] Contents of the dining room, study, play zone, pool surroundings, palace interior and Sand Park (Anisha to confirm or add).
- [ ] Details of the animal room and fluffy room in her own house.
- [ ] Is it Rani and Kamala or granny and Kamala in the rocket task? Both were mentioned.
- [ ] Top-down or side-view camera?
