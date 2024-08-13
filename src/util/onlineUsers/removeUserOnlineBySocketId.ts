import Database from 'better-sqlite3';
const db = new Database('./records/ONLINEUSERS.db');
db.pragma('journal_mode = WAL');

/**
 * オンラインユーザーリストから一致するSocketIDを
 * 持つユーザーIdを削除し、そのユーザーIdを返す
 * @param socketId 
 * @returns string
 */
export default function removeUserOnlineBySocketId(_socketId:string)
: string | null {
  try {

    //console.log("removeUserOnlineBySocketId :: socketId->", socketId);

    const userIdDisconnectingRaw = db.prepare(
      "SELECT userId FROM ONLINE_USERS WHERE socketId=?"
    ).get(_socketId) as {userId: string} | undefined;

    console.log("removeUserOnlineBySocketId :: userId->", userIdDisconnectingRaw);

    //もしユーザーIdデータがundefinedだったら停止
    if (userIdDisconnectingRaw === undefined) {
      return null;
    }

    //抽出
    const userIdDisconnecting = userIdDisconnectingRaw.userId;

    //ユーザーをオンラインリストから削除
    db.prepare("DELETE FROM ONLINE_USERS WHERE socketId=?").run(_socketId);

    //同じユーザーIdがまだオンラインかどうか数えて調べる
    const userCountRaw = db.prepare(
      "SELECT COUNT(*) FROM ONLINE_USERS WHERE userId=?"
    ).get(userIdDisconnecting) as {"COUNT(*)":number};
    const userCount = userCountRaw["COUNT(*)"];

    //他にオンラインのセッションがあるならnull
    if (userCount !== 0) {
      return null;
    }

    //このユーザーIdは切断したと返す
    return userIdDisconnecting;

  } catch(e) {

    console.log("removeUserOnlineBySocketId :: エラー->", e);
    return null;

  }
} 
