-- OWNER REVIEW REQUIRED. Additive SQLite migration, from schema_version 1 to 2.
-- The owner must back up the database and stop writers before applying this file.
-- Run inside ONE transaction using scripts/migrate-arena-v6.mjs; never on app startup.
ALTER TABLE players ADD COLUMN rank_public INTEGER NOT NULL DEFAULT 0 CHECK(rank_public IN (0,1));
ALTER TABLE attempts ADD COLUMN verified_at INTEGER;
ALTER TABLE attempts ADD COLUMN validation_version TEXT;
CREATE TABLE seasons(id TEXT PRIMARY KEY, name TEXT NOT NULL, starts INTEGER NOT NULL, ends INTEGER NOT NULL, status TEXT NOT NULL CHECK(status IN ('scheduled','open','closed','archived')), scoring_version TEXT NOT NULL, rules TEXT NOT NULL, created INTEGER NOT NULL, closed_at INTEGER, revision INTEGER NOT NULL DEFAULT 1, CHECK(ends>starts));
ALTER TABLE attempts ADD COLUMN season_id TEXT REFERENCES seasons(id);
CREATE TABLE season_stages(season TEXT NOT NULL REFERENCES seasons(id), scenario TEXT NOT NULL, scenario_version TEXT NOT NULL, rules_version INTEGER NOT NULL, PRIMARY KEY(season,scenario));
CREATE TABLE season_snapshots(season TEXT NOT NULL REFERENCES seasons(id), player TEXT NOT NULL REFERENCES players(id), rank INTEGER NOT NULL, score INTEGER NOT NULL, stages INTEGER NOT NULL, provisional INTEGER NOT NULL, achieved INTEGER NOT NULL, contributions TEXT NOT NULL, PRIMARY KEY(season,player), UNIQUE(season,rank));
CREATE TABLE season_stage_snapshots(season TEXT NOT NULL REFERENCES seasons(id), scenario TEXT NOT NULL, player TEXT NOT NULL REFERENCES players(id), attempt TEXT NOT NULL REFERENCES attempts(id), rank INTEGER NOT NULL, cohort INTEGER NOT NULL, PRIMARY KEY(season,scenario,player), UNIQUE(season,scenario,rank));
CREATE TABLE recovery_credentials(token_hash TEXT PRIMARY KEY, player TEXT NOT NULL REFERENCES players(id), created INTEGER NOT NULL, expires INTEGER NOT NULL, consumed INTEGER);
CREATE INDEX recovery_player ON recovery_credentials(player,expires);
CREATE TABLE attempt_requests(player TEXT NOT NULL REFERENCES players(id), request_key TEXT NOT NULL, attempt TEXT NOT NULL UNIQUE REFERENCES attempts(id), PRIMARY KEY(player,request_key));
CREATE TABLE competition_reviews(attempt TEXT PRIMARY KEY REFERENCES attempts(id), state TEXT NOT NULL CHECK(state IN ('pending','rejected')), validation_version TEXT NOT NULL, reason TEXT NOT NULL, updated INTEGER NOT NULL);
CREATE INDEX attempts_verified_best ON attempts(scenario,scenario_version,rules_version,status,invalid,total,penalty,elapsed,verified_at,id);
CREATE INDEX attempts_season_player ON attempts(season_id,player,status,invalid);
CREATE INDEX sessions_presence ON sessions(role,seen,expires,principal);
CREATE INDEX seasons_window ON seasons(status,starts,ends);
CREATE UNIQUE INDEX friends_unordered_pair ON friends(MIN(a,b),MAX(a,b));
CREATE TRIGGER season_snapshot_no_update BEFORE UPDATE ON season_snapshots BEGIN SELECT RAISE(ABORT,'frozen season snapshot'); END;
CREATE TRIGGER season_snapshot_no_delete BEFORE DELETE ON season_snapshots BEGIN SELECT RAISE(ABORT,'frozen season snapshot'); END;
CREATE TRIGGER stage_snapshot_no_update BEFORE UPDATE ON season_stage_snapshots BEGIN SELECT RAISE(ABORT,'frozen stage snapshot'); END;
CREATE TRIGGER stage_snapshot_no_delete BEFORE DELETE ON season_stage_snapshots BEGIN SELECT RAISE(ABORT,'frozen stage snapshot'); END;
CREATE TRIGGER season_stage_no_update BEFORE UPDATE ON season_stages BEGIN SELECT RAISE(ABORT,'immutable eligibility'); END;
CREATE TRIGGER season_stage_no_delete BEFORE DELETE ON season_stages BEGIN SELECT RAISE(ABORT,'immutable eligibility'); END;
CREATE TRIGGER season_rules_no_update BEFORE UPDATE OF name,starts,ends,scoring_version,rules ON seasons BEGIN SELECT RAISE(ABORT,'immutable season rules'); END;
INSERT INTO schema_version(version) VALUES(2);
