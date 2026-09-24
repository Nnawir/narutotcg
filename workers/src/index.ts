import {
  applyAction,
  createInitialState,
  deciderOf,
  PREVIEW_DECKS,
  previewDeckList,
} from '../../vendor/tcg-engines/submodules/naruto/packages/engine/src/index.ts';
import type {
  Action,
  CardInstance,
  GameState,
  PlayerId,
  SupportInstance,
} from '../../vendor/tcg-engines/submodules/naruto/packages/engine/src/index.ts';
import { getCardById } from '@tcg-engines/naruto-cards';

type PlayerSession = { matchId: string; playerId: PlayerId; ticket: string };
type SocketAttachment = { playerId: PlayerId } | { queueToken: string };

type StoredMatch = {
  matchId: string;
  game: GameState;
  startedAt: string;
  firstPlayer: PlayerId;
  resultSaved: boolean;
};

export interface Env {
  MATCHMAKER: DurableObjectNamespace;
  GAME_ROOM: DurableObjectNamespace;
  MATCH_RESULTS?: D1Database;
}

const json = (value: unknown) => JSON.stringify(value);
const playerIds: readonly PlayerId[] = ['p1', 'p2'];

function requireUpgrade(request: Request): Response | null {
  return request.headers.get('Upgrade')?.toLowerCase() === 'websocket'
    ? null
    : new Response('WebSocket upgrade required', { status: 426 });
}

function readPlayerId(value: string | null): PlayerId | null {
  return value === 'p1' || value === 'p2' ? value : null;
}

function cardView(card: CardInstance) {
  const definition = getCardById(card.cardId);
  return { uid: card.uid, cardId: card.cardId, name: definition?.nameEn ?? card.cardId };
}

function projectSupport(support: SupportInstance | null, owner: PlayerId, viewer: PlayerId) {
  if (!support) return null;
  if (owner !== viewer && !support.revealed) return { uid: support.uid, revealed: false };
  return { ...cardView(support), revealed: Boolean(support.revealed) };
}

function legalActions(state: GameState, player: PlayerId): Array<{ label: string; action: Action }> {
  if (deciderOf(state) !== player || state.winner) return [];
  const legal = (label: string, action: Action) => (applyAction(state, action) === state ? [] : [{ label, action }]);
  const actor = state.players[player];
  const opponentId: PlayerId = player === 'p1' ? 'p2' : 'p1';
  const opponent = state.players[opponentId];

  if (state.awaitingMulligan === player) {
    return [
      ...legal('Keep hand', { type: 'MULLIGAN', player, keep: true }),
      ...legal('Mulligan', { type: 'MULLIGAN', player, keep: false }),
    ];
  }
  if (state.pendingChoice?.player === player) {
    const choices = state.pendingChoice.options.flatMap((option) =>
      legal(`Choose ${cardView({ uid: option.key, cardId: option.cardId }).name}`, {
        type: 'RESOLVE_CHOICE', player, key: option.key,
      }),
    );
    return state.pendingChoice.cancellable
      ? [...choices, ...legal('Cancel choice', { type: 'RESOLVE_CHOICE', player, key: null })]
      : choices;
  }
  if (state.step === 'counter') {
    return [
      ...actor.supports.flatMap((support, slot) =>
        support ? legal(`Activate ${cardView(support).name}`, { type: 'ACTIVATE_SUPPORT', player, slot }) : [],
      ),
      ...legal('Pass priority', { type: 'PASS_COUNTER', player }),
    ];
  }

  const actions: Array<{ label: string; action: Action }> = [];
  for (const card of actor.hand) {
    const name = cardView(card).name;
    actions.push(...legal(`Summon ${name}`, { type: 'SUMMON', player, handUid: card.uid }));
    actions.push(...legal(`Set ${name} as support`, { type: 'SET_SUPPORT', player, handUid: card.uid }));
    actions.push(...legal(`Play ${name} support`, { type: 'ACTIVATE_SUPPORT_FROM_HAND', player, handUid: card.uid }));
  }
  actions.push(...legal('Activate Leader effect', { type: 'LEADER_EFFECT', player }));
  actions.push(...legal('Recovery', { type: 'RECOVERY', player }));

  const targets = [
    { label: `${opponent.name}'s Leader`, targetKind: 'leader' as const, targetUid: `leader:${opponentId}` },
    ...opponent.characters.flatMap((character) =>
      character ? [{ label: cardView(character).name, targetKind: 'character' as const, targetUid: character.uid }] : [],
    ),
  ];
  for (const target of targets) {
    actions.push(...legal(`Attack ${target.label}`, {
      type: 'DECLARE_ATTACK', player, attackerKind: 'leader', attackerUid: `leader:${player}`,
      targetKind: target.targetKind, targetUid: target.targetUid,
    }));
  }
  for (const character of actor.characters) {
    if (!character) continue;
    const name = cardView(character).name;
    actions.push(...legal(`Activate ${name}`, { type: 'ACTIVATE_CHARACTER', player, uid: character.uid }));
    for (const target of targets) {
      actions.push(...legal(`${name}: attack ${target.label}`, {
        type: 'DECLARE_ATTACK', player, attackerKind: 'character', attackerUid: character.uid,
        targetKind: target.targetKind, targetUid: target.targetUid,
      }));
    }
  }
  actions.push(...legal('End turn', { type: 'END_TURN', player }));
  return actions;
}

