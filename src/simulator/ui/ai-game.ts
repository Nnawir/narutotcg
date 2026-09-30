import { applyNarutoAction, availableNarutoActions, chooseNarutoAiAction, createNarutoPreviewMatch, narutoCard, narutoDecider } from '../engine/naruto';
import type { Action, CardInstance, CharacterInstance, PlayerId, SupportInstance } from '../engine/naruto';
import { cardImageMarkup, enhanceCardImages, resolveCardImage } from './card-image';

const player: PlayerId = 'p1';
const ai: PlayerId = 'p2';
const root = document.querySelector<HTMLElement>('#naruto-ai-game');
if (!root) throw new Error('Naruto AI game root is missing.');

let state = createNarutoPreviewMatch({ seed: 42, firstPlayer: player, names: { p1: 'You', p2: 'AI opponent' } });
let aiTimer: number | null = null;
let selected: string | null = null;
let mobilePreview: { src: string; alt: string } | null = null;
let notice = 'Your opening hand is ready.';
type Candidate = { label: string; action: Action };

const escapeHtml = (value: string | number | null | undefined) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const cardName = (id: string) => narutoCard(id)?.nameEn ?? id;
const actions = (): Candidate[] => availableNarutoActions(state, player);
const actionButton = (candidate: Candidate, cls = '') => `<button class="game-action ${cls}" type="button" data-action='${escapeHtml(JSON.stringify(candidate.action))}'>${escapeHtml(candidate.label)}</button>`;
const attackActions = (kind: 'leader' | 'character', uid: string) => actions().filter(c => c.action.type === 'DECLARE_ATTACK' && c.action.attackerKind === kind && c.action.attackerUid === uid);
const handActions = (card: CardInstance) => actions().filter(c => ['SUMMON', 'SET_SUPPORT', 'ACTIVATE_SUPPORT_FROM_HAND'].includes(c.action.type) && c.action.handUid === card.uid);

function dispatch(action: Action) {
  if (narutoDecider(state) !== player) return;
  const next = applyNarutoAction(state, action);
  if (next === state) { notice = 'The engine rejected that action.'; render(); return; }
  state = next; selected = null; notice = action.type === 'MULLIGAN' ? (action.keep ? 'Hand kept. Your turn is starting.' : 'New hand drawn.') : `Action resolved: ${action.type.replaceAll('_', ' ').toLowerCase()}.`; render(); scheduleAi();
}

function scheduleAi() {
  if (aiTimer !== null || narutoDecider(state) !== ai || state.winner) return;
  aiTimer = window.setTimeout(() => { aiTimer = null; const action = chooseNarutoAiAction(state, ai); if (!action) { notice = 'The AI has no action available.'; render(); return; } const next = applyNarutoAction(state, action); if (next !== state) { state = next; notice = `AI: ${action.type.replaceAll('_', ' ').toLowerCase()}.`; render(); } scheduleAi(); }, 450);
}

function selectedActions(): Candidate[] {
  if (!selected) return [];
  if (selected.startsWith('hand:')) { const card = state.players[player].hand.find(c => c.uid === selected.slice(5)); return card ? handActions(card) : []; }
  if (selected === 'leader') return actions().filter(c => c.action.type === 'LEADER_EFFECT' || c.action.type === 'RECOVERY' || (c.action.type === 'DECLARE_ATTACK' && c.action.attackerUid === `leader:${player}`));
  if (selected.startsWith('character:')) return actions().filter(c => c.action.uid === selected.slice(10) || (c.action.type === 'DECLARE_ATTACK' && c.action.attackerUid === selected.slice(10)));
  if (selected.startsWith('support:')) return actions().filter(c => c.action.type === 'ACTIVATE_SUPPORT' && c.action.slot === Number(selected.slice(8)));
  return [];
}

