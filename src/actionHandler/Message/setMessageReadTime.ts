import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import getMessageReadTime from "./getMessageReadTime";

import type { IMessageReadTime } from "../../type/Message";

/**
 * チャンネルの最新既読時間を設定
 * @param _userId 
 * @param _channelId 
 * @param _messageTime 
 * @returns 
 */
export default function setMessageReadTime(
  _userId: string,
  _channelId: string,
  _messageTime: string
):boolean {
  try {

    //メッセージ既読時間の読み取り
    const messageReadTime:IMessageReadTime|null = getMessageReadTime(_userId);
    //取得できなかったら失敗と返す
    if (messageReadTime===null) return false;

    //データを更新する
    messageReadTime[_channelId] = _messageTime;

    db.prepare(
      `
      UPDATE USERS_SAVES SET
        messageReadTime=?
      WHERE userId=?
      `
    ).run(JSON.stringify(messageReadTime), _userId);

    return true;

  } catch(e) {

    console.log("setMessageReadTime :: エラー->", e);
    return false;

  }
}
