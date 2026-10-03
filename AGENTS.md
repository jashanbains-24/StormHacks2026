# Agent Guidance

## Sequential, maintainable changes

- Work in small, sequential steps. Finish and verify one behavior before starting
  the next.
- Refactor the affected code as each step is completed; do not accumulate
  temporary duplication, oversized methods, dead code, or deferred cleanup.
- Keep future changes easy by extracting reusable data, entities, systems, and
  UI wrappers instead of adding one-off scene logic.
- Preserve the project boundaries: content belongs in `src/data`, pure game
  rules in `src/sim`, state in `src/state`, and Phaser presentation in scenes,
  entities, systems, or UI modules.
- Prefer extending existing abstractions over creating parallel implementations.
- After every substantive change, run the relevant tests, type-check, production
  build, formatting check, and linter diagnostics before committing.
- Keep commits focused and push verified milestones as work progresses.
