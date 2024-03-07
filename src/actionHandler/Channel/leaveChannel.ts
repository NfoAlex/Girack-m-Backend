import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");
import fetchUser from "../User/fetchUser";

export default async function leaveChannel(userId:string, channelId:string)
:Promise<boolean> {
  try {
    
    return new Promise(async (resolve) => {
      
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
      
      //参加チャンネル配列にチャンネルIDが無いなら停止
      if (!channelJoinedArr.includes(channelId)) {
        resolve(false);
        return;
      }

      //チャンネルIDを配列から削除
      channelJoinedArr.splice(channelJoinedArr.indexOf(channelId), 1);

      //DBにて更新
      db.run(
        "UPDATE USERS_INFO SET channelJoined=? WHERE userId=?",
        [
          channelJoinedArr.join(","), //更新した参加チャンネル配列
          userId //参加するユーザーID
        ],
        (err) => {
          if (err) {
            console.log("leaveChannel :: db : エラー->", err);
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

    console.log("leaveChannel :: エラー->", e);
    return false;

  }
}
