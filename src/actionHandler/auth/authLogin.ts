import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");
import fetchUser from "../../db/fetchUser";

import { IUserInfo } from "../../type/User";

export default async function authLogin(username:string, password:string):Promise<{authResult:boolean, UserInfo:IUserInfo|null}> {
  //ユーザー検索、パスワードを比較する
  db.all("SELECT * FROM USERS_INFO WHERE name = ?", [username], (err:Error, datUser:IUserInfo) => {
    if (err) {
      console.log("authLogin :: ERROR ->", err);
    } else {
      console.log("authLogin :: 検索結果->", datUser);
    }
  });

  //ユーザー情報取得
  const RESULT = await fetchUser(null, username);

  console.log("authLogin :: authLogin : RESULT ->", RESULT);

  if (RESULT.length === 0) return {authResult:false, UserInfo:null};

  //パスワード比較、結果を返す
  if (RESULT[0].password === password) {
    return {authResult:true, UserInfo:RESULT[0]};
  } else {
    return {authResult:false, UserInfo:null};
  }
}
