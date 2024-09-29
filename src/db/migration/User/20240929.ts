import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

/**
 * USERS_INFOへthreadJoinedカラム追加
 */
export default function migration20240929() {
  //かぶり防止のためのtry/catch
  try {
    db.prepare(
      `ALTER TABLE USERS_INFO ADD threadJoined TEXT DEFAULT ''`
    ).run();
  } catch(e) {}
}
