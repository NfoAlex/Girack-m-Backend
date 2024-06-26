import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/MESSAGE.db");

import type { IMessage, IMessageBeforeParsing } from "../../type/Message";

export default function fetchMessage(
  channelId: string,
  messageId: string
):Promise<IMessage|null>|null {
  try {

    return new Promise((resolve) => {
      db.all(
        `
        SELECT * FROM C` + channelId + `
          WHERE messageId='` + messageId + `'
        `,
        (err:Error, message:IMessageBeforeParsing[]) => {
          if (err) {
            console.log("fetchMessage :: db : エラー->", err);
            resolve(null);
            return;
          } else {
            //console.log("fetchMessage :: db : 結果->", message);
            //取得メッセが空なら停止
            if (message.length === 0) {
              resolve(null);
              return;
            }

            //生メッセージデータを扱える形にパースする
            const messageParsed:IMessage = {
              ...message[0],
              linkData: JSON.parse(message[0].linkData),
              reaction: JSON.parse(message[0].reaction)
            };
            resolve(messageParsed);
            return;
          }
        }
      )
    });

  } catch(e) {

    console.log("fetchMessage :: エラー->", e);
    return null;

  }
}
