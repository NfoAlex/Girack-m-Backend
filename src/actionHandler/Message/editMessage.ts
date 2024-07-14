import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/MESSAGE.db");
import fetchMessage from "./fetchMessage";

import type { IMessage } from "../../type/Message";

/**
 * メッセージの編集
 * @param channelId 
 * @param messageId 
 * @param userIdBy 
 * @returns 
 */
export default async function editMessage(
  channelId: string,
  messageId: string,
  contentUpdating: string,
  userIdBy: string,
):Promise<IMessage|null> {
  try {

    //もし更新内容が空なら停止
    if (contentUpdating === "" || contentUpdating === null) return null;

    //編集するメッセージを取得
    const messageEditing = await fetchMessage(channelId, messageId);
    if (messageEditing === null) return null;

    //操作者とメッセ主が違うならエラーで停止
    if (messageEditing.userId !== userIdBy) return null;

    return new Promise((resolve) => {
      db.run(
        `
        UPDATE C` + channelId + ` SET
          content=?,
          isEdited=?
        WHERE messageId='` + messageId + `'
        `,
        [contentUpdating, true],
        (err:Error) => {
          if (err) {
            console.log("editMessage :: db : エラー->", err);
            resolve(null);
            return;
          } else {
            //取得したメッセデータも上書きして結果として渡す
            messageEditing.content = contentUpdating;
            messageEditing.isEdited = true;
            resolve(messageEditing);
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("editMessage :: エラー->", e);
    return null;

  }
}
