/**
 * The game engine stays in the tcg-engines Git submodule. This module is the
 * NarutoCardGuide-owned boundary: pages and future Workers import metadata
 * from here, never from upstream implementation files directly.
 */
export const narutoEngineUpstream = {
  repository: 'https://github.com/TheCardGoat/tcg-engines',
  submodulePath: 'vendor/tcg-engines',
  workspacePath: 'submodules/naruto',
  enginePackage: '@tcg-engines/naruto-engine',
  cardsPackage: '@tcg-engines/naruto-cards',
  simulatorWorkspacePath: 'submodules/agnostic-simulator',
  rulesStatus: 'provisional' as const,
} as const;

export type SimulatorMode = 'online' | 'ai';

/**
 * Required on every completed match before it can be persisted by the future
 * authoritative game service. AI matches are deliberately distinguishable
 * from PvP statistics.
 */
export type MatchResultRecord = {
  matchId: string;
  mode: SimulatorMode;
  rulesetId: string;
  rulesetVersion: string;
  startedAt: string;
  completedAt: string;
  firstPlayer: 'p1' | 'p2';
  winner: 'p1' | 'p2';
  p1LeaderId: string;
  p2LeaderId: string;
};
