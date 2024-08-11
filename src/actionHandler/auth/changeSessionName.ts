import Database from 'better-sqlite3';
const db = new Database('./records/USER.db', {verbose: console.log });
db.pragma('journal_mode = WAL');

/**
 * セッション名を変更
 * @param _userId 
 * @param _targetSessionId 
 * @param _newName 
 * @returns 
 */
export default function changeSessionName(
  _userId: string,
  _targetSessionId: string,
  _newName: string
):boolean {
  try {

    db.prepare(
      `
      UPDATE USERS_SESSION SET sessionName=?
        WHERE userId=? AND sessionId=?
      `
    ).run(_newName, _userId, _targetSessionId);

    return true;

  } catch(e) {

    console.log("changeSessionname: エラー->", e);
    return false;

  }
}