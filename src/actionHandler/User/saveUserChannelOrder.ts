import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import type { IChannelOrder } from "../../type/Channel";

/**
 * チャンネルの順番データを保存する
 * @param userId 
 * @param channelOrder 
 * @returns 
 */
export default function saveUserChannelOrder(userId:string, channelOrder:IChannelOrder)
:boolean {
  try {

    //DBへ記録
    db.prepare(
      "UPDATE USERS_SAVES SET channelOrder=? WHERE userId=?"
    ).run(JSON.stringify(channelOrder), userId);

    return true;

  } catch(e) {

    console.log("saveUserChannelOrder :: エラー->", e);
    return false;

  }
}