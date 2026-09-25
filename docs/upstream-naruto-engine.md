# Updating the Naruto upstream engine

`vendor/tcg-engines` is a Git submodule pinned to a specific upstream commit.
It is the source of truth for Naruto cards, rules profiles, game state,
actions, effects, target restrictions, victory conditions, and upstream AI.
NarutoCardGuide must not invent behavior that the submodule does not expose.

## Integration boundary

Only `src/simulator/engine/naruto.ts` imports executable Naruto engine code.
It offers the application these four responsibilities:

1. create a Preview match with `createNarutoPreviewMatch`;
2. validate and transition state with `applyNarutoAction`;
3. ask the upstream AI with `chooseNarutoAiAction`;
4. form UI/transport action candidates with `availableNarutoActions`, then
   validate each candidate through the upstream reducer.

The AI page and the authoritative PvP Worker both consume this boundary. The
browser never decides whether an Online action is legal; the Worker applies
the upstream reducer and broadcasts a redacted state projection. Match
statistics persist the upstream `rulesProfile.id` and `rulesProfile.version`.

NarutoCardGuide-specific code is limited to rendering, image resolution,
WebSocket transport, player-safe state projection, matchmaking, reconnects,
and persistence of completed-match metadata.

## Safe update procedure

Run these commands from the NarutoCardGuide repository. Inspect changes before
recording a Git submodule pointer; do not edit any file inside the submodule.

```powershell
git submodule update --init --recursive
git -C vendor/tcg-engines fetch origin
git -C vendor/tcg-engines log --oneline HEAD..origin/main
git -C vendor/tcg-engines diff -- submodules/naruto
git -C vendor/tcg-engines checkout origin/main
git diff --submodule=log -- vendor/tcg-engines
```

Review the upstream release notes and the changed files under
`submodules/naruto`. In particular, look for changes to exported action types,
`RulesProfile`, card IDs/data, state shape, action creation, and tests. Do not
translate upstream provisional or missing behavior into local rules.

If the public engine API changed, adapt only `src/simulator/engine/naruto.ts`.
If upstream introduces a new action type that must be shown to humans, add its
payload construction only to `availableNarutoActions`; keep legality delegated
to `applyNarutoAction`.

## Required validation

First run upstream's own Naruto engine suite:

```powershell
npm run test:upstream
```

Then compile NarutoCardGuide's boundary and UI:

```powershell
npm run verify:simulator
```

`verify:simulator` intentionally runs the upstream engine suite and the Astro
build. `astro check` is not part of this gate because the vendor monorepo also
contains unrelated simulators with optional framework dependencies that are
not installed by NarutoCardGuide.

For the PvP integration, start only the local Worker in one terminal:

```powershell
npm run worker:dev
```

In another terminal, run:

```powershell
npm run test:pvp
npm run worker:check
```

`test:pvp` checks matchmaking, player authorization, state redaction,
authoritative action rejection, synchronized state progression, reconnection,
rules-profile propagation, and Chakra/Summon card identities. `worker:check`
is a Wrangler dry-run only; it does not deploy.

Finally, manually load both local modes. In AI, complete opening choices,
summon, attack, resolve a choice/counter if offered, and confirm that the
upstream rules-profile badge is shown. In PvP, use two local sessions and
confirm the same state transition reaches both clients.

For statistics, complete one local PvP match with the `MATCH_RESULTS` binding
configured and verify the stored row contains the upstream ruleset id/version,
leaders, winner, first player, and turn count. A ruleset-version change is
expected after an upstream update and must remain visible in historical rows.
