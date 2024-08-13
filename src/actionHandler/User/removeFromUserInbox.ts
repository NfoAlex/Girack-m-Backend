import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import fetchUserInbox from "./fetchUserInbox";

/**
 * Inboxから通知イベントを削除
 * @param userId 
 * @param inboxCategory 
 * @param channelId 
 * @param itemId 
 * @returns 
 */
export default function removeFromUserInbox(
  _userId: string,
  _inboxCategory: "mention"|"event",
  _channelId: string,
  _itemId: string
):boolean {
  try {

    //このユーザーのInbox取得
    const inboxEditing = fetchUserInbox(_userId);
    if (!inboxEditing) {
      return false;
    };

    //指定の項目Idの場所取得
    const indexOfItemId = inboxEditing[_inboxCategory][_channelId].indexOf(_itemId);
      //消したい項目Idが無ければエラーとして返す
    if (indexOfItemId === -1) {
      return false;
    }

    //指定のIdの項目を削除
    inboxEditing[_inboxCategory][_channelId].splice(indexOfItemId, 1);

    //DBへ記録
    db.prepare(
      "UPDATE USERS_SAVES SET inbox=? WHERE userId=?"
    ).run(JSON.stringify(inboxEditing), _userId);

    return true;

  } catch(e) {

    console.log("removeFromUserInbox :: エラー->", e);
    return false;

  }
}
