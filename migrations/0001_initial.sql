PRAGMA foreign_keys = ON;
CREATE TABLE players (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, name TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE rooms (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL,
 owner_id TEXT REFERENCES players(id), system INTEGER NOT NULL DEFAULT 0,
 rules_json TEXT NOT NULL CHECK(json_valid(rules_json)),
 champion_json TEXT CHECK(champion_json IS NULL OR json_valid(champion_json)),
 streak INTEGER NOT NULL DEFAULT 0, version INTEGER NOT NULL DEFAULT 0,
 updated_at INTEGER NOT NULL
);
CREATE TABLE matches (
 id TEXT PRIMARY KEY, room_id TEXT NOT NULL REFERENCES rooms(id), challenger_id TEXT NOT NULL REFERENCES players(id),
 winner_name TEXT, challenger_name TEXT NOT NULL, defender_name TEXT,
 outcome TEXT NOT NULL CHECK(outcome IN ('crown','win','loss','draw')),
 streak INTEGER NOT NULL, turns INTEGER NOT NULL, replay_key TEXT NOT NULL UNIQUE,
 engine TEXT NOT NULL, created_at INTEGER NOT NULL
);
CREATE INDEX matches_room_date ON matches(room_id,created_at DESC);
CREATE TABLE products (barcode TEXT PRIMARY KEY, data_json TEXT NOT NULL CHECK(json_valid(data_json)), expires_at INTEGER NOT NULL);
CREATE TABLE saves (player_id TEXT NOT NULL REFERENCES players(id), mode TEXT NOT NULL CHECK(mode IN ('C0','C1','C2')), data_json TEXT NOT NULL CHECK(json_valid(data_json)), updated_at INTEGER NOT NULL, PRIMARY KEY(player_id,mode));
CREATE TABLE rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
INSERT INTO rooms VALUES
 ('jan49','49コード限定','49から始まるJANコードで勝ち抜く国内コードルーム。',NULL,1,'{"version":1,"prefixes":["49"],"lengths":[8,13],"support":true,"shift":false}',NULL,0,0,unixepoch()),
 ('open','無差別','世界中のEAN / JANコードと付属カードで挑戦。',NULL,1,'{"version":1,"prefixes":[],"lengths":[8,13],"support":true,"shift":false}',NULL,0,0,unixepoch());
