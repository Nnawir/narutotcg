import {
  applyAction,
  chooseAiAction,
  createInitialState,
  deciderOf,
  PREVIEW_DECKS,
  previewDeckList,
} from '../../../vendor/tcg-engines/submodules/naruto/packages/engine/src/index.ts';
import type {
  Action,
  CardInstance,
  CharacterInstance,
  GameState,
  PlayerId,
  SupportInstance,
} from '../../../vendor/tcg-engines/submodules/naruto/packages/engine/src/index.ts';
import { getCardById } from '@tcg-engines/naruto-cards';
import { cardImageMarkup, enhanceCardImages } from './card-image';

const player: PlayerId = 'p1';
const ai: PlayerId = 'p2';
const root = document.querySelector<HTMLElement>('#naruto-ai-game');

if (!root) throw new Error('Naruto AI game root is missing.');

let state = createInitialState({
  seed: 42,
  decks: {
    p1: previewDeckList(PREVIEW_DECKS[0]!),
    p2: previewDeckList(PREVIEW_DECKS[2]!),
  },
  firstPlayer: player,
  names: { p1: 'You', p2: 'AI opponent' },
});
let aiTimer: number | null = null;
let notice = 'Game created from the upstream Preview decks.';

type Candidate = { label: string; action: Action };

const escapeHtml = (value: string | number | null | undefined) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

function cardName(cardId: string): string {
  return getCardById(cardId)?.nameEn ?? cardId;
}

function cardMeta(cardId: string): string {
  const card = getCardById(cardId);
  if (!card) return cardId;
  const stats = [card.power !== null ? `${card.power} POW` : '', card.damage !== null ? `${card.damage} DMG` : '', card.health !== null ? `${card.health} HP` : ''].filter(Boolean);
  return [card.cardType.replace('_', ' '), ...stats].join(' · ');
}

function isLegal(action: Action): boolean {
  return applyAction(state, action) !== state;
}

function handCandidates(card: CardInstance): Candidate[] {
  return [
    { label: 'Summon', action: { type: 'SUMMON', player, handUid: card.uid } },
    { label: 'Set support', action: { type: 'SET_SUPPORT', player, handUid: card.uid } },
    { label: 'Play support', action: { type: 'ACTIVATE_SUPPORT_FROM_HAND', player, handUid: card.uid } },
  ].filter((candidate) => isLegal(candidate.action));
}

function attackCandidates(kind: 'leader' | 'character', attackerUid: string): Candidate[] {
  const opponent = state.players[ai];
  const targets: Array<{ label: string; targetKind: 'leader' | 'character'; targetUid: string }> = [
    { label: `Attack ${opponent.name}'s Leader`, targetKind: 'leader', targetUid: `leader:${ai}` },
    ...opponent.characters.flatMap((character) =>
      character ? [{ label: `Attack ${cardName(character.cardId)}`, targetKind: 'character' as const, targetUid: character.uid }] : [],
    ),
  ];
  return targets
    .map((target) => ({
      label: target.label,
      action: { type: 'DECLARE_ATTACK', player, attackerKind: kind, attackerUid, targetKind: target.targetKind, targetUid: target.targetUid },
    }))
    .filter((candidate) => isLegal(candidate.action));
}

function characterCandidates(character: CharacterInstance): Candidate[] {
  return [
    { label: 'Activate ability', action: { type: 'ACTIVATE_CHARACTER', player, uid: character.uid } },
    ...attackCandidates('character', character.uid),
  ].filter((candidate) => isLegal(candidate.action));
}

function supportCandidates(support: SupportInstance, slot: number): Candidate[] {
  return [{ label: 'Activate support', action: { type: 'ACTIVATE_SUPPORT', player, slot } }].filter((candidate) =>
    isLegal(candidate.action),
  );
}

function leaderCandidates(): Candidate[] {
  return [
    { label: 'Activate Leader effect', action: { type: 'LEADER_EFFECT', player } },
    { label: 'Recovery', action: { type: 'RECOVERY', player } },
    ...attackCandidates('leader', `leader:${player}`),
  ].filter((candidate) => isLegal(candidate.action));
}

function dispatch(action: Action): void {
  if (deciderOf(state) !== player) return;
  const next = applyAction(state, action);
  if (next === state) {
    notice = 'That action is no longer legal in the current state.';
    render();
    return;
  }
  state = next;
  notice = `Applied ${action.type.replaceAll('_', ' ').toLowerCase()}.`;
  render();
  scheduleAi();
}

