import Database from 'better-sqlite3';
const db = new Database('./records/SERVER.db');
db.pragma('journal_mode = WAL');

import fetchUser from "../User/fetchUser";
import roleCheck from "../../util/roleCheck";

import type { IChannelbeforeParsing, IChannel } from "../../type/Channel";

/**
 * チャンネル情報を検索する(最大30件ずつ)
 * @param _query 
 * @param _userId 
 * @param _pageIndex
 * @returns 
 */
export default function searchChannel(
  _query: string,
  _userId: string,
  _pageIndex = 1

):IChannel[]|null {
  try {

    //検索結果のずらし分計算
    const searchOffset = (_pageIndex - 1) * 30;

    //チャンネルを検索する
    const channelInfos = db.prepare(
      "SELECT * FROM CHANNELS WHERE channelName LIKE ? LIMIT 30 OFFSET ?"
    ).all(`${_query}%`, searchOffset) as IChannelbeforeParsing[] | undefined;

    if (channelInfos === undefined) return null;

    //権限を調べるためにユーザー情報を取得
    const userInfo = fetchUser(_userId, null);
    if (userInfo === null) return null;

    //チャンネル情報分ループしてこのユーザーが扱えるものか調べる
    for (const index in channelInfos) {
      //プライベートならユーザーの権限、あるいは作成者と同じか調べる
      if (channelInfos[index].isPrivate) {

        //チャンネル作成者と同じか、あるいはサーバー管理権限があるか調べて違うならその情報を削除する
        if (
          !userInfo.channelJoined.includes(channelInfos[index].channelId)
          &&
          !(roleCheck(_userId, "ServerManage"))
        ) channelInfos.splice(Number.parseInt(index), 1);
      }
    }

    //パースしたチャンネル情報を入れる配列
    const channelInfosParsed:IChannel[] = [];
    //ループしてチャンネル情報をパースする
    for (const index in channelInfos) {
      channelInfosParsed.push({
        ...channelInfos[index],
        isPrivate: channelInfos[index].isPrivate === 1,
      speakableRole: //👇空文字列なら空配列にする
        channelInfos[index].speakableRole!==""?channelInfos[index].speakableRole.split(","):[]
      })
    }

    return channelInfosParsed;

  } catch(e) {

    console.log("searchChannel :: エラー->", e);
    return null;

  }
}
