import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

import { IUserInfo } from "../type/User";

export default async function fetchUser(userId:string|null, username:string|null):Promise<IUserInfo[]> {
  //ユーザーIDが引数に無かったらIDで検索する
  if (userId === undefined) {
    //ユーザーを名前で検索
    db.run("SELECT * FROM USERS_INFO WHERE name = ?", [username], (err:Error, datUser:IUserInfo) => {
      if (err) {
        console.log("fetchUser(username) :: ERROR ->", err);
      } else {
        console.log("fetchUser(username) :: 検索結果->", datUser);
        return datUser;
      }
    });
  } else {
    //ユーザーをIDで検索
    db.run("SELECT * FROM USERS_INFO WHERE userId = ?", [userId], (err:Error, datUser:IUserInfo) => {
      if (err) {
        console.log("fetchUser(userId) :: ERROR ->", err);
      } else {
        console.log("fetchUser(userId) :: 検索結果->", datUser);
        return datUser;
      }
    });
  }

  return [];

}
