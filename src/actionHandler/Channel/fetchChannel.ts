import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/SERVER.db");
import fetchUser from "../User/fetchUser";
import roleCheck from "../../util/roleCheck";

import type { IChannelbeforeParsing, IChannel } from "../../type/Channel";

export default async function fetchChannel(channelId:string, userId:string)
:Promise<IChannel|null> {
  return new Promise<IChannel|null>(async (resolve) => {
    db.all("SELECT * FROM CHANNELS WHERE channelId = ?", [channelId], async (err:Error, datChannels:IChannelbeforeParsing[]) => {
      if (err) {
        console.log("fetchChannel :: db : エラー->", err);
        resolve(null);
        return;
      } else {
        //console.log("fetchChannel :: db : 取得結果->", datChannels);
        //チャンネルデータが無ければnull、あれば整形して返す
        if (datChannels.length === 0) {
          resolve(null);
          return;
        } else {
          //プラベなら権限と参加を調べて無いならnull
          if (datChannels[0].isPrivate) {
            //ユーザー情報を取得
            const userInfo = await fetchUser(userId, null);
            //ユーザー情報がそもそもないならnull
            if (userInfo === null) {
              resolve(null);
              return;
            }
            //もし参加チャンネルに入ってなければnull
            if (!userInfo.channelJoined.includes(channelId)) {
              resolve(null);
              return;
            }

            //このユーザーがサーバー管理権限がありプラベを見られるか調べる
            if (
              !userInfo.channelJoined.includes(channelId)
                &&
              !(await roleCheck(userId, "ServerManage"))
            ) {
              //返す
              resolve(null);
              return;
            }
          }
          
          //チャンネル情報を整形する
          const infoGotIt:IChannel = {
            ...datChannels[0],
            isPrivate: datChannels[0].isPrivate===1?true:false,
            speakableRole: //空文字列なら空配列にする
              datChannels[0].speakableRole!==""?datChannels[0].speakableRole.split(","):[]
          };
          //返す
          resolve(infoGotIt);
          return;
        }
      }
    });
  });
}
