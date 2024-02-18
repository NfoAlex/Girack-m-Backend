import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

import { IUserInfo } from "../../type/User";

export default function authLogin(username:string, password:string):boolean {
  //ユーザー検索、パスワードを比較する
  db.all("SELECT * FROM USERS_INFO WHERE name = ?", [username], (err:Error, datUser:IUserInfo) => {
    if (err) {
      console.log("authLogin :: ERROR ->", err);
    } else {
      console.log("authLogin :: 検索結果->", datUser);
    }
  });

  return false;
}
