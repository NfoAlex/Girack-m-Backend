import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import type { IMessageReadTime } from "../../type/Message";

/**
 * メッセージの最終既読時間をJSONで取得
 * @param _userId 
 * @returns 
 */
export default async function getMessageReadTime(_userId:string)
:Promise<IMessageReadTime|null> {
  try {

    //最新既読時間を取得する
    const messageReadTimeBeforeParsed = db.prepare(
      `
      SELECT messageReadTime FROM USERS_SAVES
        WHERE userId=?
      `
    ).get(_userId) as {messageReadTime:string};

    //SQLからの生値をJSONへパースして返す
    return JSON.parse(messageReadTimeBeforeParsed.messageReadTime);

  } catch(e) {

    console.log("getMessageReadTime :: エラー->", e);
    return null;

  }
}