function projectState(state: GameState, viewer: PlayerId) {
  const projectPlayer = (id: PlayerId) => {
    const player = state.players[id];
    const own = id === viewer;
    return {
      id,
      name: player.name,
      leaderId: player.leaderId,
      leaderName: getCardById(player.leaderId)?.nameEn ?? player.leaderId,
      life: player.life,
      leaderRested: player.leaderRested,
      deckCount: player.deck.length,
      hand: own ? player.hand.map(cardView) : null,
      handCount: player.hand.length,
      trash: player.trash.map(cardView),
      characters: player.characters.map((character) =>
        character ? { ...cardView(character), rested: character.rested, damage: character.damage } : null,
      ),
      supports: player.supports.map((support) => projectSupport(support, id, viewer)),
      chakra: player.chakra.map((chakra) => ({ cardId: chakra.cardId, faceUp: chakra.faceUp })),
      summon: { cardId: player.summon.cardId, rested: player.summon.rested },
    };
  };
  return {
    type: 'state',
    rulesProfile: { id: state.rulesProfile.id, version: state.rulesProfile.version, status: state.rulesProfile.status },
    turn: state.turn,
    phase: state.phase,
    step: state.step,
    activePlayer: state.activePlayer,
    decider: deciderOf(state),
    winner: state.winner,
    players: { p1: projectPlayer('p1'), p2: projectPlayer('p2') },
    pendingChoice: state.pendingChoice?.player === viewer
      ? { promptKey: state.pendingChoice.promptKey, options: state.pendingChoice.options.map((option) => ({ key: option.key, cardId: option.cardId, name: getCardById(option.cardId)?.nameEn ?? option.cardId })) }
      : state.pendingChoice ? { player: state.pendingChoice.player } : null,
    log: state.log.slice(-12).map(({ turn, actor, key }) => ({ turn, actor, key })),
    availableActions: legalActions(state, viewer),
  };
}

export class Matchmaker {
  constructor(readonly state: DurableObjectState, readonly env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/claim') return this.claim(url);
    const upgradeError = requireUpgrade(request);
    if (upgradeError) return upgradeError;
    const queueToken = url.searchParams.get('queueToken');
    if (!queueToken || queueToken.length < 16) return new Response('Missing queue token', { status: 400 });

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.serializeAttachment({ queueToken } satisfies SocketAttachment);
    this.state.acceptWebSocket(server);
    await this.joinQueue(server, queueToken);
    return new Response(null, { status: 101, webSocket: client });
  }

  private async claim(url: URL): Promise<Response> {
    const matchId = url.searchParams.get('matchId') ?? '';
    const playerId = readPlayerId(url.searchParams.get('playerId'));
    const ticket = url.searchParams.get('ticket') ?? '';
    if (!playerId || !matchId || !ticket) return new Response('Invalid session', { status: 400 });
    const stored = await this.state.storage.get<string>(`ticket:${matchId}:${playerId}`);
    return stored === ticket ? new Response('ok') : new Response('Unauthorized', { status: 401 });
  }

  private async joinQueue(socket: WebSocket, queueToken: string): Promise<void> {
    const waiting = await this.state.storage.get<{ queueToken: string }>('waiting');
    if (!waiting || waiting.queueToken === queueToken) {
      await this.state.storage.put('waiting', { queueToken });
      socket.send(json({ type: 'queued' }));
      return;
    }
    const waitingSocket = this.state.getWebSockets().find((candidate) =>
      (candidate.deserializeAttachment() as SocketAttachment | null)?.queueToken === waiting.queueToken,
    );
    if (!waitingSocket) {
      await this.state.storage.put('waiting', { queueToken });
      socket.send(json({ type: 'queued' }));
      return;
    }
    const matchId = crypto.randomUUID();
    const p1: PlayerSession = { matchId, playerId: 'p1', ticket: crypto.randomUUID() };
    const p2: PlayerSession = { matchId, playerId: 'p2', ticket: crypto.randomUUID() };
    await this.state.storage.put({
      [`ticket:${matchId}:p1`]: p1.ticket,
      [`ticket:${matchId}:p2`]: p2.ticket,
    });
    await this.state.storage.delete('waiting');
    waitingSocket.send(json({ type: 'matched', ...p1 }));
    socket.send(json({ type: 'matched', ...p2 }));
    waitingSocket.close(1000, 'matched');
    socket.close(1000, 'matched');
  }

  async webSocketClose(socket: WebSocket): Promise<void> {
    const attachment = socket.deserializeAttachment() as SocketAttachment | null;
    if (!attachment || !('queueToken' in attachment)) return;
    const waiting = await this.state.storage.get<{ queueToken: string }>('waiting');
    if (waiting?.queueToken === attachment.queueToken) await this.state.storage.delete('waiting');
  }
}

