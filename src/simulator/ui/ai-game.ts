import {
  applyNarutoAction,
  availableNarutoActions,
  chooseNarutoAiAction,
  createNarutoPreviewMatch,
  narutoCard,
  narutoDecider,
} from '../engine/naruto';
import type { Action, CardInstance, CharacterInstance, PlayerId } from '../engine/naruto';
import { cardImageMarkup, enhanceCardImages } from './card-image';

const player: PlayerId = 'p1';
const ai: PlayerId = 'p2';
const root = document.querySelector<HTMLElement>('#naruto-ai-game');

if (!root) throw new Error('Naruto AI game root is missing.');

let state = createNarutoPreviewMatch({
  seed: 42,
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
  return narutoCard(cardId)?.nameEn ?? cardId;
}

function cardMeta(cardId: string): string {
  const card = narutoCard(cardId);
  if (!card) return cardId;
  const stats = [
    card.power !== null ? `${card.power} POW` : '',
    card.damage !== null ? `${card.damage} DMG` : '',
    card.health !== null ? `${card.health} HP` : '',
  ].filter(Boolean);
  return [card.cardType.replace('_', ' '), ...stats].join(' · ');
}

function currentActions(): Candidate[] {
  return availableNarutoActions(state, player);
}

function handCandidates(card: CardInstance): Candidate[] {
  return currentActions().filter(
    (candidate) =>
      (candidate.action.type === 'SUMMON' ||
        candidate.action.type === 'SET_SUPPORT' ||
        candidate.action.type === 'ACTIVATE_SUPPORT_FROM_HAND') &&
      candidate.action.handUid === card.uid,
  );
}

function attackCandidates(kind: 'leader' | 'character', attackerUid: string): Candidate[] {
  return currentActions().filter(
    (candidate) =>
      candidate.action.type === 'DECLARE_ATTACK' &&
      candidate.action.attackerKind === kind &&
      candidate.action.attackerUid === attackerUid,
  );
}

function characterCandidates(character: CharacterInstance): Candidate[] {
  return [
    ...currentActions().filter(
      (candidate) => candidate.action.type === 'ACTIVATE_CHARACTER' && candidate.action.uid === character.uid,
    ),
    ...attackCandidates('character', character.uid),
  ];
}

function supportCandidates(slot: number): Candidate[] {
  return currentActions().filter(
    (candidate) => candidate.action.type === 'ACTIVATE_SUPPORT' && candidate.action.slot === slot,
  );
}

function leaderCandidates(): Candidate[] {
  return [
    ...currentActions().filter(
      (candidate) => candidate.action.type === 'LEADER_EFFECT' || candidate.action.type === 'RECOVERY',
    ),
    ...attackCandidates('leader', `leader:${player}`),
  ];
}

function dispatch(action: Action): void {
  if (narutoDecider(state) !== player) return;
  const next = applyNarutoAction(state, action);
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
  if (aiTimer !== null || narutoDecider(state) !== ai || state.winner) return;
  aiTimer = window.setTimeout(() => {
    aiTimer = null;
    const action = chooseNarutoAiAction(state, ai);
    if (!action) {
      notice = 'The upstream AI has no action for this state.';
      render();
      return;
    }
    const next = applyNarutoAction(state, action);
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
  const stateLabels = [
    character.rested ? 'Rested' : 'Ready',
    character.damage ? `${character.damage} damage` : '',
  ];
  return `<div class="game-slot">${renderCard(character, options, character.rested ? 'rested' : '')}<small>${stateLabels.filter(Boolean).join(' · ')}</small></div>`;
}

function renderSupport(support: SupportInstance | null, slot: number, side: PlayerId): string {
  if (!support) return '<div class="game-slot empty-slot">Support</div>';
  const visibleCard = support.revealed || side === player;
  const options = side === player ? supportCandidates(slot) : [];
  return `<div class="game-slot">${visibleCard ? renderCard(support, options, support.revealed ? '' : 'face-down') : '<div class="game-card face-down"><strong>Set support</strong></div>'}</div>`;
}

function renderPlayerBoard(id: PlayerId): string {
  const boardPlayer = state.players[id];
  const own = id === player;
  const leader = { uid: `leader:${id}`, cardId: boardPlayer.leaderId };
  const leaderOptions = own ? leaderCandidates() : [];
  const chakra = boardPlayer.chakra
    .map(
      (card) =>
        `<span class="chakra-card ${card.faceUp ? 'ready' : 'spent'}" title="${escapeHtml(cardName(card.cardId))}">${cardImageMarkup(card.cardId, cardName(card.cardId))}</span>`,
    )
    .join('');
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
  const decider = narutoDecider(state);
  if (state.winner)
    return `<section class="game-controls winner"><h2>${state.winner === player ? 'You win' : 'AI wins'}</h2><button class="game-action primary" type="button" data-restart>Start a new game</button></section>`;
  if (decider !== player)
    return `<section class="game-controls"><h2>AI is taking its turn</h2><p>The upstream engine and <code>chooseAiAction</code> control the AI action.</p></section>`;
  if (state.awaitingMulligan === player) {
    const actions = currentActions();
    return `<section class="game-controls"><h2>Opening hand</h2><p>Keep this hand or use the engine’s mulligan action.</p>${actions.map((candidate) => actionButton(candidate, candidate.action.type === 'MULLIGAN' && candidate.action.keep ? 'primary' : '')).join('')}</section>`;
  }
  if (state.pendingChoice?.player === player) {
    const choice = state.pendingChoice;
    const options = currentActions();
    return `<section class="game-controls"><h2>Choose a target</h2><p>${escapeHtml(choice.promptKey.replace('prompt.', '').replaceAll('.', ' '))}</p><div class="choice-actions">${options.map((candidate) => actionButton(candidate, 'primary')).join('')}</div></section>`;
  }
  if (state.step === 'counter') {
    const actions = currentActions();
    return `<section class="game-controls"><h2>Counter window</h2><p>You have priority. Play a legal set support or pass.</p><div class="choice-actions">${actions.map((candidate) => actionButton(candidate, candidate.action.type === 'PASS_COUNTER' ? 'primary' : '')).join('')}</div></section>`;
  }
  const endTurn = currentActions().find((candidate) => candidate.action.type === 'END_TURN');
  return `<section class="game-controls"><h2>Your action window</h2><p>Select an action on a Leader, Character, Support, or card in your hand.</p>${endTurn ? actionButton(endTurn, 'primary') : ''}</section>`;
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
    state = createNarutoPreviewMatch({
      seed: Math.floor(Math.random() * 1_000_000),
      names: { p1: 'You', p2: 'AI opponent' },
    });
    notice = 'New game created.';
    render();
    scheduleAi();
  });
  enhanceCardImages(root);
}

render();
scheduleAi();
