import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/SERVER.db");

export default async function fetchChannelList()
:Promise<any[]|null> {
  return new Promise<any[]|null>((resolve) => {
    db.all("SELECT * FROM CHANNEL", (err:Error, datChannels:any[]) => {
      if (err) {
        console.log("fetchChannelList :: db : エラー->", err);
        resolve(null);
      } else {
        console.log("fetchChannelList :: db : 取得結果->", datChannels);
        resolve(datChannels);
      }
    });
  });
}
