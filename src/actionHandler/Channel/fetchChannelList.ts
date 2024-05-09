import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/SERVER.db");
import fetchUser from "../User/fetchUser";
import roleCheck from "../../util/roleCheck";

import type { IChannel } from "../../type/Channel";

export default async function fetchChannelList(userId: string)
:Promise<any[]|null> {

  //ユーザー情報を取得、ないならnull
  const userInfo = await fetchUser(userId, null);
  if (userInfo === null) return null;

  //このユーザーはプラベチャンネルを見られるか調べる
  const rolePowerViewPrivate = await roleCheck(userId, "ChannelViewPrivate");

  return new Promise<IChannel[]|null>((resolve) => {
    db.all("SELECT * FROM CHANNELS", (err:Error, datChannels:IChannel[]) => {
      if (err) {
        console.log("fetchChannelList :: db : エラー->", err);
        resolve(null);
      } else {
        //プラベチャンネルを見れる権限があるなら参加確認しない
        if (!rolePowerViewPrivate) {
          //権限を持っておらず、参加していないなら除去
          let datChannelsFiltered = datChannels.filter((channel) => {
            return userInfo.channelJoined.includes(channel.channelId)
                  ||
                  !channel.isPrivate
          });

          resolve(datChannelsFiltered);
        } else {
          resolve(datChannels);
        }
      }
    });
  });
}
