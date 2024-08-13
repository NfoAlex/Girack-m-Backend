import Database from 'better-sqlite3';
const db = new Database('./records/ONLINEUSERS.db');
db.pragma('journal_mode = WAL');

/**
 * オンラインユーザーへユーザーId、SocketIDを追加し結果を返す
 * @param socketId 
 * @param userId 
 * @param sessionId 
 * @returns boolean
 */
export default function addUserOnline(
  _socketId: string,
  _userId: string,
  _sessionId: string
): boolean {
  try {

    //オンラインユーザーを記録
    db.prepare(
      "INSERT INTO ONLINE_USERS (socketId,userId,sessionId) VALUES (?,?,?)"
    ).run(_socketId, _userId, _sessionId);

    return true;

  } catch(e) {

    console.log("addUserOnline :: エラー->", e);
    return false;

  }
}
