# LightUp: furnished rooms and recorded sound

Open `LightUp_0.2.html` and click **Explore**. The default starting room is now
The Shuttered Arrival. Follow its east door through The Family Suite, The Long
Reading Room, The Broadcast Parlour and The Nursery at the End. The fifth room
continues into the procedural maze. The optional museum entrance still works.
Selecting a specific archetype with F2 uses the existing room tools instead.

Keep `room-physics.js`, `detailed-rooms.js`, `game-audio.js`, `museum-annex.js` and
the `Sound Effects` directory beside the HTML. Gameplay needs no package install.
For local HTTP use, run `python -m http.server 8000` in this directory.

The background MP3 streams from a single media element, starts after the first
click, and loops at its natural end. Entering rooms or portals never seeks or
recreates it. B mutes audio while the ambience timeline continues. The light sound ("A Fluorescent Bulb II") uses
four reusable voices with distance attenuation, stereo panning, wall occlusion,
approach hysteresis and a cooldown. It plays on approach and when nearby lights
switch on, including recovery from a flicker. Direct `file:` launches use native
media playback for light effects to avoid browser Web Audio file restrictions;
stereo panning is available when served over HTTP.

The rooms contain layered wall framing, skirting and cornices, curved arches,
sash windows, hinged louvered shutters, hanging framed pictures, fringed rugs,
spindle beds with slats and quilts, flickering CRTs, turning fans, suitcases,
individual books and pages, toys, balls, cans and small household objects.

- Bump loose props to push them. Sprinting transfers more momentum.
- E picks up small props; E again puts them down; Q throws them.
- E pushes larger loose objects, toggles lamps, monitors, fans and shutters,
  operates light switches, or inspects fixed furniture and architecture.
- Cabinets, loaded bookcases, desks and beds stay anchored or too heavy to push.
  Windows and frames stay attached. Rugs support the player as shallow surfaces.
- Mannequin heads track the player within sight. A strong push or sprint impact
  topples a mannequin, which curls over roughly twelve seconds and merges into
  a rolling ball. Moved props and the transformation survive room unloading in
  the current session. Reloading the page starts a fresh physical scene.

Physics uses substepped gravity, contact impulses, mass, friction, restitution,
sleeping and spatial buckets. Rotated static boxes collide with current object
bounds; moving props share one live collider with movement, targeting and lights.
Movable objects use conservative bounding boxes, with spheres for rolling props.
Fixed furniture uses separate part boxes so books on shelves remain accessible.
This is a lightweight game solver, not a jointed rigid-body or cloth simulation.

`tests/room-behavior.cjs` runs actual Chromium/WebGL checks. With a local server
running and Playwright installed, run `node tests/room-behavior.cjs`. Set
`LIGHTUP_PLAYWRIGHT` to an installed module path if needed and `LIGHTUP_CHROME`
to override the Chrome executable. Screenshots are written to ignored `artifacts/`.
