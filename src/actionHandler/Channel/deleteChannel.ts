import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/SERVER.db");
import fetchChannel from "./fetchChannel";
import roleCheck from "../../util/roleCheck";

export default async function deleteChannel(
    userId: string,
    channelId: string
  ):Promise<boolean> {
  try {

    //チャンネル情報を取得
    const channelInfo = await fetchChannel(channelId);
    //無ければ停止
    if (channelInfo === null) return false;

    //チャンネル作成者でない場合権限があるかを確認
    if (channelInfo.createdBy !== userId) {
      //チャンネル管理のロール権限を確認する
      const roleCheckResult = await roleCheck(userId, "ChannelCreateAndDelete");
      if (!roleCheckResult) { //falseなら停止
        return false;
      }
    }

    return new Promise((resolve) => {
      //テーブルからチャンネルを削除
      db.run(
        "DELETE FROM CHANNELS WHERE channelId=?",
        channelId,
        (err) => {
          //結果に応じてbooleanで結果を返す
          if (err) {
            resolve(false);
            return;
          } else {
            resolve(true);
            return;
          }
        }
      );
      
    });

  } catch(e) {

    console.log("deleteChannel :: エラー->", e);
    return false;

  }
}