function renderCard(card: { uid: string; cardId: string }, key: string, opts: Candidate[] = [], extra = '') {
  const usable = opts.length > 0;
  const image = cardImageMarkup(card.cardId, cardName(card.cardId));
  const fallback = image ? '' : `<div class="game-card-copy"><strong>${escapeHtml(cardName(card.cardId))}</strong><span>${escapeHtml(card.cardId)}</span></div>`;
  return `<article class="game-card ${extra} ${usable ? 'is-usable' : ''} ${selected === key ? 'is-selected' : ''}" data-select="${escapeHtml(key)}" tabindex="0" aria-label="${escapeHtml(cardName(card.cardId))}">${image}${fallback}</article>`;
}
function renderCharacter(c: CharacterInstance | null, side: PlayerId) { if (!c) return '<div class="game-slot empty-slot">Empty</div>'; const key = `character:${c.uid}`; return `<div class="game-slot">${renderCard(c, key, side === player ? (selected === key ? selectedActions() : attackActions('character', c.uid)) : [], c.rested ? 'rested' : '')}<small>${c.rested ? 'Rested' : 'Ready'}${c.damage ? ` · ${c.damage} damage` : ''}</small></div>`; }
function renderSupport(s: SupportInstance | null, slot: number, side: PlayerId) { if (!s) return '<div class="game-slot empty-slot">Support</div>'; const visible = s.revealed || side === player; if (!visible) return '<div class="game-slot"><div class="game-card face-down"><strong>Set support</strong></div></div>'; const key = `support:${slot}`; return `<div class="game-slot">${renderCard(s, key, side === player ? (selected === key ? selectedActions() : []) : [], s.revealed ? '' : 'face-down')}</div>`; }
function renderPiles(p: (typeof state.players)[PlayerId]) { return `<div class="pile-zone"><div class="pile deck-pile"><span class="zone-label">Deck</span><span class="pile-stack" aria-hidden="true"></span><strong>${p.deck.length}</strong></div><div class="pile trash-pile"><span class="zone-label">Trash</span><span class="pile-stack trash-stack" aria-hidden="true"></span><strong>${p.trash.length}</strong></div></div>`; }
function renderBoard(id: PlayerId) {
  const p = state.players[id]; const own = id === player; const leader = { uid: `leader:${id}`, cardId: p.leaderId }; const leaderKey = own ? 'leader' : `leader:${id}`;
  const chakra = p.chakra.map(c => `<span class="chakra-card ${c.faceUp ? 'ready' : 'spent'}" title="${escapeHtml(cardName(c.cardId))}">${cardImageMarkup(c.cardId, cardName(c.cardId))}</span>`).join('');
  const opponentHand = own ? '' : `<div class="opponent-hand" aria-label="Opponent hand, ${p.hand.length} cards">${p.hand.map(() => '<span class="hand-back" aria-hidden="true"></span>').join('')}</div>`;
  return `<section class="player-board ${own ? 'you' : 'opponent'}"><header class="player-summary"><div><span>${own ? 'YOUR FIELD' : 'OPPONENT FIELD'}</span><strong>${escapeHtml(p.name)}</strong></div>${opponentHand}<dl><div><dt>Life</dt><dd>${p.life}</dd></div><div><dt>Hand</dt><dd>${p.hand.length}</dd></div></dl></header><div class="board-zones naruto-field-grid"><div class="board-zone character-zone"><div class="field-zone-heading"><span>Character area</span></div><div class="slots">${p.characters.map(c => renderCharacter(c, id)).join('')}</div></div><div class="board-zone support-zone"><div class="field-zone-heading"><span>Support area</span></div><div class="slots">${p.supports.map((s, i) => renderSupport(s, i, id)).join('')}</div></div><div class="resource-zone chakra-zone"><div class="field-zone-heading"><span>Chakra</span></div><div class="chakra-row">${chakra || '<span class="resource-empty">No chakra</span>'}</div></div><div class="summon-zone"><span class="summon-card ${p.summon.rested ? 'spent' : 'ready'}">${cardImageMarkup(p.summon.cardId, cardName(p.summon.cardId))}</span><small>Summon</small></div><div class="leader-zone"><span class="zone-label">Leader</span>${renderCard(leader, leaderKey, own ? (selected === leaderKey ? selectedActions() : attackActions('leader', `leader:${player}`)) : [], p.leaderRested ? 'rested' : '')}<b>${p.life}<small>life</small></b></div>${renderPiles(p)}</div></section>`;
}
function renderTargets() { const attacker = selected && (selected === 'leader' || selected.startsWith('character:')) ? selected : null; if (!attacker) return ''; const uid = attacker === 'leader' ? `leader:${player}` : attacker.slice(10); const candidates = attackActions(attacker === 'leader' ? 'leader' : 'character', uid); if (!candidates.length) return ''; return `<section class="target-strip"><span>Choose an attack target</span>${candidates.map(c => actionButton(c, 'target-action')).join('')}</section>`; }
function renderControls() {
  const decider = narutoDecider(state); if (state.winner) return `<section class="game-controls winner"><h2>${state.winner === player ? 'Victory' : 'AI wins'}</h2><button class="game-action primary" data-restart>Start a new game</button></section>`;
  if (decider !== player) return `<section class="game-controls waiting"><span class="pulse-dot"></span><div><h2>AI is thinking</h2><p>Waiting for the upstream engine to finish the opponent’s turn.</p></div></section>`;
  if (state.awaitingMulligan === player) { const a = actions(); return `<section class="game-controls focus"><span class="eyebrow">Opening hand</span><h2>Keep or redraw your hand</h2><p>Choose an engine action before the first turn begins.</p><div class="choice-actions">${a.map(c => actionButton(c, c.action.type === 'MULLIGAN' && c.action.keep ? 'primary' : '')).join('')}</div></section>`; }
  if (state.pendingChoice?.player === player) { const a = actions(); return `<section class="game-controls focus"><span class="eyebrow">Your choice</span><h2>Choose a card</h2><p>${escapeHtml(state.pendingChoice.promptKey.replace('prompt.', '').replaceAll('.', ' '))}</p><div class="choice-actions">${a.map(c => actionButton(c, 'primary')).join('')}</div></section>`; }
  if (state.step === 'counter') { const a = actions(); return `<section class="game-controls focus"><span class="eyebrow">Counter window</span><h2>Respond or pass</h2><div class="choice-actions">${a.map(c => actionButton(c, c.action.type === 'PASS_COUNTER' ? 'primary' : '')).join('')}</div></section>`; }
  const end = actions().find(c => c.action.type === 'END_TURN'); const chosen = selectedActions(); return `<section class="game-controls"><span class="eyebrow">Your action window</span><h2>${selected ? 'Choose an action' : 'Choose a card to play'}</h2><p>${escapeHtml(notice)}</p><div class="choice-actions">${chosen.map(c => actionButton(c, 'primary')).join('')}${end ? actionButton(end, 'end-turn') : ''}</div></section>`;
}
function renderHand() { const hand = state.players[player].hand; return `<section class="hand-zone"><div class="zone-heading"><div><span class="zone-label">Your hand</span><strong>${hand.length} cards</strong></div><small>Click a card to see its legal actions</small></div><div class="hand-cards">${hand.map(c => renderCard(c, `hand:${c.uid}`, handActions(c), selected === `hand:${c.uid}` ? 'hand-selected' : '')).join('')}</div></section>`; }
function renderLog() { const preview = mobilePreview ? `<img src="${escapeHtml(mobilePreview.src)}" alt="${escapeHtml(mobilePreview.alt)}" />` : '<span>Hover a card to preview it</span>'; return `<aside class="game-sidebar"><section class="card-preview-panel"><h2>Card preview</h2><div class="card-preview-content">${preview}</div></section><section class="side-actions">${renderControls()}</section><section class="game-log"><div class="log-heading"><h2>Game log</h2><button type="button" data-log-toggle>Hide</button></div><ol>${state.log.slice(-8).reverse().map(l => `<li><span>T${l.turn}</span>${escapeHtml(l.key.replace('log.', '').replaceAll(/([A-Z])/g, ' $1'))}</li>`).join('') || '<li>Game starting…</li>'}</ol></section></aside>`; }
function bindInteractions() {
  root.querySelectorAll<HTMLElement>('[data-action]').forEach(b => { if (b.dataset.bound) return; b.dataset.bound = 'true'; b.addEventListener('click', () => dispatch(JSON.parse(b.dataset.action ?? '{}') as Action)); });
  root.querySelectorAll<HTMLImageElement>('[data-card-image]').forEach(image => {
    if (image.dataset.bound) return;
    image.dataset.bound = 'true';
    const updatePreview = () => { if (!image.src) return; const preview = root.querySelector<HTMLElement>('.card-preview-content'); if (preview) preview.innerHTML = `<img src="${escapeHtml(image.currentSrc || image.src)}" alt="${escapeHtml(image.alt)}" />`; };
    const clearPreview = () => {
      if (!window.matchMedia('(hover: hover)').matches) return;
      const preview = root.querySelector<HTMLElement>('.card-preview-content');
      if (!preview) return;
      preview.innerHTML = mobilePreview
        ? `<img src="${escapeHtml(mobilePreview.src)}" alt="${escapeHtml(mobilePreview.alt)}" />`
        : '<span>Hover a card to preview it</span>';
    };
    image.addEventListener('mouseenter', updatePreview);
    image.addEventListener('mouseleave', clearPreview);
    image.addEventListener('click', () => { mobilePreview = { src: image.currentSrc || image.src, alt: image.alt }; });
  });
  root.querySelectorAll<HTMLElement>('[data-select]').forEach(el => { if (el.dataset.bound) return; el.dataset.bound = 'true'; el.addEventListener('click', () => { selected = el.dataset.select ?? null; const image = el.querySelector<HTMLImageElement>('[data-card-image]'); if (image) mobilePreview = { src: image.currentSrc || image.src, alt: image.alt }; notice = selected?.startsWith('hand:') ? 'Choose one of the legal actions below.' : 'Selected. Choose an action or an attack target.'; render(); }); });
  root.querySelector<HTMLButtonElement>('[data-restart]')?.addEventListener('click', () => { state = createNarutoPreviewMatch({ seed: Math.floor(Math.random() * 1_000_000), names: { p1: 'You', p2: 'AI opponent' } }); selected = null; notice = 'Your opening hand is ready.'; render(); scheduleAi(); });
  root.querySelectorAll<HTMLButtonElement>('[data-log-toggle]').forEach(b => { if (b.dataset.bound) return; b.dataset.bound = 'true'; b.addEventListener('click', () => root.classList.toggle('log-open')); });
  enhanceCardImages(root, { clickPreview: false });
}

