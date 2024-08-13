import Database from 'better-sqlite3';
const db = new Database('./records/ONLINEUSERS.db');
db.pragma('journal_mode = WAL');

/**
 * オンラインのユーザーを取得
 * @returns 
 */
export default function fetchOnlineUsers():string[]|null {
  try {

    //オンラインユーザー取得
    const userOnline = db.prepare("SELECT DISTINCT userId from ONLINE_USERS").all() as {userId:string}[];
    //取得結果を配列にする
    const onlineUsersArr:string[] = [];
    for (const userId of userOnline) {
      onlineUsersArr.push(userId.userId);
    }

    return onlineUsersArr;

  } catch(e) {

    console.log("fetchOnlineUsers :: エラー->", e);
    return null;

  }
}
