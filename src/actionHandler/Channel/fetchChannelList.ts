import fetchUser from "../User/fetchUser";
import roleCheck from "../../util/roleCheck";

import Database from 'better-sqlite3';
const db = new Database('./records/SERVER.db');
db.pragma('journal_mode = WAL');

import type { IChannel, IChannelbeforeParsing } from "../../type/Channel";

/**
 * チャンネル情報を一括で取得
 * @param _userId 
 * @returns 
 */
export default function fetchChannelList(_userId: string)
:IChannel[]|null {
  try {

    //ユーザー情報を取得、ないならnull
    const userInfo = fetchUser(_userId, null);
    if (userInfo === null) return null;

    //このユーザーがサーバー管理権限を持っていてプラベを見られるか調べる
    const roleServerManage = roleCheck(_userId, "ServerManage");

    //チャンネル情報を一括取得
    const channelList = db.prepare(
      "SELECT * FROM CHANNELS"
    ).all() as IChannelbeforeParsing[];

    //チャンネルリストから自分の権限でみられるチャンネルのみにフィルターする
    let channelListFiltered:IChannelbeforeParsing[] = [];
      //サーバー管理権限がないならフィルター、ないならそのまま格納
    if (!roleServerManage) {
      channelListFiltered = channelList.filter((channel) => {
        return userInfo.channelJoined.includes(channel.channelId)
          ||
          !channel.isPrivate;
      });
    } else {
      channelListFiltered = channelList;
    }

    //チャンネル情報をパースする
    const channelListParsed:IChannel[] = [];
    for (const channel of channelListFiltered) {
      channelListParsed.push({
        ...channel,
        isPrivate: channel.isPrivate === 1,
        speakableRole: channel.speakableRole.split(",")
      });
    }

    return channelListParsed;

  } catch(e) {

    console.log("fetchChannelList :: エラー->", e);
    return null;

  }
}
