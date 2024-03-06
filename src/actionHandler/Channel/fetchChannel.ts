import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/SERVER.db");

export default async function fetchChannel(channelId:string)
:Promise<any|null> {
  return new Promise<any|null>((resolve) => {
    db.all("SELECT * FROM CHANNELS WHERE channelId = ?", [channelId], (err:Error, datChannels:any[]) => {
      if (err) {
        console.log("fetchChannel :: db : エラー->", err);
        resolve(null);
      } else {
        console.log("fetchChannel :: db : 取得結果->", datChannels);
        resolve(datChannels[0]);
      }
    });
  });
}
