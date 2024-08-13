import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import type { IChannelOrder } from "../../type/Channel";

/**
 * チャンネル順番データを取得
 * @param _userId 
 * @returns 
 */
export default function fetchUserChannelOrder(_userId: string)
:IChannelOrder|null {
  try {

    const channelOrderData = db.prepare(
      `
      SELECT channelOrder FROM USERS_SAVES
        WHERE userId=?
      `
    ).get(_userId) as {channelOrder: string};

    const channelOrderParsed:IChannelOrder = JSON.parse(channelOrderData.channelOrder);

    return channelOrderParsed;

  } catch(e) {

    console.log("fetchUserChannelOrder :: エラー->", e);
    return null;

  }
}