function scheduleAi(): void {
  if (aiTimer !== null || deciderOf(state) !== ai || state.winner) return;
  aiTimer = window.setTimeout(() => {
    aiTimer = null;
    const action = chooseAiAction(state, ai);
    if (!action) {
      notice = 'The upstream AI has no action for this state.';
      render();
      return;
    }
    const next = applyAction(state, action);
    if (next === state) {
      notice = 'The upstream AI proposed an action rejected by the engine.';
      render();
      return;
    }
    state = next;
    notice = `AI applied ${action.type.replaceAll('_', ' ').toLowerCase()}.`;
    render();
    scheduleAi();
  }, 450);
}

function actionButton(candidate: Candidate, className = ''): string {
  return `<button class="game-action ${className}" type="button" data-action='${escapeHtml(JSON.stringify(candidate.action))}'>${escapeHtml(candidate.label)}</button>`;
}

function renderCard(card: CardInstance, options: Candidate[] = [], extra = ''): string {
  return `<article class="game-card ${extra}">
    ${cardImageMarkup(card.cardId, cardName(card.cardId))}
    <div class="game-card-copy"><strong>${escapeHtml(cardName(card.cardId))}</strong>
    <span>${escapeHtml(cardMeta(card.cardId))}</span></div>
    ${options.length ? `<div class="game-card-actions">${options.map((candidate) => actionButton(candidate)).join('')}</div>` : ''}
  </article>`;
}

function renderCharacter(character: CharacterInstance | null, side: PlayerId): string {
  if (!character) return '<div class="game-slot empty-slot">Empty</div>';
  const options = side === player ? characterCandidates(character) : [];
  const stateLabels = [character.rested ? 'Rested' : 'Ready', character.damage ? `${character.damage} damage` : ''];
  return `<div class="game-slot">${renderCard(character, options, character.rested ? 'rested' : '')}<small>${stateLabels.filter(Boolean).join(' · ')}</small></div>`;
}

function renderSupport(support: SupportInstance | null, slot: number, side: PlayerId): string {
  if (!support) return '<div class="game-slot empty-slot">Support</div>';
  const visibleCard = support.revealed || side === player;
  const options = side === player ? supportCandidates(support, slot) : [];
  return `<div class="game-slot">${visibleCard ? renderCard(support, options, support.revealed ? '' : 'face-down') : '<div class="game-card face-down"><strong>Set support</strong></div>'}</div>`;
}

function renderPlayerBoard(id: PlayerId): string {
  const boardPlayer = state.players[id];
  const own = id === player;
  const leader = { uid: `leader:${id}`, cardId: boardPlayer.leaderId };
  const leaderOptions = own ? leaderCandidates() : [];
  const chakra = boardPlayer.chakra.map((card) => `<span class="chakra-card ${card.faceUp ? 'ready' : 'spent'}" title="${escapeHtml(cardName(card.cardId))}">${cardImageMarkup(card.cardId, cardName(card.cardId))}</span>`).join('');
  return `<section class="player-board ${own ? 'you' : 'opponent'}" aria-label="${escapeHtml(boardPlayer.name)} board">
    <header class="player-summary">
      <div><span>${own ? 'You' : 'AI opponent'}</span><strong>${escapeHtml(boardPlayer.name)}</strong></div>
      <dl><div><dt>Life</dt><dd>${boardPlayer.life}</dd></div><div><dt>Deck</dt><dd>${boardPlayer.deck.length}</dd></div><div><dt>Trash</dt><dd>${boardPlayer.trash.length}</dd></div></dl>
    </header>
    <div class="board-zones">
      <div class="leader-zone"><span class="zone-label">Leader</span>${renderCard(leader, leaderOptions, boardPlayer.leaderRested ? 'rested' : '')}</div>
      <div class="board-zone"><span class="zone-label">Characters</span><div class="slots">${boardPlayer.characters.map((character) => renderCharacter(character, id)).join('')}</div></div>
      <div class="board-zone"><span class="zone-label">Supports</span><div class="slots">${boardPlayer.supports.map((support, slot) => renderSupport(support, slot, id)).join('')}</div></div>
      <div class="resource-zone"><span class="zone-label">Chakra</span><div class="chakra-row">${chakra}</div><span class="summon-card ${boardPlayer.summon.rested ? 'spent' : 'ready'}">${cardImageMarkup(boardPlayer.summon.cardId, cardName(boardPlayer.summon.cardId))}</span><small>Summon: ${boardPlayer.summon.rested ? 'rested' : 'ready'}</small></div>
    </div>
  </section>`;
}

