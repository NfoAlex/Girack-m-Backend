import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/SERVER.db");

import type { IChannelbeforeParsing, IChannel } from "../../type/Channel";

export default async function fetchChannel(channelId:string)
:Promise<IChannel|null> {
  return new Promise<IChannel|null>((resolve) => {
    db.all("SELECT * FROM CHANNELS WHERE channelId = ?", [channelId], (err:Error, datChannels:IChannelbeforeParsing[]) => {
      if (err) {
        console.log("fetchChannel :: db : エラー->", err);
        resolve(null);
      } else {
        console.log("fetchChannel :: db : 取得結果->", datChannels);
        //チャンネルデータが無ければnull、あれば整形して返す
        if (datChannels.length === 0) {
          resolve(null);
          return;
        } else {
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
