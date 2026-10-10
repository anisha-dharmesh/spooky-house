# Tasks mapped to buildings

Every one of the 104 prank tasks (45 Anisha's, 59 approved suggestions) placed in a building and a room. Source: `GAME_DESIGN.md` (rev 35). The same data, one record per task, is in `godot/data/tasks.json`.

> **Update 2026-10-05:** `godot/data/tasks.json` now holds 165 tasks (these 104 plus 61 new quests) with difficulty, and 42 of Anisha's tasks had their wording lightly changed for the new tone. This page still shows the original 104 with their original wording, placed by building and room. The merged list by difficulty is `docs/TASK_LIST.md`.

**Ids:** `A1`-`A45` are Anisha's own tasks, `S1`-`S59` are the approved suggestions, numbered as in the spec. **Room** is where the prank itself happens; **collect from** lists where you pick up items first. This is a first placement to talk through with Anisha; it is **not** sorted by difficulty yet.

## The short answer

| Building | Opens | Tasks | Rooms used |
| --- | --- | --- | --- |
| Granny's big house | level 1 (rooms one by one) | **95** | Bathroom, Bedroom, Dance room, Dining room, Exercise room, Granny's room, Hall, Kitchen, Outside Granny's house (street, parked vehicles), Puja room, Roof, Science lab (see decision), Store room, Study, Yoga room |
| Park (playground, garden, sand park) | levels 5 / 10 / 60 | **6** | Garden, Playground, Sand Park |
| Swimming pool | level 30 | **2** | Pool deck |
| Palace | level 90 | **1** | Treasury |
| School | level 45 | **0** | none |
| Hospital | level 75 | **0** | none |
| My little house | level 1 (start and finish) | **0** | none |

- **Granny's house has 95 of the 104 tasks**: almost the whole game happens there, as the spec's "granny's rooms unlock first" rule intends.
- **The school, hospital and little house have no tasks of their own yet.** The school and hospital open at levels 45 and 75, so levels past 45 would all fall back to Granny's house. See "Gaps and decisions" for tasks that could move there.
- The pool, palace and park have a few each. The palace has just one (steal the jewellery, level 90).

## Granny's big house

### Kitchen (room #1 to unlock): 16 tasks

| Id | Task | Collect from | Target |
| --- | --- | --- | --- |
| A4 | Cut a plum, squeeze lemon on it, leave it in a bowl for the plum-loving scary teacher. | - | scary teacher |
| A6 | Make soup in granny's favourite bowl with something bitter in it. | Dining room | granny |
| A8 | Colour a flower and put it on the scary teacher's favourite cake labelled "edible" so her mouth gets messy. | Craft room / office, Garden | scary teacher |
| A11 | Rub chilli all over her favourite chocolate. | - | scary teacher |
| A29 | Make a drink in her favourite glass: a little milk, lots of water, crushed strawberry, lots of chilli. | Dining room | granny |
| A45 | Put salt and a little karela juice in the cashews. | - | granny |
| S1 | Put lots of salt in the scary teacher's tea. | - | scary teacher |
| S5 | Swap the sugar and salt jars. | - | granny |
| S10 | Put bubble soap in the kitchen tap. | - | granny |
| S12 | Stick googly eyes on everything in the fridge. | - | granny |
| S17 | Hide a toy frog in her teapot. | - | granny |
| S30 | Put food colouring in the milk so it turns blue. | - | granny |
| S36 | Put a fake cockroach on her toast. | - | granny |
| S42 | Hide her reading glasses in the fridge. | Study | granny |
| S47 | Put everything in the fridge upside down. | - | granny |
| S52 | Put lemon in her tea so it curdles. | - | granny |

### Hall (room #2 to unlock): 25 tasks

| Id | Task | Collect from | Target |
| --- | --- | --- | --- |
| A1 | Put cement in the scary teacher's shoe (level 1). | Kitchen | scary teacher |
| A23 | Put grass in granny's Maggi while she turns to grab the TV remote. | Garden | granny |
| A38 | Break granny's very big TV (then hide and laugh). | - | granny |
| A39 | Break granny's Alexa so she can't turn on the TV when the remote is lost. | - | granny |
| A42 | Pour orange juice on granny's pizza while she turns for the remote. | Kitchen | granny |
| S6 | Tie granny's shoelaces together. | - | granny |
| S7 | Put a fake spider in her slipper. | - | her (granny or the scary teacher: not said) |
| S8 | Fill her umbrella with confetti. | - | her (granny or the scary teacher: not said) |
| S9 | Hide all the TV remotes. | Play zone (roof) | granny |
| S13 | Set all clocks to different wrong times. | Granny's room | granny |
| S15 | Put jelly in granny's shoes. | Kitchen | granny |
| S20 | Swap family photos with funny cartoon faces. | - | granny |
| S28 | Put bubble wrap under the doormat. | - | granny |
| S29 | Swap the remote batteries so nothing works. | - | granny |
| S31 | Glue a coin to the floor. | - | granny |
| S32 | Fill her slippers with cotton. | - | granny |
| S35 | Hide all the left shoes. | - | granny |
| S40 | Fill her umbrella with feathers. | - | granny |
| S41 | Put double-sided tape on the TV remote. | - | granny |
| S43 | Put a tiny toy car in her shoe. | - | granny |
| S49 | Hang the wall clock upside down. | - | granny |
| S51 | Make her umbrella refuse to open. | - | granny |
| S53 | Make her shoelaces disappear. | - | granny |
| S56 | Tie colourful ribbons on the fan. | Craft room / office | granny |
| S58 | Change the doorbell to a laughing sound. | - | granny |

### Store room (room #3 to unlock): 1 task

| Id | Task | Collect from | Target |
| --- | --- | --- | --- |
| A27 | Switch off all lights (except the bathroom) at the inverter while granny bathes, so she comes out to no light and no towel. | - | granny |

### Bedroom (room #4 to unlock): 3 tasks

| Id | Task | Collect from | Target |
| --- | --- | --- | --- |
| A3 | Put onion juice in Rani and Kamala's eye drops. | Kitchen | rani kamala |
| A37 | Break granny's medals and trophies and set them in front of her. | - | granny |
| S37 | Tie her curtains in a big knot. | - | granny |

### Dining room (room #5 to unlock): 4 tasks

| Id | Task | Collect from | Target |
| --- | --- | --- | --- |
| A15 | Put glue on a dining chair so whoever sits sticks. | Craft room / office | whoever sits (granny) |
| A26 | Break granny's favourite thalis. | - | granny |
| S14 | Put a whoopee cushion on granny's favourite chair. | - | granny |
| S25 | Put a rubber duck in her soup bowl. | Kitchen | granny |

### Dance room (room #6 to unlock): 1 task

| Id | Task | Collect from | Target |
| --- | --- | --- | --- |
| A12 | Pour water on the dance-room JBL speaker so it breaks (Anisha still deciding). | - | her (not said) |

### Craft room / office (room #7 to unlock): 0 tasks

No tasks yet.

### Study (room #8 to unlock): 7 tasks

| Id | Task | Collect from | Target |
| --- | --- | --- | --- |
| A14 | Rub pencil shavings and pen over her favourite books. | Craft room / office | her (granny or the scary teacher: not said) |
| S11 | Swap her reading glasses with funny coloured ones. | - | granny |
| S18 | Tie a balloon to her chair so it floats up when she stands. | - | granny |
| S23 | Tape all her pens to the table. | - | granny |
| S48 | Fill her pen with invisible ink. | - | granny |
| S50 | Glue her book's pages together. | Craft room / office | granny |
| S59 | Put stickers on her glasses. | - | granny |

### Puja room (room #9 to unlock): 1 task

| Id | Task | Collect from | Target |
| --- | --- | --- | --- |
| S3 | Hide her slippers near the puja room. | Granny's room | her (granny or the scary teacher: not said) |

### Play zone (roof) (room #10 to unlock): 0 tasks

No tasks yet.

### Mountain climbing room (room #12 to unlock): 0 tasks

No tasks yet.

### Bathroom (slots in where its tasks need it): 9 tasks

| Id | Task | Collect from | Target |
| --- | --- | --- | --- |
| A9 | Put colours on the scary teacher's clothes, then wash and dry them so they come out colourful. | Craft room / office | scary teacher |
| A10 | Mix lemon or something bitter into the scary teacher's shampoo. | Kitchen | scary teacher |
| A33 | Put oil and water on the bathroom floor before granny bathes. | Kitchen | granny |
| A36 | Fill the big white bathtub with slime. | - | granny |
| S16 | Swap her toothpaste with something sour. | - | granny |
| S24 | Swap her shampoo with colourful bubble liquid. | - | granny |
| S34 | Swap her shampoo and ketchup bottles. | Kitchen | granny |
| S45 | Put clear nail polish on the soap. | - | granny |
| S55 | Put salt on her toothbrush. | Kitchen | granny |

### Granny's room (slots in where its tasks need it): 16 tasks

| Id | Task | Collect from | Target |
| --- | --- | --- | --- |
| A16 | Break the glass of all her favourite photos. | - | her (granny or the scary teacher: not said) |
| A17 | Change her clock so she rushes to a birthday party that isn't happening. | - | her (granny or the scary teacher: not said) |
| A20 | Turn the astronaut light very bright so it shines in granny's eyes. | - | granny |
| A24 | Tear her clothes. | - | her (granny or the scary teacher: not said) |
| A25 | Break granny's specs. | - | granny |
| A28 | Pour mango juice on granny's charging watch. | Kitchen | granny |
| S2 | Cut small holes in her favourite hat with craft-room scissors. | Craft room / office | her (granny or the scary teacher: not said) |
| S19 | Put glitter in her hairbrush. | - | granny |
| S21 | Fill her handbag with ping-pong balls. | - | granny |
| S22 | Put a tiny animal-sound speaker under her bed. | - | granny |
| S33 | Put a tiny bell in her bag. | - | granny |
| S39 | Change her ringtone to a loud cow sound. | - | granny |
| S44 | Fill her pillow with bells. | - | granny |
| S46 | Sew her socks together. | - | granny |
| S54 | Fill her bed with toys. | Fluffy room | granny |
| S57 | Dip her comb in honey. | Kitchen | granny |

### Exercise room (slots in where its tasks need it): 3 tasks

| Id | Task | Collect from | Target |
| --- | --- | --- | --- |
| A5 | Put cement in Labubu's back-massage machine. | Kitchen | labubu |
| A18 | Secretly speed up the treadmill so she runs too fast and falls. | - | her (granny or the scary teacher: not said) |
| A19 | Put oil on the treadmill and set it to slow so she slips. | Kitchen | her (granny or the scary teacher: not said) |

### Yoga room (slots in where its tasks need it): 2 tasks

| Id | Task | Collect from | Target |
| --- | --- | --- | --- |
| A21 | Swap the yoga room's calm music for very loud music. | - | granny |
| A41 | Tear granny's yoga mat while she cooks. | - | granny |

### Roof (slots in where its tasks need it): 2 tasks

| Id | Task | Collect from | Target |
| --- | --- | --- | --- |
| A13 | Mix lemon and strawberry juice into the water tank / RO. | Kitchen | granny |
| A30 | Pour mango juice mixed with water on the roof solar panel so there's no hot water. | Kitchen | granny |

### Science lab (see decision) (slots in where its tasks need it): 1 task

| Id | Task | Collect from | Target |
| --- | --- | --- | --- |
| A2 | Put granny and Kamala / Rani and Kamala in a rocket with a bomb (level 2). | - | granny + Kamala (or Rani + Kamala) |

### Outside Granny's house (street, parked vehicles) (slots in where its tasks need it): 4 tasks

| Id | Task | Collect from | Target |
| --- | --- | --- | --- |
| A22 | Put glue all over granny's scooty. | Craft room / office | granny |
| A32 | Put cement all over granny's big bicycle. | Kitchen | granny |
| A34 | Put water in the engine of granny's Bullet. | - | granny |
| A35 | Take the wheels off granny's toy car. | - | granny |

## Park (playground, garden, sand park)

| Id | Room | Task | Collect from |
| --- | --- | --- | --- |
| A7 | Playground | Glue the bouncy ball so Kamala sticks to it. | Craft room / office |
| A31 | Garden | Pull out the roots of granny's garden plants. | - |
| A40 | Sand Park | In the Sand Park, lure the scary teacher there and throw sand in her eyes. | - |
| S26 | Garden | Fill her gloves with jelly. | - |
| S27 | Garden | Hide a toy snake in her garden hat. | - |
| S38 | Garden | Put sand in her watering can. | Sand Park |

## Swimming pool

| Id | Room | Task | Collect from |
| --- | --- | --- | --- |
| A43 | Pool deck | Put lots of oil in the swimming pool. | Kitchen |
| S4 | Pool deck | Wet her towel near the pool so there's no dry towel. | - |

## Palace

| Id | Room | Task | Collect from |
| --- | --- | --- | --- |
| A44 | Treasury | Steal granny's necklaces and earrings from the palace. | - |

## School, hospital, my little house

No task is placed here yet. The little house is where every level starts and ends (the scooty ride), and it is used as a **source**: task S54 needs the fluffy room's soft toys.

## Gaps and decisions

1. **Level 2 (rocket and bomb) conflicts with the room order.** The spec lists a science lab under Granny's house (to make the toy bomb), but the art pack puts the science lab in the **school**, which opens at level 45. Level 2 is fixed, so either the lab is a room in Granny's house or the bomb is found another way. The rocket and its launch spot are also not decided.
2. **Teacher tasks could live in the school.** The scary teacher is the target of A1, A4, A8, A9, A10, A11, A40 and S1. When the school opens at level 45, these fit it naturally: A4 (plum bowl) and A8 (cake) in the canteen, A11 (chocolate) and S1 (tea) in the staff room, A14 (books) in the library. *Proposal, not decided.*
3. **The hospital has nothing yet.** A3 (onion juice in eye drops) fits the hospital pharmacy better than a bedroom, and the spec mentions sick animals, needles and medicines, but there are no task ideas for them. This needs Anisha's ideas.
4. **"Her" is ambiguous.** About a dozen tasks say "her favourite..." without saying whether she means Granny or the scary teacher. They are marked "her (granny or the scary teacher: not said)" or assumed to be Granny. Worth asking Anisha.
5. **No room for parked vehicles.** A22 (scooty), A32 (bicycle), A34 (Bullet) and A35 (toy car) happen outside Granny's house, and the art pack has the vehicles but no room for them. The town streets need a front-yard space, which also fits the scooty ride.
6. **Timed tasks** (granny bathes, cooks or turns for the remote): A23, A27, A33, A41, A42. They need a way for Granny to be somewhere else at a set time.
7. **A lure mechanic** is needed for A40 (lure the teacher to the sand park).

## Objects the pack does not have

The art pack has 184 objects, but the tasks need more. These are the things the tasks use that have no picture or model yet, with how many tasks need each. They are the next 3D models to make after the Level 1 batch.

| Object | Tasks |
| --- | --- |
| shoes (shoe rack) | 5 |
| oil bottle | 3 |
| slippers | 3 |
| umbrella | 3 |
| clothes | 2 |
| handbag | 2 |
| jelly | 2 |
| mango juice | 2 |
| reading glasses | 2 |
| strawberry | 2 |
| "edible" label | 1 |
| Bullet motorbike (in the pack, not placed in a room) | 1 |
| RO water purifier | 1 |
| animal-sound speaker | 1 |
| astronaut light | 1 |
| back-massage machine | 1 |
| balloon | 1 |
| batteries | 1 |
| bell | 1 |
| bells | 1 |
| big bicycle (in the pack, not placed in a room) | 1 |
| bitter ingredient (karela) | 1 |
| bomb | 1 |
| bouncy ball | 1 |
| bowl | 1 |
| bubble liquid | 1 |
| bubble soap | 1 |
| bubble wrap | 1 |
| cake | 1 |
| cartoon face pictures | 1 |
| ceiling fan | 1 |
| chocolate | 1 |
| clear nail polish | 1 |
| clothes line (roof) | 1 |
| coin | 1 |
| comb | 1 |
| confetti | 1 |
| cotton | 1 |
| curtains | 1 |
| doorbell | 1 |
| double-sided tape | 1 |
| eye drops | 1 |
| fake cockroach | 1 |
| fake spider | 1 |
| feathers | 1 |
| flower | 1 |
| food colouring | 1 |
| funny coloured glasses | 1 |
| glasses | 1 |
| glitter | 1 |
| gloves | 1 |
| glue | 1 |
| googly eyes | 1 |
| granny's favourite bowl | 1 |
| grass | 1 |
| hairbrush | 1 |
| hat | 1 |
| honey | 1 |
| invisible ink | 1 |
| karela juice | 1 |
| ketchup bottle | 1 |
| milk | 1 |
| needle and thread | 1 |
| onion | 1 |
| orange juice | 1 |
| pencil shavings | 1 |
| phone | 1 |
| pillow | 1 |
| ping-pong balls | 1 |
| pizza | 1 |
| plum | 1 |
| ribbons | 1 |
| rocket | 1 |
| rubber duck | 1 |
| science lab in Granny's house | 1 |
| scooty (in the pack, but not placed in any room) | 1 |
| shoes (made by script) | 1 |
| socks | 1 |
| soup | 1 |
| sour stuff | 1 |
| specs (glasses) | 1 |
| stickers | 1 |
| tape | 1 |
| teapot | 1 |
| toast | 1 |
| toothbrush (only in the little house's bathroom) | 1 |
| toy car | 1 |
| toy car (in the pack, not placed in a room) | 1 |
| toy frog | 1 |
| toy snake | 1 |
| washing machine | 1 |
| watch charger | 1 |
| whoopee cushion | 1 |

## How the earliest level is worked out

Granny's rooms unlock one by one in the spec's order (kitchen, hall, store room, bedroom, dining room, dance room, craft office, study, puja room, play zone, climbing room). A task can only be played once every room it uses is open, so its "earliest" in `tasks.json` is the latest room among its own and its collect-from rooms. The bathroom, granny's room, exercise room, yoga room, roof and science lab have no fixed place in the order (the spec says they "slot in where their tasks need them"), so those are marked as slot-in rooms and need Anisha's call.