function render() {
  const turnLabel = state.winner ? 'Game complete' : narutoDecider(state) === player ? 'Your turn' : 'AI turn';
  const statusMarkup = `<section class="game-status"><div class="turn-indicator ${narutoDecider(state) === player ? 'your-turn' : ''}"><i></i><strong>${turnLabel}</strong><span>${escapeHtml(state.phase)} phase · ${escapeHtml(state.step)}</span></div><p>${escapeHtml(notice)}</p></section>`;
  const battlefieldMarkup = `<main class="battlefield">${renderBoard(ai)}<div class="versus-divider"><span>VS</span></div>${renderBoard(player)}${renderTargets()}${renderHand()}</main>`;
  if (!root.dataset.mounted) {
    root.innerHTML = `<div class="game-topbar"><a href="/simulator/">← Simulator</a><div><strong>Play vs AI</strong><span>Preview rules · Turn ${state.turn}</span></div><button class="ruleset-badge" type="button" data-log-toggle>Game log</button></div>${statusMarkup}<div class="game-layout">${battlefieldMarkup}${renderLog()}</div>`;
    root.dataset.mounted = 'true';
  } else {
    root.querySelector('.game-status')?.replaceWith(document.createRange().createContextualFragment(statusMarkup));
    root.querySelector('.battlefield')?.replaceWith(document.createRange().createContextualFragment(battlefieldMarkup));
    root.querySelector('.game-sidebar')?.replaceWith(document.createRange().createContextualFragment(renderLog()));
  }
  bindInteractions();
}
render(); scheduleAi();
