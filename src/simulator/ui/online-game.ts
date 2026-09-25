import { cardImageMarkup, enhanceCardImages } from './card-image';

type PlayerId = 'p1' | 'p2';
type Card = { uid: string; cardId?: string; name?: string; revealed?: boolean; rested?: boolean; damage?: number } | null;
type Action = { label: string; action: Record<string, unknown> };
type ProjectedState = {
  type: 'state'; turn: number; phase: string; step: string; activePlayer: PlayerId; decider: PlayerId | null; winner: PlayerId | null;
  rulesProfile: { id: string; version: number; status: string };
  players: Record<PlayerId, { id: PlayerId; name: string; leaderId: string; leaderName: string; life: number; leaderRested: boolean; deckCount: number; hand: Card[] | null; handCount: number; trash: Card[]; characters: Card[]; supports: Card[]; chakra: Array<{ cardId: string; faceUp: boolean }>; summon: { cardId: string; rested: boolean } }>;
  log: Array<{ turn: number; actor: string; key: string }>;
  availableActions: Action[];
};
type Session = { matchId: string; playerId: PlayerId; ticket: string };

const root = document.querySelector<HTMLElement>('#naruto-online-game');
if (!root) throw new Error('Naruto online game root is missing.');

const storageKey = 'naruto-simulator-online-session';
const queueTokenKey = 'naruto-simulator-queue-token';
let socket: WebSocket | null = null;
let session: Session | null = readSession();
let game: ProjectedState | null = null;
let status = session ? 'Reconnecting to your match…' : 'Ready to find an opponent.';
let reconnectAttempts = 0;

function gateway(): string {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return 'ws://127.0.0.1:8787';
  return `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`;
}

function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function readSession(): Session | null {
  try {
    const value = localStorage.getItem(storageKey);
    if (!value) return null;
    const parsed = JSON.parse(value) as Session;
    return parsed.matchId && parsed.ticket && (parsed.playerId === 'p1' || parsed.playerId === 'p2') ? parsed : null;
  } catch { return null; }
}

function queueToken(): string {
  let token = localStorage.getItem(queueTokenKey);
  if (!token) { token = crypto.randomUUID(); localStorage.setItem(queueTokenKey, token); }
  return token;
}

function cardName(card: Card): string { return card?.name ?? (card?.revealed === false ? 'Set support' : card?.cardId ?? 'Empty'); }

function renderCard(card: Card): string {
  if (!card) return '<div class="game-slot empty-slot">Empty</div>';
  const rested = card.rested ? 'rested' : '';
  const state = card.revealed === false ? 'face-down' : rested;
  return `<div class="game-slot"><article class="game-card ${state}">${card.cardId ? cardImageMarkup(card.cardId, cardName(card)) : ''}<div class="game-card-copy"><strong>${escapeHtml(cardName(card))}</strong><span>${card.damage ? `${card.damage} damage` : card.revealed === false ? 'face down' : 'in play'}</span></div></article></div>`;
}

function board(id: PlayerId): string {
  if (!game) return '';
  const player = game.players[id];
  const own = session?.playerId === id;
  const chakra = player.chakra.map((card) => `<span class="chakra-card ${card.faceUp ? 'ready' : 'spent'}">${cardImageMarkup(card.cardId, 'Chakra Card')}</span>`).join('');
  return `<section class="player-board ${own ? 'you' : 'opponent'}"><header class="player-summary"><div><span>${own ? 'You' : 'Opponent'}</span><strong>${escapeHtml(player.name)}</strong></div><dl><div><dt>Life</dt><dd>${player.life}</dd></div><div><dt>Deck</dt><dd>${player.deckCount}</dd></div><div><dt>Hand</dt><dd>${player.handCount}</dd></div><div><dt>Trash</dt><dd>${player.trash.length}</dd></div></dl></header><div class="board-zones"><div class="leader-zone"><span class="zone-label">Leader</span><article class="game-card ${player.leaderRested ? 'rested' : ''}">${cardImageMarkup(player.leaderId, player.leaderName)}<div class="game-card-copy"><strong>${escapeHtml(player.leaderName)}</strong><span>Leader</span></div></article></div><div class="board-zone"><span class="zone-label">Characters</span><div class="slots">${player.characters.map(renderCard).join('')}</div></div><div class="board-zone"><span class="zone-label">Supports</span><div class="slots">${player.supports.map(renderCard).join('')}</div></div><div class="resource-zone"><span class="zone-label">Chakra</span><div class="chakra-row">${chakra}</div><span class="summon-card ${player.summon.rested ? 'spent' : 'ready'}">${cardImageMarkup(player.summon.cardId, 'Summon Card')}</span><small>Summon: ${player.summon.rested ? 'rested' : 'ready'}</small></div></div></section>`;
}

function hand(): string {
  if (!game || !session) return '';
  const cards = game.players[session.playerId].hand ?? [];
  return `<section class="hand-zone"><div class="zone-heading"><span class="zone-label">Your hand</span><strong>${cards.length} cards</strong></div><div class="hand-cards">${cards.map((card) => `<article class="game-card">${card?.cardId ? cardImageMarkup(card.cardId, cardName(card)) : ''}<div class="game-card-copy"><strong>${escapeHtml(cardName(card))}</strong><span>${escapeHtml(card?.cardId ?? '')}</span></div></article>`).join('')}</div></section>`;
}

