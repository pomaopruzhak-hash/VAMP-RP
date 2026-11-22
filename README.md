# VAMP RP — browser prototype

This repository contains an early technical prototype for the VAMP RP project.

## Important status note

This is **not** the complete VAMP RP game. Most gameplay systems are currently documented as design decisions and are not implemented in code. See `docs/VAMP-RP-GAME-DESIGN.md` for the consolidated game-design specification, including confirmed features and unresolved decisions.

## Prototype contents

- `public/` — browser client, styles, and game scene.
- `server/` — Node.js server prototype.
- `package.json` — project dependencies and scripts.
- `docs/VAMP-RP-GAME-DESIGN.md` — consolidated project specification.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm start
```

Open `http://localhost:3000` in a browser.

## Current limitations

- This prototype has not been validated as a production multiplayer service.
- A 50-player capacity has not been load-tested.
- Full map, economy, factions, businesses, inventory persistence, vehicle ownership, auction, and complete combat systems are not implemented.
- Do not treat this archive as an App Store-ready build.
