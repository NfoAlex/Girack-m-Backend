import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/MESSAGE.db");
import calcRoleUser from "../Role/calcRoleUser";
import fetchMessage from "./fetchMessage";

export default async function deleteMessage(
  channelId: string,
  messageId: string,
  userIdBy: string,
):Promise<boolean> {
  try {

    //削除するメッセージを取得
    const messageDeleting = await fetchMessage(channelId, messageId);
    if (messageDeleting === null) return false;

    //削除する人の権限レベル
    const rolePower = await calcRoleUser(userIdBy);
    //削除される人の権限レベル
    const rolePowerAgainst = await calcRoleUser(messageDeleting.userId);

    //レベル比較
    if (rolePowerAgainst > rolePower) return false;

    return new Promise((resolve) => {
      //メッセージを削除
      db.run(
        "DELETE FROM C" + channelId + " WHERE messageId=?",
        messageId,
        (err) => {
          //結果に応じてbooleanで結果を返す
          if (err) {
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

    console.log("deleteMessage :: エラー->", e);
    return false;

  }
}
