# Simulator adapter boundary

`vendor/tcg-engines` is the upstream Git submodule. Do not copy or alter its
Naruto rules, effects, cards, reducer, or AI here.

All executable integration goes through `../engine/naruto.ts`:

- `createNarutoPreviewMatch` creates the same upstream Preview match for AI
  and PvP;
- `applyNarutoAction` is the only action-validation gateway;
- `chooseNarutoAiAction` delegates computer decisions upstream;
- `availableNarutoActions` only prepares UI/transport payloads and asks
  upstream whether every payload is legal.

When gameplay is added, the Cloudflare Worker / Durable Object should become
the authoritative owner of a `GameState`. It must validate every submitted
action by calling upstream `applyAction(state, action)` and reject it when the
same state reference is returned. The UI receives a player-safe projection of
that state and never decides legality itself.

For AI games, call `chooseNarutoAiAction(state, player)` and route the result
through `applyNarutoAction`. This keeps AI and human players on one rules
engine.

Keep NarutoCardGuide-specific transport, persistence, analytics, and UI in
`src/simulator`; keep game rules upstream. Persist the engine's serialized
`rulesProfile` alongside each result, using `MatchResultRecord` from
`../engine/upstream.ts` as the app-owned persistence contract.

See `docs/upstream-naruto-engine.md` for the full no-surprises update and
validation procedure. Any compatibility change is handled in this adapter
layer, not by editing the submodule.
