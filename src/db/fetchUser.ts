import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

import { IUserInfo } from "../type/User";

export default async function fetchUser(userId:string|null, username:string|null)
:Promise<IUserInfo[]> {
  return new Promise<IUserInfo[]>((resolve) => {
    //ユーザーIDが引数に無かったらIDで検索する
    if (userId === null) {
      //ユーザーを名前で検索
      db.all("SELECT * FROM USERS_INFO WHERE userName = ?", [username], (err:Error, datUser:IUserInfo[]) => {
        if (err) {
          console.log("fetchUser(userName) :: ERROR ->", err);
          resolve([]);
        } else {
          console.log("fetchUser(userName) :: 検索結果->", username, datUser);
          resolve(datUser);
        }
      });
    } else {
      //ユーザーをIDで検索
      db.all("SELECT * FROM USERS_INFO WHERE userId = ?", [userId], (err:Error, datUser:IUserInfo[]) => {
        if (err) {
          console.log("fetchUser(userId) :: ERROR ->", err);
          resolve([]);
        } else {
          console.log("fetchUser(userId) :: 検索結果->", userId, datUser);
          resolve(datUser);
        }
      });
    }
  });
}
