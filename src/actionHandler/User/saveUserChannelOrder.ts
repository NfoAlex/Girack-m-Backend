import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

import type { IChannelOrder } from "../../type/Channel";

export default async function saveUserChannelOrder(userId:string, channelOrder:IChannelOrder)
:Promise<boolean> {
  return new Promise((resolve) => {
    try {

      //設定データを書き込み更新
      db.run(
        `
        UPDATE USERS_SAVES SET channelOrder=?
          WHERE userId=?
        `
        ,
        [JSON.stringify(channelOrder), userId],
      (err) => {
        if (err) {
          console.log("saveUserChannelOrder :: エラー->", err);
          //失敗と返す
          resolve(false);
          return;
        } else {
          //成功と返す
          resolve(true);
          return;
        }
      });
      
    } catch(e) {

      console.log("saveUserChannelOrder :: エラー->", e);
      resolve(false);
      return;

    }
  });
}