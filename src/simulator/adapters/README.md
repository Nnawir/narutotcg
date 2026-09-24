# Simulator adapter boundary

`vendor/tcg-engines` is the upstream Git submodule. Do not copy or alter its
Naruto rules, effects, cards, reducer, or AI here.

When gameplay is added, the Cloudflare Worker / Durable Object should become
the authoritative owner of a `GameState`. It must validate every submitted
action by calling upstream `applyAction(state, action)` and reject it when the
same state reference is returned. The UI receives a player-safe projection of
that state and never decides legality itself.

For AI games, call upstream `chooseAiAction(state, player)` and route the
result through that same validation path. This keeps AI and human players on
one rules engine.

Keep NarutoCardGuide-specific transport, persistence, analytics, and UI in
`src/simulator`; keep game rules upstream. Persist the engine's serialized
`rulesProfile` alongside each result, using `MatchResultRecord` from
`../engine/upstream.ts` as the app-owned persistence contract.

## Updating upstream

```sh
git submodule update --init --recursive
git submodule update --remote --merge vendor/tcg-engines
```

Review the new upstream commit and run its focused Naruto checks before
committing the updated gitlink. Any compatibility change is handled in this
adapter layer, not by editing the submodule.
