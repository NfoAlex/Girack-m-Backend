import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/MESSAGE.db");
import fetchMessage from "./fetchMessage";

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
):Promise<boolean> {
  try {

    //編集するメッセージを取得
    const messageEditing = await fetchMessage(channelId, messageId);
    if (messageEditing === null) return false;

    //操作者とメッセ主が違うならエラーで停止
    if (messageEditing.userId !== userIdBy) return false;

    return new Promise((resolve) => {
      db.run(
        `
        UPDATE C` + channelId + ` SET
          content=?
        WHERE messageId='` + messageId + `'
        `,
        contentUpdating,
        (err:Error) => {
          if (err) {
            console.log("editMessage :: db : エラー->", err);
            resolve(false);
            return;
          } else {
            resolve(true);
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("editMessage :: エラー->", e);
    return false;

  }
}
