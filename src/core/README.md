# Floor Core

The integrator owns this directory. Floor branches treat it as read-only.

## Public floor API

Floors may import only:

- `src/core/contracts`
- `src/core/ui-kit`
- files inside their own floor folder

`FloorModule` is versioned by `FLOOR_CONTRACT_VERSION`. Runtime discovery uses
`import.meta.glob` over `src/floors/floor-*/index.ts`; there is no registration
list.

## Development harness

Run `npm run dev`, then open:

- `/?floor=f00` — tutorial
- `/?floor=f01` — scalability
- `/?floor=f02` — storage placeholder

When a floor query is present, controls in the lower-left switch floors and
preview `calm`, `strained`, `down`, and `fixed` simulation states. Floors read
the preview through `ctx.preview` and the matching mock data through
`ctx.sim.snapshot`.

## Guardrails

`npm run validate:floors` checks folder/id matching, import boundaries,
namespaced content, runtime contract conformance, duplicate IDs/orders, and
glossary references.

On branches named `floor/00-*`, `floor/01-*`, or `floor/02-*`, the same command
also rejects changed files outside that floor's folder.

Run `npm run setup:hooks` once after cloning to enable the repository's
pre-push validation hook. Pull requests and pushes to `floor/**` branches run
the same validation in CI.