export class GameRoom {
  private stored: StoredMatch | null = null;
  private readonly ready: Promise<void>;

  constructor(readonly state: DurableObjectState, readonly env: Env) {
    this.ready = state.blockConcurrencyWhile(async () => {
      this.stored = (await state.storage.get<StoredMatch>('match')) ?? null;
    });
  }

  async fetch(request: Request): Promise<Response> {
    await this.ready;
    const upgradeError = requireUpgrade(request);
    if (upgradeError) return upgradeError;
    const url = new URL(request.url);
    const playerId = readPlayerId(url.searchParams.get('playerId'));
    const ticket = url.searchParams.get('ticket') ?? '';
    const matchId = url.pathname.split('/').at(-1) ?? '';
    if (!playerId || !(await this.authorize(matchId, playerId, ticket))) {
      return new Response('Unauthorized game session', { status: 401 });
    }
    if (!this.stored) {
      const game = createInitialState({
        seed: Math.floor(Math.random() * 0x7fffffff),
        decks: { p1: previewDeckList(PREVIEW_DECKS[0]!), p2: previewDeckList(PREVIEW_DECKS[2]!) },
        names: { p1: 'Player 1', p2: 'Player 2' },
      });
      this.stored = { matchId, game, startedAt: new Date().toISOString(), firstPlayer: game.activePlayer, resultSaved: false };
      await this.persist();
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.serializeAttachment({ playerId } satisfies SocketAttachment);
    this.state.acceptWebSocket(server);
    this.sendState(server, playerId);
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): Promise<void> {
    await this.ready;
    const attachment = socket.deserializeAttachment() as SocketAttachment | null;
    if (!attachment || !('playerId' in attachment) || !this.stored || typeof message !== 'string') return;
    let payload: { type?: string; action?: Action };
    try { payload = JSON.parse(message) as { type?: string; action?: Action }; } catch { socket.send(json({ type: 'error', code: 'invalid_message', message: 'Invalid message.' })); return; }
    if (payload.type !== 'action' || !payload.action || payload.action.player !== attachment.playerId) {
      socket.send(json({ type: 'error', code: 'unauthorized_action', message: 'This player cannot submit that action.' }));
      return;
    }
    let next: GameState;
    try { next = applyAction(this.stored.game, payload.action); } catch { socket.send(json({ type: 'error', code: 'invalid_action', message: 'Action payload rejected.' })); return; }
    if (next === this.stored.game) {
      socket.send(json({ type: 'error', code: 'illegal_action', message: 'The engine rejected that action.' }));
      return;
    }
    this.stored.game = next;
    await this.persist();
    await this.saveResultIfComplete();
    this.broadcast();
  }

  private async authorize(matchId: string, playerId: PlayerId, ticket: string): Promise<boolean> {
    if (!matchId || !ticket) return false;
    const matcher = this.env.MATCHMAKER.get(this.env.MATCHMAKER.idFromName('global'));
    const response = await matcher.fetch(`https://matchmaker/claim?matchId=${encodeURIComponent(matchId)}&playerId=${playerId}&ticket=${encodeURIComponent(ticket)}`);
    return response.ok;
  }

  private sendState(socket: WebSocket, playerId: PlayerId): void {
    if (this.stored) socket.send(json(projectState(this.stored.game, playerId)));
  }

  private broadcast(): void {
    for (const socket of this.state.getWebSockets()) {
      const attachment = socket.deserializeAttachment() as SocketAttachment | null;
      if (attachment && 'playerId' in attachment) this.sendState(socket, attachment.playerId);
    }
  }

  private async persist(): Promise<void> {
    if (this.stored) await this.state.storage.put('match', this.stored);
  }

  private async saveResultIfComplete(): Promise<void> {
    if (!this.stored?.game.winner || this.stored.resultSaved || !this.env.MATCH_RESULTS) return;
    const winner = this.stored.game.winner;
    const loser: PlayerId = winner === 'p1' ? 'p2' : 'p1';
    const game = this.stored.game;
    await this.env.MATCH_RESULTS.prepare(
      `INSERT OR IGNORE INTO match_results (match_id, mode, p1_leader_id, p2_leader_id, winner_player_id, loser_player_id, first_player_id, turn_count, ruleset_id, ruleset_version, started_at, completed_at)
       VALUES (?, 'pvp', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(this.stored.matchId, game.players.p1.leaderId, game.players.p2.leaderId, winner, loser, this.stored.firstPlayer, game.turn, game.rulesProfile.id, game.rulesProfile.version, this.stored.startedAt, new Date().toISOString()).run();
    this.stored.resultSaved = true;
    await this.persist();
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/health') return new Response('ok');
    if (url.pathname === '/api/matchmaking') {
      return env.MATCHMAKER.get(env.MATCHMAKER.idFromName('global')).fetch(request);
    }
    const game = url.pathname.match(/^\/api\/games\/([^/]+)$/);
    if (game) return env.GAME_ROOM.get(env.GAME_ROOM.idFromName(game[1]!)).fetch(request);
    return new Response('Not found', { status: 404 });
  },
};
