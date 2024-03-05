import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");
import fetchUser from "../User/fetchUser";
import fetchChannel from "./fetchChannel";

export default async function joinChannel(userId:string, channelId:string) {
  try {
    
    //チャンネルの存在を確認する
    if (await fetchChannel(channelId) === null) {
      return false;
    }
    
    //TODO :: ロール確認(ChannelViewPrivate)

    //現在のユーザー情報を取得
    const userInfo = await fetchUser(userId, null);
    //情報が空なら処理停止
    if (userInfo === null) return false;
    //参加しているチャンネルの配列抜き出し
    const channelJoinedArr = userInfo.channelJoined;

    //チャンネルIDを配列へ追加
    channelJoinedArr.push(channelId);

    //DBにて更新
    db.run(
      "UPDATE USERS_INFO SET channelJoined=?",
      channelJoinedArr,
      (err) => {
        if (err) {
          console.log("joinChannel :: db : エラー->", err);
          //エラーなら失敗
          return false;
        } else {
          //無事なら成功
          return true;
        }
      }
    );

  } catch(e) {

    return false;

  }
}