function controls(): string {
  if (!game || !session) return '';
  if (game.winner) return `<section class="game-controls winner"><h2>${game.winner === session.playerId ? 'You win' : 'Opponent wins'}</h2><p>This PvP match is complete.</p></section>`;
  if (game.decider !== session.playerId) return '<section class="game-controls"><h2>Waiting for opponent</h2><p>The server is authoritative; you can act when it grants your player priority.</p></section>';
  return `<section class="game-controls"><h2>Your legal actions</h2><p>Every option below was derived and validated by the server’s upstream Naruto engine.</p><div class="choice-actions">${game.availableActions.map((item, index) => `<button class="game-action ${index === game.availableActions.length - 1 && item.action.type === 'END_TURN' ? 'primary' : ''}" type="button" data-online-action="${index}">${escapeHtml(item.label)}</button>`).join('')}</div></section>`;
}

function log(): string {
  if (!game) return '';
  return `<aside class="game-log"><h2>Game log</h2><ol>${game.log.slice().reverse().map((entry) => `<li><span>T${entry.turn}</span>${escapeHtml(entry.key.replace('log.', '').replaceAll(/([A-Z])/g, ' $1'))}</li>`).join('')}</ol></aside>`;
}

function render(): void {
  if (!session && !game) {
    root.innerHTML = `<div class="game-topbar"><a href="/simulator/">← Simulator</a><div><strong>Play Online</strong><span>Authoritative multiplayer</span></div></div><section class="online-lobby"><p class="eyebrow">Matchmaking</p><h1>Find an opponent.</h1><p>${escapeHtml(status)}</p><button class="game-action primary" type="button" data-join>Join matchmaking</button></section>`;
    root.querySelector<HTMLButtonElement>('[data-join]')?.addEventListener('click', joinQueue);
    return;
  }
  if (!game) {
    root.innerHTML = `<div class="game-topbar"><a href="/simulator/">← Simulator</a><div><strong>Play Online</strong><span>Connecting match</span></div></div><section class="online-lobby"><p>${escapeHtml(status)}</p></section>`;
    return;
  }
  root.innerHTML = `<div class="game-topbar"><a href="/simulator/">← Simulator</a><div><strong>Play Online</strong><span>Authoritative PvP</span></div><span class="ruleset-badge">${escapeHtml(game.rulesProfile.id)} · v${game.rulesProfile.version}</span></div><section class="game-status"><div><span>Turn ${game.turn}</span><strong>${escapeHtml(game.phase)} phase</strong><small>${escapeHtml(game.step)} step</small></div><p>${escapeHtml(status)}</p></section><div class="game-layout"><div class="battlefield">${board(session.playerId === 'p1' ? 'p2' : 'p1')}${board(session.playerId)}${hand()}${controls()}</div>${log()}</div>`;
  root.querySelectorAll<HTMLButtonElement>('[data-online-action]').forEach((button) => button.addEventListener('click', () => {
    const action = game?.availableActions[Number(button.dataset.onlineAction)]?.action;
    if (action && socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'action', action }));
  }));
  enhanceCardImages(root);
}

function joinQueue(): void {
  status = 'Searching for an opponent…'; render();
  socket?.close();
  socket = new WebSocket(`${gateway()}/api/matchmaking?queueToken=${encodeURIComponent(queueToken())}`);
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data) as { type: string } & Partial<Session>;
    if (message.type === 'queued') { status = 'In queue. Waiting for another player…'; render(); }
    if (message.type === 'matched' && message.matchId && message.ticket && (message.playerId === 'p1' || message.playerId === 'p2')) {
      session = { matchId: message.matchId, ticket: message.ticket, playerId: message.playerId };
      localStorage.setItem(storageKey, JSON.stringify(session));
      status = 'Opponent found. Connecting to the game…';
      connectGame();
    }
  };
  socket.onerror = () => { status = 'Unable to reach the matchmaking server.'; render(); };
}

function connectGame(): void {
  if (!session) return;
  socket?.close();
  socket = new WebSocket(`${gateway()}/api/games/${encodeURIComponent(session.matchId)}?playerId=${session.playerId}&ticket=${encodeURIComponent(session.ticket)}`);
  socket.onopen = () => { reconnectAttempts = 0; status = 'Connected.'; };
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data) as ProjectedState | { type: 'error'; message: string };
    if (message.type === 'state') { game = message; status = 'Connected.'; render(); }
    if (message.type === 'error') { status = message.message; render(); }
  };
  socket.onclose = () => {
    if (!session || game?.winner) return;
    reconnectAttempts += 1;
    status = 'Connection interrupted. Reconnecting…'; render();
    window.setTimeout(connectGame, Math.min(1_000 * reconnectAttempts, 5_000));
  };
  socket.onerror = () => { status = 'Connection error. Retrying…'; render(); };
}

render();
if (session) connectGame();