function renderControls(): string {
  const decider = deciderOf(state);
  if (state.winner) return `<section class="game-controls winner"><h2>${state.winner === player ? 'You win' : 'AI wins'}</h2><button class="game-action primary" type="button" data-restart>Start a new game</button></section>`;
  if (decider !== player) return `<section class="game-controls"><h2>AI is taking its turn</h2><p>The upstream engine and <code>chooseAiAction</code> control the AI action.</p></section>`;
  if (state.awaitingMulligan === player) {
    return `<section class="game-controls"><h2>Opening hand</h2><p>Keep this hand or use the engine’s mulligan action.</p>${actionButton({ label: 'Keep hand', action: { type: 'MULLIGAN', player, keep: true } }, 'primary')}${actionButton({ label: 'Mulligan', action: { type: 'MULLIGAN', player, keep: false } })}</section>`;
  }
  if (state.pendingChoice?.player === player) {
    const choice = state.pendingChoice;
    const options = choice.options.map((option) => ({ label: `${cardName(option.cardId)} · ${option.zone}`, action: { type: 'RESOLVE_CHOICE' as const, player, key: option.key } }));
    if (choice.cancellable) options.push({ label: 'Cancel choice', action: { type: 'RESOLVE_CHOICE', player, key: null } });
    return `<section class="game-controls"><h2>Choose a target</h2><p>${escapeHtml(choice.promptKey.replace('prompt.', '').replaceAll('.', ' '))}</p><div class="choice-actions">${options.map((candidate) => actionButton(candidate, 'primary')).join('')}</div></section>`;
  }
  if (state.step === 'counter') {
    const supports = state.players[player].supports.flatMap((support, slot) => support ? supportCandidates(support, slot) : []);
    const pass: Candidate = { label: 'Pass priority', action: { type: 'PASS_COUNTER', player } };
    return `<section class="game-controls"><h2>Counter window</h2><p>You have priority. Play a legal set support or pass.</p><div class="choice-actions">${supports.map((candidate) => actionButton(candidate)).join('')}${isLegal(pass.action) ? actionButton(pass, 'primary') : ''}</div></section>`;
  }
  const endTurn: Candidate = { label: 'End turn', action: { type: 'END_TURN', player } };
  return `<section class="game-controls"><h2>Your action window</h2><p>Select an action on a Leader, Character, Support, or card in your hand.</p>${isLegal(endTurn.action) ? actionButton(endTurn, 'primary') : ''}</section>`;
}

function renderHand(): string {
  const hand = state.players[player].hand;
  return `<section class="hand-zone" aria-label="Your hand"><div class="zone-heading"><span class="zone-label">Your hand</span><strong>${hand.length} cards</strong></div><div class="hand-cards">${hand.map((card) => renderCard(card, handCandidates(card))).join('') || '<p class="empty-hand">No cards in hand.</p>'}</div></section>`;
}

function renderLog(): string {
  const lines = state.log.slice(-8).reverse();
  return `<aside class="game-log"><h2>Game log</h2><ol>${lines.map((line) => `<li><span>T${line.turn}</span> ${escapeHtml(line.key.replace('log.', '').replaceAll(/([A-Z])/g, ' $1'))}</li>`).join('') || '<li>Game starting…</li>'}</ol></aside>`;
}

function render(): void {
  root.innerHTML = `<div class="game-topbar"><a href="/simulator/">← Simulator</a><div><strong>Play vs AI</strong><span>Upstream Naruto Preview engine</span></div><span class="ruleset-badge">${escapeHtml(state.rulesProfile.id)} · v${state.rulesProfile.version}</span></div>
  <section class="game-status"><div><span>Turn ${state.turn}</span><strong>${state.phase} phase</strong><small>${state.step === 'counter' ? 'Counter window' : 'Normal step'}</small></div><p>${escapeHtml(notice)}</p></section>
  <div class="game-layout"><div class="battlefield">${renderPlayerBoard(ai)}${renderPlayerBoard(player)}${renderHand()}${renderControls()}</div>${renderLog()}</div>`;
  root.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
    button.addEventListener('click', () => dispatch(JSON.parse(button.dataset.action ?? '{}') as Action));
  });
  root.querySelector<HTMLButtonElement>('[data-restart]')?.addEventListener('click', () => {
    state = createInitialState({ seed: Math.floor(Math.random() * 1_000_000), decks: { p1: previewDeckList(PREVIEW_DECKS[0]!), p2: previewDeckList(PREVIEW_DECKS[2]!) }, names: { p1: 'You', p2: 'AI opponent' } });
    notice = 'New game created.';
    render();
    scheduleAi();
  });
  enhanceCardImages(root);
}

render();
scheduleAi();
