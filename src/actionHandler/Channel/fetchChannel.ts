import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/SERVER.db");
import fetchUser from "../User/fetchUser";
import roleCheck from "../../util/roleCheck";

import type { IChannelbeforeParsing, IChannel } from "../../type/Channel";

export default async function fetchChannel(channelId:string, userId:string)
:Promise<IChannel|null> {

  //ユーザー情報を取得、ないならnull
  const userInfo = await fetchUser(userId, null);
  if (userInfo === null) return null;

  //このユーザーがサーバー管理権限がありプラベを見られるか調べる
  const roleServerManage = await roleCheck(userId, "ServerManage");

  return new Promise<IChannel|null>((resolve) => {
    db.all("SELECT * FROM CHANNELS WHERE channelId = ?", [channelId], (err:Error, datChannels:IChannelbeforeParsing[]) => {
      if (err) {
        console.log("fetchChannel :: db : エラー->", err);
        resolve(null);
      } else {
        //console.log("fetchChannel :: db : 取得結果->", datChannels);
        //チャンネルデータが無ければnull、あれば整形して返す
        if (datChannels.length === 0) {
          resolve(null);
          return;
        } else {
          //プラベで権限が無いならnull
          if (datChannels[0].isPrivate && !roleServerManage) {
            //返す
            resolve(null);
            return;
          }

          //チャンネル情報を整形する
          const infoGotIt:IChannel = {
            ...datChannels[0],
            isPrivate: datChannels[0].isPrivate==="1"?true:false,
            speakableRole: datChannels[0].speakableRole.split(",")
          };
          //返す
          resolve(infoGotIt);
          return;
        }
      }
    });
  });
}
