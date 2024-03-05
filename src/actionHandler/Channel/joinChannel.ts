import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");
import fetchUser from "../User/fetchUser";
import fetchChannel from "./fetchChannel";

export default async function joinChannel(userId:string, channelId:string)
:Promise<boolean> {
  try {
    
    return new Promise(async (resolve) => {
      //チャンネルの存在を確認しないなら停止
      if (await fetchChannel(channelId) === null) {
        resolve(false);
        return;
      }
      
      //TODO :: ロール確認(ChannelViewPrivate)

      //現在のユーザー情報を取得
      const userInfo = await fetchUser(userId, null);
      //情報が空なら処理停止
      if (userInfo === null) {
        resolve(false);
        return;
      }
      //参加しているチャンネルの配列抜き出し
      const channelJoinedArr = userInfo.channelJoined;
      
      //参加チャンネル配列にすでにチャンネルIDが入ってるなら停止
      if (!channelJoinedArr.includes(channelId)) {
        resolve(false);
        return;
      }
      
      //チャンネルIDを配列へ追加
      channelJoinedArr.push(channelId);

      //DBにて更新
      db.run(
        "UPDATE USERS_INFO SET channelJoined=? WHERE userId=?",
        [
          channelJoinedArr.join(","), //更新した参加チャンネル配列
          userId //参加するユーザーID
        ],
        (err) => {
          if (err) {
            console.log("joinChannel :: db : エラー->", err);
            //エラーなら失敗
            resolve(false);
            return;
          } else {
            //無事なら成功
            resolve(true);
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("joinChannel :: エラー->", e);
    return false;

  }
}
