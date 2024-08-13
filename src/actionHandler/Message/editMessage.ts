import Database from 'better-sqlite3';
const db = new Database('./records/MESSAGE.db');
db.pragma('journal_mode = WAL');

import fetchMessage from "./fetchMessage";

import type { IMessage } from "../../type/Message";

/**
 * メッセージの編集
 * @param _channelId 
 * @param _messageId 
 * @param _userIdBy 
 * @returns 
 */
export default async function editMessage(
  _channelId: string,
  _messageId: string,
  _contentUpdating: string,
  _userIdBy: string,
):Promise<IMessage|null> {
  try {

    //もし更新内容が空なら停止
    if (_contentUpdating === "" || _contentUpdating === null) return null;

    //編集するメッセージを取得
    const messageEditing = fetchMessage(_channelId, _messageId);
    if (messageEditing === null) return null;

    //もし現在のテキストと編集内容が一緒なら停止
    if (messageEditing.content === _contentUpdating) return null;

    //操作者とメッセ主が違うならエラーで停止
    if (messageEditing.userId !== _userIdBy) return null;

    //メッセージの編集をDBへ適用
    db.prepare(
      `
      UPDATE C${_channelId} SET
        content=?,
        isEdited=?
      WHERE messageId='${_messageId}'
      `
    ).run(_contentUpdating, 1);

    //取得したメッセデータも上書きして結果として渡す
    messageEditing.content = _contentUpdating;
    messageEditing.isEdited = true;

    return messageEditing;

  } catch(e) {

    console.log("editMessage :: エラー->", e);
    return null;

  }
}
