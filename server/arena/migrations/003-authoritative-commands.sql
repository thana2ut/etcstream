-- Owner-only additive migration. Run via setup-online-ranked.mjs after backup; never on app startup.
CREATE TABLE IF NOT EXISTS competition_replay(attempt TEXT PRIMARY KEY REFERENCES attempts(id), protocol TEXT NOT NULL, state TEXT NOT NULL, bag TEXT NOT NULL, seq INTEGER NOT NULL DEFAULT 0, last_hash TEXT NOT NULL DEFAULT '', created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS competition_commands(attempt TEXT NOT NULL REFERENCES attempts(id), seq INTEGER NOT NULL, payload TEXT NOT NULL, received INTEGER NOT NULL, previous_hash TEXT NOT NULL, command_hash TEXT NOT NULL, PRIMARY KEY(attempt,seq));
CREATE INDEX IF NOT EXISTS competition_commands_received ON competition_commands(attempt,received);
CREATE TRIGGER IF NOT EXISTS command_no_update BEFORE UPDATE ON competition_commands BEGIN SELECT RAISE(ABORT,'append-only command evidence'); END;
CREATE TRIGGER IF NOT EXISTS command_no_delete BEFORE DELETE ON competition_commands BEGIN SELECT RAISE(ABORT,'append-only command evidence'); END;
CREATE TABLE IF NOT EXISTS competition_stage_catalog(scenario TEXT NOT NULL, version TEXT NOT NULL, verification TEXT NOT NULL CHECK(verification IN ('AUTHORITATIVE_SLICE','PROVISIONAL')), registered INTEGER NOT NULL, PRIMARY KEY(scenario,version));
CREATE TABLE IF NOT EXISTS arena_demo_settings(id INTEGER PRIMARY KEY CHECK(id=1), enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0,1)));
INSERT OR IGNORE INTO arena_demo_settings(id,enabled) VALUES(1,0);
INSERT OR IGNORE INTO schema_version(version) VALUES(3);

-- Preserve duplicate historical names; prevent new claims without merging/deleting old identities.
CREATE TRIGGER IF NOT EXISTS player_new_name_unique BEFORE INSERT ON players WHEN NEW.name<>'' AND NEW.deleted=0 AND EXISTS(SELECT 1 FROM players WHERE name=NEW.name COLLATE NOCASE AND deleted=0) BEGIN SELECT RAISE(ABORT,'NAME_TAKEN'); END;
CREATE TRIGGER IF NOT EXISTS player_rename_unique BEFORE UPDATE OF name ON players WHEN NEW.name<>OLD.name AND NEW.name<>'' AND NEW.deleted=0 AND EXISTS(SELECT 1 FROM players WHERE name=NEW.name COLLATE NOCASE AND id<>NEW.id AND deleted=0) BEGIN SELECT RAISE(ABORT,'NAME_TAKEN'); END;
