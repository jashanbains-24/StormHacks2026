# Uptime

Uptime is a 2D office game that teaches system design by putting an intern in
charge of a production outage. Walk the office, learn jargon from the SRE, then
drag, wire, and stress-test a real architecture.

Built for StormHacks 2026 with Phaser 3, TypeScript, and Vite.

## Play

The latest `main` build deploys automatically with GitHub Pages:

<https://jashanbains-24.github.io/StormHacks2026/>

### Controls

- `WASD` or arrow keys: move
- `E`: interact with the elevator, specialist, and build console
- Mouse: drag components and wire `OUT` ports to `IN` ports
- Right-click: remove a placed build component

## Local development

Requires Node.js 22 or a current LTS release.

```bash
npm install
npm run dev
```

Open <http://localhost:8080>.

Useful checks:

```bash
npm test          # pure simulation, evaluator, dialogue, and state tests
npm run typecheck
npm run build     # verified production build in dist/
npm run format
```

## Architecture

The project deliberately separates the educational model from Phaser:

- `src/sim/`: pure TypeScript traffic simulation and design evaluator; no
  Phaser imports.
- `src/data/`: floor content, dialogue, glossary, component copy, and teaching
  outcomes.
- `src/state/`: progression, tech debt, and accessibility preferences.
- `src/scenes/`: world, build console, loading, and HUD orchestration.
- `src/entities/`, `src/systems/`, `src/ui/`: focused presentation modules.
- `src/config/theme.ts`: shared visual tokens.
- `src/config/simConfig.ts`: capacities, failure thresholds, and stress phases.

The stress test models incoming RPS, round-robin load distribution, server
capacity, sustained overload, an injected server failure, dropped requests,
and stability. `Client → Load Balancer → 3 Servers` is the canonical solution.

## Adding a floor

1. Add the floor and component limits in `src/data/floors.ts`.
2. Add stable dialogue IDs in `src/data/dialogue.ts` and terms in
   `src/data/glossary.ts`.
3. Add known designs and teaching messages in `src/data/solutions.ts`.
4. Add any new pure component behavior to `src/sim/` with tests.
5. Compose the floor from reusable world systems and document new assets in
   `CREDITS.md`.

New educational content should be data. Scene code should only orchestrate and
render it.

## Deployment

`.github/workflows/deploy.yml` tests and builds every push to `main`, then
publishes `dist/` through GitHub Pages.

For the repository URL, production Vite uses `/StormHacks2026/` as its base.
For a custom `.tech` domain:

1. Add the domain to `public/CNAME`.
2. Set `CUSTOM_DOMAIN=true` in the build step so Vite uses `/`.
3. Point the domain's DNS records to GitHub Pages.
4. Configure the same custom domain under repository **Settings → Pages**.

## Credits

See [CREDITS.md](CREDITS.md) for reused code and visual assets.
