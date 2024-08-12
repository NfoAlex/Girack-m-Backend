import fetchUser from "../User/fetchUser";

import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

/**
 * チャンネルから脱退する
 * @param _userId 
 * @param _channelId 
 * @returns 
 */
export default async function leaveChannel(_userId:string, _channelId:string)
:Promise<boolean> {
  try {
    
    //現在のユーザー情報を取得
    const userInfo = await fetchUser(_userId, null);
    //情報が空なら処理停止
    if (userInfo === null) {
      return false;
    }
    //参加しているチャンネルの配列抜き出し
    const channelJoinedArr = userInfo.channelJoined;
    
    //参加チャンネル配列にチャンネルIDが無いなら停止
    if (!channelJoinedArr.includes(_channelId)) {
      return false;
    }

    //チャンネルIDを配列から削除
    channelJoinedArr.splice(channelJoinedArr.indexOf(_channelId), 1);

    //テーブルへチャンネル参加配列を適用
    db.prepare(
      "UPDATE USERS_INFO SET channelJoined=? WHERE userId=?"
    ).run(channelJoinedArr.join(","), _userId);

    return true;

  } catch(e) {

    console.log("leaveChannel :: エラー->", e);
    return false;

  }
}
