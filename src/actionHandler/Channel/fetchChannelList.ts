import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/SERVER.db");
import fetchUser from "../User/fetchUser";

import type { IChannel } from "../../type/Channel";

export default async function fetchChannelList(userId: string)
:Promise<any[]|null> {

  //ユーザー情報を取得、ないならnull
  const userInfo = await fetchUser(userId, null);
  if (userInfo === null) return null;

  return new Promise<IChannel[]|null>((resolve) => {
    db.all("SELECT * FROM CHANNELS", (err:Error, datChannels:IChannel[]) => {
      if (err) {
        console.log("fetchChannelList :: db : エラー->", err);
        resolve(null);
      } else {
        resolve(datChannels);
      }
    });
  });
}
