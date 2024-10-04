import { ServerInfo } from "../../db/InitServer";
import fetchUserInbox from "../User/fetchUserInbox";

import Database from 'better-sqlite3';
const db = new Database('./records/MESSAGE.db');
db.pragma('journal_mode = WAL');

import type { IMessage } from "../../type/Message";

/**
 * メッセージデータを履歴テーブルへ書き込む
 * @param _userId 
 * @param _message 
 * @returns 
 */
export default function saveMessage(
  _userId: string,
  _message: {
    channelId: string,
    content: string,
    fileId: string[]
  }
):
  {
    messageResult: IMessage,
    userIdMentioning: string[] | null
  }
  |
  null
{
  try {

    //形成するメッセージデータ
    const messageData:IMessage = {
      messageId: "",
      channelId: _message.channelId,
      userId: _userId,
      isEdited: false,
      isSystemMessage: false,
      content: _message.content,
      linkData: {},
      fileId: _message.fileId,
      time: "",
      reaction: {},
    };

    //もしメッセージ長がサーバー設定より長ければエラー
    if (_message.content.length > ServerInfo.config.MESSAGE.TxtMaxLength) {
      return null;
    }

    //空白と改行の数を数える
    const spaceCount = (_message.content.match(/ /g) || "").length + (_message.content.match(/　/g) || "").length + (_message.content.match(/\n/g) || "").length;
    //メッセージがスペースしか含まれていないならエラー
    if (spaceCount === _message.content.length && messageData.fileId.length === 0) return null;
    if (spaceCount > 0 && messageData.fileId.length > 0)  return null;

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

    //メンションだった時用のInbox追加処理
    const userIdMentioning = checkAndAddToInbox(
      _message.channelId,
      messageData.messageId,
      _message.content
    );

    //テーブルへデータ挿入
    db.prepare(
      `
      INSERT INTO C${_message.channelId} (
        messageId,
        channelId,
        userId,
        time,
        content,
        fileId,
        reaction
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `
    ).run(
      messageData.messageId,
      messageData.channelId,
      messageData.userId,
      messageData.time,
      messageData.content,
      messageData.fileId.join(","),
      "{}" //最初は当然空
    );

    return {
      messageResult: messageData,
      userIdMentioning: userIdMentioning
    };

  } catch(e) {

    console.log("saveMessage :: エラー->", e);
    return null;

  }
}

/**
 * メンションか返信なら対象のユーザーのInboxへ追加する
 */
function checkAndAddToInbox(
  channelId: string,
  messageId: string,
  content: string
):string[]|null {
  //メンション用のRegex
  const MentionRegex:RegExp = /@<([0-9]*)>/g;
  //マッチ結果
  const matchResult:RegExpMatchArray|null = content.match(MentionRegex);
  //実際に通知をするユーザーId配列
  //const userIdMentioning:string[] = [];
  const userIdMentioning:string[] = Array.from(new Set(matchResult));
  //処理を終えて"@<>"を取り除いたユーザーId配列
  const userIdMentioningProcessed:string[] = [];

  //console.log("saveMessage :: checkAndAddToInbox : マッチ結果->", matchResult, " フィルター結果->", userIdMentioning);

  //そもそもマッチが無いなら停止
  if (matchResult === null) return null;

  //db操作用
  const dbUser = new Database('./records/USER.db');
  dbUser.pragma('journal_mode = WAL');

  //ユーザーがメンションされているなら対象の人のInboxに通知を追加
  for (const targetUserId of userIdMentioning) {
    try {

      //メンションクエリーから@<>を削除してユーザーIdを抽出
      const userIdFormatted = targetUserId.slice(2).slice(0,-1);
      //この人のinboxを取り出す
      const inboxOfTargetUser = fetchUserInbox(userIdFormatted);
      if (inboxOfTargetUser === null) continue;

      //チャンネル用ホルダーが無ければ空配列を作成
      if (inboxOfTargetUser.mention[channelId] === undefined) {
        inboxOfTargetUser.mention[channelId] = [];
      }
      //InboxデータへメッセIdを追加
      inboxOfTargetUser.mention[channelId].push(messageId);

      //Inboxデータを書き込み
      dbUser.prepare(
        "UPDATE USERS_SAVES SET inbox=? WHERE userId=?"
      ).run(JSON.stringify(inboxOfTargetUser), userIdFormatted);

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