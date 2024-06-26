import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

import type { IUserConfig } from "../../type/User";

export default async function saveUserConfig(userId:string, datConfig:IUserConfig):Promise<boolean> {
  return new Promise((resolve) => {
    try {

      //SQLの実行文
      const sqlContext = "UPDATE USERS_CONFIG SET notification=?, theme=?, channel=?, sidebar=? WHERE userId=?";

      //設定データを書き込み更新
      db.run(sqlContext,
        [
          JSON.stringify(datConfig.notification),
          datConfig.theme,
          JSON.stringify(datConfig.channel),
          JSON.stringify(datConfig.sidebar),
          userId //書き込み先のユーザーID
        ],
      (err) => {
        if (err) {
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

      console.log("saveUserConfig :: エラー->", e);
      resolve(false);
      return;

    }
  });
}
