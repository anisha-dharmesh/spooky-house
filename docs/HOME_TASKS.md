# Home tasks: design

The six tasks that happen inside Anisha's little house. They are played in this order, and each one teaches **one new thing**.
Tone rules: `CLAUDE.md`. Data: `godot/data/tasks.json` (ids `E19`, `E20`, `E12`, `E21`, `E22`, `E23`). Item ids are the art pack's
(`godot/data/rooms/lh_*.json`). Anything marked **NEW** is not in the pack yet.

Anisha starts (and wakes up when caught) in the Fluffy room at tile (4, 6), which is where Good Morning begins.

## The ladder

| # | Task | New thing she learns | Baddie | Par time |
| --- | --- | --- | --- | --- |
| 1 | **Good Morning** (E19) | Walk between rooms and do a list in order | none | 90 s |
| 2 | **Tidy the Fluffy Room** (E20) | Carry something and put it down | none | 60 s |
| 3 | **Feeding Time** (E12) | Each pet has its own spot; pets become helpers | none | 60 s |
| 4 | **Water the Hall Plant** (E21) | An item changes (empty then full) and is carried between rooms | none | 50 s |
| 5 | **Bath Time for Teddy** (E22) | Order matters (soap, then towel) | none | 80 s |
| 6 | **Squeaky Doormat** (E23) | Hiding, and a baddie who can catch her | scary teacher (visiting) | 70 s |

The first five are calm: there is no way to fail. Number 6 is the first time she can be caught.

## 1. Good Morning (start: Fluffy room)

| Step | What she does | Item |
| --- | --- | --- |
| 1 | Fold the bed | `bed_single_1` (it goes from messy to neat) |
| 2 | Brush teeth at the basin | `toothbrush_1`, **NEW** toothpaste, `wash_basin_1` |
| 3 | Take a shower, then dry with the towel | `shower_1`, `towel_1` |
| 4 | Go to the Hall and get dressed | **NEW** school uniform on the sofa |
| 5 | Pick up the school bag | **NEW** school bag by the door |

- **Needs:** nothing to bring. **Tip:** "The list at the top tells you what comes next."
- **Done:** "Ready for school! Good morning, Anisha." (Message: good morning habits make the whole day happier.)

## 2. Tidy the Fluffy Room (start: Fluffy room)

| Step | What she does | Item |
| --- | --- | --- |
| 1 to 3 | Pick up each soft toy and put it in the toy box | `soft_toy_1`, `soft_toy_2`, `soft_toy_3`, **NEW** `toy_box_1` |
| 4 to 5 | Put each cushion on the bean bag | `cushion_1`, `cushion_2`, `bean_bag_1` |
| 6 | Switch on the fairy lights | `fairy_lights_1` |

- She carries one thing at a time. A counter shows "3 of 3" toys.
- **Tip:** "Toys go in the box. Cushions go on the bean bag."
- **Done:** the lights glow and the room looks cosy.

## 3. Feeding Time (start: Hall)

| Step | What she does | Item |
| --- | --- | --- |
| 1 | Go to the Animal room and pick up the pet food | **NEW** `pet_food_sack_1` |
| 2 | Fill the dog's bowl by the dog bed | `pet_bowl_1`, `pet_dog_1` |
| 3 | Fill the cat's bowl by the cat basket | `pet_bowl_2`, `pet_cat_1` |
| 4 | Fill the parrot's seed dish by the cage | **NEW** `pet_bowl_3`, `pet_parrot_1` |

- Each pet reacts: the dog wags, the cat purrs, the parrot says "Thank you!".
- **Done:** "Now they are your friends. They will help you when someone chases you."
- No water step (decided): it added a step and nothing new to learn.

## 4. Water the Hall Plant (start: Hall)

| Step | What she does | Item |
| --- | --- | --- |
| 1 | Go to the bathroom and pick up the watering can | **NEW** `watering_can_1` |
| 2 | Fill it at the basin | `wash_basin_1` (the can goes from empty to full) |
| 3 | Go back to the Hall and water the plant | `plant_pot_1` (it perks up) |

- **Tip:** "Careful: the can is only full after you fill it." Trying to water with an empty can gives a friendly nudge.

## 5. Bath Time for Teddy (start: Hall)

| Step | What she does | Item |
| --- | --- | --- |
| 1 | Pick Teddy up from the Fluffy room bed | **NEW** `teddy_1`, `bed_single_1` |
| 2 | Put Teddy in the bathtub | `bathtub_1` |
| 3 | Wash with soap | `soap_1` |
| 4 | Dry with the towel | `towel_1` |
| 5 | Put Teddy back on the bed | `bed_single_1` |

- The order matters. If she tries the towel first: "Soap first! Teddy is still dusty."
- **Done:** a clean, fluffy Teddy. (Anisha meets Teddy here before E1 and M1.)

## 6. Squeaky Doormat (start: Hall)

| Step | What she does | Item |
| --- | --- | --- |
| 1 | Pick up the squeaky toy in the Animal room | `pet_toys_1` |
| 2 | Hide it under the doormat | `front_door_mat_1` |
| 3 | Hide until the teacher steps on it | `sofa_1`, or the Fluffy room bed (`bed_single_1`) |

- **The scary teacher (visiting for tea)** walks in through the front door and patrols slowly: front door, sofa side, TV, back
  again, pausing about a second at each stop. If she sees Anisha planting the toy, Anisha is caught and wakes up in the Fluffy room.
- **Watch out:** the teacher (slow). **Hide in:** behind the sofa, or the Fluffy room bed. **Pet help:** 1 (the pets from Feeding Time).
- **Done:** "SQUEAK! She jumps, then laughs. 'Very funny, Anisha!'" (Message: a harmless squeak is a funny welcome.)

## What this needs

**Not in the pack yet:** toothpaste, school uniform, school bag (home), toy box, pet food sack, a third bowl (parrot seed dish),
watering can, Teddy.

**Item states** (one change each): bed folded, plant perky, fairy lights on, pets happy, Teddy clean, can full.

**Two things in the pack to fix:**
1. The Hall doormat sits at tile (2, 1), by the north wall, but the front door is on the **south** wall. Move it just inside the
   south door, or the prank makes no sense.
2. The Hall has no clear "front door" for the teacher to walk in through. A patrol that starts at the south door and ends at the
   sofa works well.

## For you to decide

Decided: the order above is right, and the water step is dropped.
Decided: the scary teacher visiting for tea is the person to prank.
