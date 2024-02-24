import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

import { IUserInfo } from "../type/User";

export default async function searchUser(userName:string, rule:"FULL"|"PARTIAL")
:Promise<IUserInfo[]> {
  return new Promise<IUserInfo[]>((resolve) => {
    if (rule === "PARTIAL") {
      //検索用クエリー
      const searchQuery = "%" + userName + "%";
      //ユーザー名でクエリが含まれるものを取得
      db.all("SELECT * FROM USERS_INFO LIKE userName = ?", [searchQuery], (err:Error, datUser:IUserInfo[]) => {
        if (err) {
          console.log("searchUser :: ERROR ->", err);
          resolve([]);
        } else {
          console.log("searchUser :: 検索結果->", userName, datUser);
          resolve(datUser);
        }
      });
    } else {
      //検索用クエリー
      //ユーザー名でクエリが含まれるものを取得
      db.all("SELECT * FROM USERS_INFO WHERE userName = ?", [userName], (err:Error, datUser:IUserInfo[]) => {
        if (err) {
          console.log("searchUser :: ERROR ->", err);
          resolve([]);
        } else {
          console.log("searchUser :: 検索結果->", userName, datUser);
          resolve(datUser);
        }
      });
    }
  });
}
