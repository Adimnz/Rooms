# LightUp — Museum Annex

The existing procedural WebGL2 exploration game remains the starting experience. The **Museum of Necessary Lessons** is an optional, self-contained sequence of new rooms. No original shaders, palette definitions, movement, ambient sound effects, or room-generation algorithms were replaced.

## Entering the exhibits

1. Open `LightUp_0.2.html` from a web server with `museum-annex.js` in the same directory.
2. Choose **Click to explore**.
3. In the starting room, look for the narrow freestanding exhibition threshold near the initial spawn point, roughly three meters to the east.
4. Aim at the threshold and press **E**.
5. Walk eastward through the museum doors. Existing movement, map, controls and ambience are preserved.
6. Return to the original corridors via the doorway in the arrival exhibit or final exhibit.

A simple local development server can be started with `python -m http.server 8000` from the repository directory, then opening `http://localhost:8000/LightUp_0.2.html`.

## New rooms

- Arrival / orientation
- The Comedian Who Whines — stage and audience
- The Complaint Chamber — punishment reconstructions
- The Last Performance — microphone, laughter-as-text, single slow clap
- The Mother Who Held Too Tightly
- The Doctor Who Stopped Listening
- The Soldier Who Followed Correctly
- The Friend Who Made Everything About Himself
- The Woman Who Forgave Too Easily
- The Witness Who Looked Away
- The Man Who Needed to Be Right
- The Caregiver Who Needed to Be Needed
- The Optimist Who Called Suffering Beautiful

Every authored room has a title plaque, archival monitor, specific low-poly staging, at least one interactive device, a restricted staff access prop, and a symbolic final artifact. Narration is **text only**, with deliberately extended subtitle timing. The sole added sound is a faint periodic **single clap** near the Comedian's final microphone. No synthesized or recorded character speech is used.

## Architecture

The original HTML file gains only one script import. The optional `museum-annex.js` installs narrow hooks for authored room specifications, scene furnishing, interaction and text pacing. No existing systems are rewritten. The new rooms occupy a separate coordinate range, reached through an optional teleport threshold. All custom structures are built using the project's own WebGL2 `Mesh`, mannequin and furniture model builders; no external 3D library or asset download is required.

Exhibit interaction progress and observation counters are stored under `lightup.annex.v1` in `localStorage`. Existing save data is untouched.

## Editing

Each entry of the `exhibits` array defines a title, lines, interaction choices, responses and artifact. The `buildAuthored` function constructs the low-poly models and per-room interaction locations. The `update` wrapper manages slow text pacing and optional exhibit effects.

## Status

The module passed JavaScript syntax checks and authored-room construction tests using a lightweight mock of the existing mesh API. It has **not** been visually validated in a live browser here; test collisions, door placement, interaction targeting and the full route before merging.
