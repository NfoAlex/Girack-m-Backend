import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/MESSAGE.db");
import { ServerInfo } from "../../db/InitServer";
import fetchUserInbox from "../User/fetchUserInbox";

import type { IMessage } from "../../type/Message";

export default async function saveMessage(
  userId: string,
  message: {
    channelId: string,
    content: string,
    fileId: string[]
  }
):Promise<
  {
    messageResult: IMessage,
    userIdMentioning: string[] | null
  }
  |
  null
> {
  try {

    //形成するメッセージデータ
    const messageData:IMessage = {
      messageId: "",
      channelId: message.channelId,
      userId: userId,
      isEdited: false,
      content: message.content,
      linkData: {},
      fileId: message.fileId,
      time: "",
      reaction: {},
    };

    //もしメッセージ長がサーバー設定より長ければエラー
    if (message.content.length > ServerInfo.config.MESSAGE.TxtMaxLength) {
      return null;
    }

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

    //メンションだった時用のInbox追加処理
    const userIdMentioning = await checkAndAddToInbox(
      message.channelId,
      messageData.messageId,
      message.content
    );

    //DB処理
    return new Promise((resolve) => {

      db.serialize(() => {

        //存在しなければそのチャンネル用のテーブルを作成する
        db.run(
          `create table if not exists C${message.channelId}(
          messageId TEXT PRIMARY KEY,
          channelId TEXT NOT NULL,
          userId TEXT NOT NULL,
          content TEXT NOT NULL,
          isEdited BOOLEAN NOT NULL DEFAULT '0',
          linkData TEXT DEFAULT '{}',
          fileId TEXT NOT NULL,
          time TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
          reaction TEXT NOT NULL
        )`);

        //メッセージを挿入
        db.run(`
          INSERT INTO C${message.channelId} (
            messageId,
            channelId,
            userId,
            time,
            content,
            fileId,
            reaction
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            messageData.messageId,
            messageData.channelId,
            messageData.userId,
            messageData.time,
            messageData.content,
            messageData.fileId.join(","),
            "{}" //最初は当然空
          ],
          (err) => {
            //エラーなら停止
            if (err) {
              console.log("saveMessage :: db : エラー->", err);
              resolve(null);
              return;
            }

            //ここでメッセージデータとメンションする人配列を返す
            resolve({
              messageResult: messageData,
              userIdMentioning: userIdMentioning
            });
            return;
          }
        );

      });

    });

  } catch(e) {

    console.log("saveMessage :: エラー->", e);
    return null;

  }
}

/**
 * メンションか返信なら対象のユーザーのInboxへ追加する
 */
async function checkAndAddToInbox(
  channelId: string,
  messageId: string,
  content: string
):Promise<string[]|null> {
  //メンション用のRegex
  const MentionRegex:RegExp = /@<([0-9]*)>/g;
  //マッチ結果
  const matchResult:RegExpMatchArray|null = content.match(MentionRegex);
  //実際に通知をするユーザーId配列
  //const userIdMentioning:string[] = [];
  const userIdMentioning:string[] = Array.from(new Set(matchResult));
  //処理を終えて"@<>"を取り除いたユーザーId配列
  const userIdMentioningProcessed:string[] = [];

  console.log("saveMessage :: checkAndAddToInbox : マッチ結果->", matchResult, " フィルター結果->", userIdMentioning);

  //そもそもマッチが無いなら停止
  if (matchResult === null) return null;

  //db操作用
  const dbUser = new sqlite3.Database("./records/USER.db");

  //ユーザーがメンションされているなら対象の人のInboxに通知を追加
  for (const targetUserId of userIdMentioning) {
    try {

      //メンションクエリーから@<>を削除してユーザーIdを抽出
      const userIdFormatted = targetUserId.slice(2).slice(0,-1);
      //この人のinboxを取り出す
      const inboxOfTargetUser = await fetchUserInbox(userIdFormatted);
      if (inboxOfTargetUser === null) continue;

      //チャンネル用ホルダーが無ければ空配列を作成
      if (inboxOfTargetUser.mention[channelId] === undefined) {
        inboxOfTargetUser.mention[channelId] = [];
      }
      //InboxデータへメッセIdを追加
      inboxOfTargetUser.mention[channelId].push(messageId);

      //Inboxデータを書き込み
      dbUser.run(
        `
        UPDATE USERS_SAVES SET inbox=?
          WHERE userId=?
        `,
        [JSON.stringify(inboxOfTargetUser), userIdFormatted],
        (err:Error) => {
          if(err) {
            console.log("savemessage :: checkAndAddToInbox>db : エラー->", err);
            throw Error;
          }
        }
      );

      //実際に通知を行うユーザーId配列へ追加
      userIdMentioningProcessed.push(userIdFormatted);

    } catch(e) {
      console.log("savemessage :: checkAndAddToInbox : エラー->", e);
      return null;
    }
  }

  //処理を終えてメンションするユーザーId配列を返す
  return userIdMentioningProcessed;
}