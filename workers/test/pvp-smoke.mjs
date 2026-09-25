const base = process.env.SIMULATOR_GATEWAY ?? 'ws://127.0.0.1:8787';

function connect(path) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(`${base}${path}`);
    const timer = setTimeout(() => reject(new Error(`Timed out connecting to ${path}`)), 8_000);
    socket.addEventListener(
      'open',
      () => {
        clearTimeout(timer);
        resolve(socket);
      },
      { once: true },
    );
    socket.addEventListener(
      'error',
      () => {
        clearTimeout(timer);
        reject(new Error(`WebSocket error for ${path}`));
      },
      { once: true },
    );
  });
}

function nextMessage(socket, predicate = () => true) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timed out waiting for message')), 8_000);
    const handler = (event) => {
      const message = JSON.parse(String(event.data));
      if (!predicate(message)) return;
      clearTimeout(timer);
      socket.removeEventListener('message', handler);
      resolve(message);
    };
    socket.addEventListener('message', handler);
  });
}

const queueA = await connect(`/api/matchmaking?queueToken=${crypto.randomUUID()}`);
await nextMessage(queueA, (message) => message.type === 'queued');
const matchedA = nextMessage(queueA, (message) => message.type === 'matched');
const queueB = await connect(`/api/matchmaking?queueToken=${crypto.randomUUID()}`);
const matchedB = await nextMessage(queueB, (message) => message.type === 'matched');
const sessionA = await matchedA;

if (sessionA.matchId !== matchedB.matchId || sessionA.playerId === matchedB.playerId) {
  throw new Error('Matchmaker did not assign two distinct players to one match.');
}

const gameA = await connect(
  `/api/games/${sessionA.matchId}?playerId=${sessionA.playerId}&ticket=${sessionA.ticket}`,
);
const stateA = await nextMessage(gameA, (message) => message.type === 'state');
const gameB = await connect(
  `/api/games/${matchedB.matchId}?playerId=${matchedB.playerId}&ticket=${matchedB.ticket}`,
);
const stateB = await nextMessage(gameB, (message) => message.type === 'state');

for (const [state, own] of [
  [stateA, sessionA.playerId],
  [stateB, matchedB.playerId],
]) {
  if (
    !state.rulesProfile?.id ||
    !Number.isInteger(state.rulesProfile.version) ||
    !state.rulesProfile.status
  ) {
    throw new Error('The upstream rules profile was not preserved in the PvP projection.');
  }
  const other = own === 'p1' ? 'p2' : 'p1';
  if (state.players[other].hand !== null || !Number.isInteger(state.players[other].handCount)) {
    throw new Error('Opponent hand was not redacted in the projected state.');
  }
  if ('deck' in state.players[other]) throw new Error('Opponent deck order leaked in the projection.');
  if (!state.players[own].chakra.every((card) => typeof card.cardId === 'string')) {
    throw new Error('Upstream Chakra card identities were not preserved in the PvP projection.');
  }
  if (typeof state.players[own].summon?.cardId !== 'string') {
    throw new Error('Upstream Summon card identity was not preserved in the PvP projection.');
  }
}

const actorSession = stateA.decider === sessionA.playerId ? sessionA : matchedB;
const actorSocket = actorSession === sessionA ? gameA : gameB;
const actorState = actorSession === sessionA ? stateA : stateB;
const illegal = nextMessage(
  actorSocket,
  (message) => message.type === 'error' && message.code === 'unauthorized_action',
);
actorSocket.send(
  JSON.stringify({
    type: 'action',
    action: { type: 'END_TURN', player: actorSession.playerId === 'p1' ? 'p2' : 'p1' },
  }),
);
await illegal;

const valid = actorState.availableActions[0];
if (!valid) throw new Error('The active player received no legal action.');
const stateAfterA = nextMessage(gameA, (message) => message.type === 'state');
const stateAfterB = nextMessage(gameB, (message) => message.type === 'state');
actorSocket.send(JSON.stringify({ type: 'action', action: valid.action }));
let [updatedA, updatedB] = await Promise.all([stateAfterA, stateAfterB]);
if (updatedA.turn !== updatedB.turn || updatedA.players.p1.handCount !== updatedB.players.p1.handCount) {
  throw new Error('Clients did not receive the same authoritative update.');
}

for (let step = 0; step < 8 && !updatedA.winner; step += 1) {
  const actorSessionForStep = updatedA.decider === sessionA.playerId ? sessionA : matchedB;
  const actorSocketForStep = actorSessionForStep === sessionA ? gameA : gameB;
  const actorStateForStep = actorSessionForStep === sessionA ? updatedA : updatedB;
  const action =
    actorStateForStep.availableActions.find((candidate) => candidate.action.type === 'END_TURN') ??
    actorStateForStep.availableActions[0];
  if (!action) throw new Error(`No legal action available at progression step ${step}.`);
  const nextA = nextMessage(gameA, (message) => message.type === 'state');
  const nextB = nextMessage(gameB, (message) => message.type === 'state');
  actorSocketForStep.send(JSON.stringify({ type: 'action', action: action.action }));
  [updatedA, updatedB] = await Promise.all([nextA, nextB]);
  if (updatedA.turn !== updatedB.turn || updatedA.phase !== updatedB.phase) {
    throw new Error('Authoritative state diverged while progressing turns.');
  }
}

gameA.close();
const reconnectA = await connect(
  `/api/games/${sessionA.matchId}?playerId=${sessionA.playerId}&ticket=${sessionA.ticket}`,
);
const reconnected = await nextMessage(reconnectA, (message) => message.type === 'state');
if (reconnected.turn !== updatedA.turn)
  throw new Error('Reconnect did not restore the authoritative match state.');

console.log(
  JSON.stringify({
    matchId: sessionA.matchId,
    players: [sessionA.playerId, matchedB.playerId],
    legalAction: valid.label,
    turn: reconnected.turn,
    progressedActions: 9,
    privateStateRedacted: true,
    reconnect: true,
  }),
);

queueA.close();
queueB.close();
gameB.close();
reconnectA.close();
