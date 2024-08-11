import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

/**
 * セッションをログアウトさせる
 */
export default function sessionLogout(_userId:string, _targetSessionId:string):boolean {
  try {

    db.prepare(
      "DELETE FROM USERS_SESSION WHERE userId=? AND sessionId=?"
    ).run(_userId, _targetSessionId);

    return true;

  } catch(e) {

    console.log("sessionLogout :: エラー->", e);
    return false;

  }
}