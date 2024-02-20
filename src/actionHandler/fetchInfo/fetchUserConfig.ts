import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

import { IUserConfig } from "../../type/User";

export default function fetchUserConfig(userId:string)
:Promise<IUserConfig|null> {
  //ユーザー情報取得
  return new Promise<IUserConfig|null>((resolve) => {
    //ユーザーをIDで検索
    db.all("SELECT * FROM USERS_CONFIG WHERE userId = ?", [userId], (err:Error, datConfig:IUserConfig) => {
      if (err) {
        console.log("fetchUserConfig :: ERROR ->", err);
        resolve(null);
      } else {
        console.log("fetchUserConfig :: 検索結果->", userId, datConfig);
        resolve(datConfig);
      }
    });
  });
}
