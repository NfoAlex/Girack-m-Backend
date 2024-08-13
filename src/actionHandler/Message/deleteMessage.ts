import Database from 'better-sqlite3';
const db = new Database('./records/MESSAGE.db');
db.pragma('journal_mode = WAL');

import calcRoleUser from "../Role/calcRoleUser";
import fetchMessage from "./fetchMessage";

/**
 * メッセージを削除する
 * @param _channelId 
 * @param _messageId 
 * @param _userIdBy 削除操作をしているユーザーのId
 * @returns 
 */
export default async function deleteMessage(
  _channelId: string,
  _messageId: string,
  _userIdBy: string,
):Promise<boolean> {
  try {

    //削除するメッセージを取得
    const messageDeleting = fetchMessage(_channelId, _messageId);
    if (messageDeleting === null) return false;

    //削除する人の権限レベル
    const rolePower = await calcRoleUser(_userIdBy);
    //削除される人の権限レベル
    const rolePowerAgainst = await calcRoleUser(messageDeleting.userId);

    //レベル比較
    if (rolePowerAgainst > rolePower) return false;

    //メッセージを削除
    db.prepare(
      `DELETE FROM C${_channelId} WHERE messageId=?`
    ).run(_messageId);

    return true;

  } catch(e) {

    console.log("deleteMessage :: エラー->", e);
    return false;

  }
}
