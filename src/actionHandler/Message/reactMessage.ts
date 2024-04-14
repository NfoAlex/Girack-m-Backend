import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/MESSAGE.db");
import fetchMessage from "./fetchMessage";

import type { IMessage, IMessageBeforeParsing } from "../../type/Message";

export default async function reactMessage(
  channelId: string,
  messageId: string,
  reactionName: string,
  userId: string
):Promise<boolean> {
  try {

    //メッセージ情報を取得
    const message = await fetchMessage(channelId, messageId);
    //もしメッセージがnullなら停止
    if (message === null) return false;

    //もしそもそも対象のリアクションデータが空なら新しく作る
    if (message.reaction[reactionName] === undefined) {
      //空のを作る
      message.reaction[reactionName] = {};
      //このユーザーID分のリアクション数を設定
      message.reaction[reactionName][userId] = 1;
    } else {
      //このユーザーIDによるリアクション数を取得
      const reactionNumberByThisUser:number|undefined = message.reaction[reactionName][userId];

      //リアクションJSONへ追加(取得してundefinedなら0に)
      message.reaction[reactionName][userId] =
        reactionNumberByThisUser===undefined ? 0 : reactionNumberByThisUser+1;
    }

    //DBへの書き込み処理
    return new Promise((resolve) => {
      db.run(
        `
        UPDATE C` + channelId + ` SET
          reaction=?
        WHERE messageId='` + message + `'
        `,
        message.reaction,
        (err:Error) => {
          if (err) {
            console.log("reactMessage :: エラー->", err);
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
    
    console.log("reactMessage :: エラー->", e);
    return false;

  }
}
