import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/MESSAGE.db");

import { IMessage } from "../../type/Message";

export default async function saveMessage(
  userId: string,
  message: {
    channelId: string,
    content: string
  }
):Promise<IMessage|null> {
  try {

    //形成するメッセージデータ
    const messageData:IMessage = {
      messageId: "",
      channelId: message.channelId,
      userId: userId,
      content: message.content,
      time: "",
      reaction: {}
    };

    //メッセージID用の乱数生成
    const randId = Math.floor(Math.random()*9999).toString().padStart(4, "0");

    //時間を取得
    const t = new Date();
    const tY = t.getFullYear();
    const tM = (t.getMonth() + 1).toString().padStart(2, "0");
    const tD = t.getDate().toString().padStart(2, "0");
    const tHour = t.getHours().toString().padStart(2, "0");
    const tMinute = t.getMinutes().toString().padStart(2, "0");
    const tSecond = t.getSeconds().toString().padStart(2, "0");
    const tMilisecond = t.getMilliseconds().toString().padStart(3, "0");
    //時間の文字を全部一つの文字列へ
    const timestampJoined = tY + tM + tD + tHour + tMinute + tSecond +tMilisecond;
    
    //時間情報を格納
    messageData.time = new Date().toJSON();

    //メッセージIDを作成
    messageData.messageId = message.channelId + randId + timestampJoined;

    //DB処理
    return new Promise((resolve) => {

      db.serialize(() => {

        //存在しなければそのチャンネル用のテーブルを作成する
        db.run(
          `create table if not exists C` + message.channelId + `(
          messageId TEXT PRIMARY KEY,
          channelId TEXT NOT NULL,
          userId TEXT NOT NULL,
          content TEXT NOT NULL,
          time TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
          reaction TEXT NOT NULL
        )`);

        //メッセージを挿入
        db.run(`
          INSERT INTO C` + message.channelId + ` (
            messageId,
            channelId,
            userId,
            time,
            content,
            reaction
          )
          VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            messageData.messageId,
            messageData.channelId,
            messageData.userId,
            messageData.time,
            messageData.content,
            "{}" //最初は当然空
          ],
          (err) => {
            if (err) {
              console.log("saveMessage :: db : エラー->", err);
              resolve(null);
              return;
            } else {
              //ここでメッセージデータを返す
              resolve(messageData);
              return;
            }
          }
        );

      });

    });

  } catch(e) {

    console.log("saveMessage :: エラー->", e);
    return null;

  }
}
