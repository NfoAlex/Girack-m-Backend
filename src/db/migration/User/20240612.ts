import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

/**
 * USERS_SAVEへinboxカラム追加
 */
export default function migration20240612() {
  //かぶり防止のためのtry/catch
  try {
    db.prepare(
      `ALTER TABLE USERS_SAVES ADD inbox TEXT DEFAULT '{ "mention": {}, "event": {} }'`
    ).run();
  } catch(e) {}
}
