import fetchUser from "../User/fetchUser";
import fetchChannel from "./fetchChannel";

import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

/**
 * チャンネルへ参加させる
 * @param _userId 
 * @param _channelId 
 * @returns 
 */
export default function joinChannel(_userId:string, _channelId:string)
:boolean {
  try {

    //チャンネルの存在を確認しないなら停止
    if (fetchChannel(_channelId, _userId) === null) {
      return false;
    }

    //現在のユーザー情報を取得
    const userInfo = fetchUser(_userId, null);
    //情報が空なら処理停止
    if (userInfo === null) {
      return false;
    }
    //参加しているチャンネルの配列抜き出し
    const channelJoinedArr = userInfo.channelJoined;

    //参加チャンネル配列にすでにチャンネルIDが入ってるなら停止
    if (channelJoinedArr.includes(_channelId)) {
      return false;
    }

    //参加配列が空([""])なら代入、違うならチャンネルIDを配列へ追加
    if (channelJoinedArr.length === 1 && channelJoinedArr[0] === "") {
      channelJoinedArr[0] = _channelId;
    } else {
      channelJoinedArr.push(_channelId);
    }

    //ユーザーのレコードへ挿入
    db.prepare(
      "UPDATE USERS_INFO SET channelJoined=? WHERE userId=?"
    ).run(channelJoinedArr.join(","), _userId);

    return true;

  } catch(e) {

    console.log("joinChannel :: エラー->", e);
    return false;

  }
}
