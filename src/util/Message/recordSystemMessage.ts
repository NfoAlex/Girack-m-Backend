import { ServerInfo } from "../../db/InitServer";

import Database from 'better-sqlite3';
const db = new Database('./records/MESSAGE.db');
db.pragma('journal_mode = WAL');

import type { IMessage, ISystemMessageContent, ISystemMessageFlag } from "../../type/Message";

/**
 * システムメッセージを履歴テーブルへ書き込む
 * @param _targetUserId 
 * @param _senderUserId 
 * @param _message 
 * @returns 
 */
export default function recordSystemMessage(
  _targetUserId: string | null,
  _senderUserId: string,
  _message: {
    channelId: string,
    contentFlag: ISystemMessageFlag
  }
): IMessage | null {
  try {

    //メッセージ内容をJSON形式で形成
    const messageContent:ISystemMessageContent = {
      flag: _message.contentFlag,
      targetUserId: _targetUserId,
      senderUserId: _senderUserId
    };
    //形成した内容をstringでパース
    const messageContentResult = JSON.stringify(messageContent);

    //形成するメッセージデータ
    const messageData:IMessage = {
      messageId: "",
      channelId: _message.channelId,
      userId: "SYSTEM", //システムだから
      isEdited: false,
      isSystemMessage: true, //システムだから
      content: messageContentResult, //stringにしたもの
      linkData: {},
      fileId: [],
      time: "",
      reaction: {},
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
    messageData.messageId = _message.channelId + randId + timestampJoined;

    //テーブルへデータ挿入
    db.prepare(
      `
      INSERT INTO C${_message.channelId} (
        messageId,
        channelId,
        userId,
        time,
        content,
        isSystemMessage,
        fileId,
        reaction
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
    ).run(
      messageData.messageId,
      messageData.channelId,
      messageData.userId,
      messageData.time,
      messageData.content,
      1,
      messageData.fileId.join(","),
      "{}" //最初は当然空
    );

    return messageData;

  } catch(e) {

    console.log("saveMessage :: エラー->", e);
    return null;

  }
}