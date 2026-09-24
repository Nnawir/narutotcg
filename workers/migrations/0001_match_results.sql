CREATE TABLE IF NOT EXISTS match_results (
  match_id TEXT PRIMARY KEY,
  mode TEXT NOT NULL CHECK (mode = 'pvp'),
  p1_leader_id TEXT NOT NULL,
  p2_leader_id TEXT NOT NULL,
  winner_player_id TEXT NOT NULL CHECK (winner_player_id IN ('p1', 'p2')),
  loser_player_id TEXT NOT NULL CHECK (loser_player_id IN ('p1', 'p2')),
  first_player_id TEXT NOT NULL CHECK (first_player_id IN ('p1', 'p2')),
  turn_count INTEGER NOT NULL,
  ruleset_id TEXT NOT NULL,
  ruleset_version INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_match_results_completed_at ON match_results(completed_at);
CREATE INDEX IF NOT EXISTS idx_match_results_leaders ON match_results(p1_leader_id, p2_leader_id);
