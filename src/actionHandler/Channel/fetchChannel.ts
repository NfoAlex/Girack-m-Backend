import Database from 'better-sqlite3';
const db = new Database('./records/SERVER.db');
db.pragma('journal_mode = WAL');

import fetchUser from "../User/fetchUser";
import roleCheck from "../../util/roleCheck";

import type { IChannelbeforeParsing, IChannel } from "../../type/Channel";

/**
 * チャンネル情報を取得する
 * @param _channelId 
 * @param _userId 
 * @returns 
 */
export default function fetchChannel(_channelId:string, _userId:string)
:IChannel|null {
  try {

    const channelInfo = db.prepare(
      "SELECT * FROM CHANNELS WHERE channelId=?"
    ).get(_channelId) as IChannelbeforeParsing|undefined;

    if (channelInfo === undefined) return null;

    //プライベートならユーザーの権限、あるいは作成者と同じか調べる
    if (channelInfo.isPrivate) {
      //ユーザー情報を取得
      const userInfo = fetchUser(_userId, null);
      if (userInfo === null) return null;

      //チャンネル作成者と同じか、あるいはサーバー管理権限があるか調べる
      if (
        !userInfo.channelJoined.includes(_channelId)
        &&
        !(roleCheck(_userId, "ServerManage"))
      ) return null;
    }

    //チャンネル情報をパースする
    const channelInfoParsed:IChannel = {
      ...channelInfo,
      isPrivate: channelInfo.isPrivate === 1,
      speakableRole: //👇空文字列なら空配列にする
        channelInfo.speakableRole!==""?channelInfo.speakableRole.split(","):[]
    }

    return channelInfoParsed;

  } catch(e) {

    console.log("fetchChannel :: エラー->", e);
    return null;

  }
}
