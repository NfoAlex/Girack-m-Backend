import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");
import fetchUser from "../../db/fetchUser";

import { IUserInfo } from "../../type/User";

export default async function authLogin(username:string, password:string)
:Promise<{authResult:boolean, UserInfo:IUserInfo|null}> {
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

  //そもそもユーザーが見つからないなら失敗として返す
  if (RESULT.length === 0) return {authResult:false, UserInfo:null};

  //セッション情報を作成してDBへ挿入
  const sessionIdGen = generateSessionId();
  db.run("insert into USERS_SESSION(userId, sessionId, sessionName) values(?,?,?)",
    RESULT[0].userId,
    sessionIdGen,
    "ログイン"
  );

  //パスワード比較、結果を返す
  if (RESULT[0].password === password) {
    return {authResult:true, UserInfo:RESULT[0]};
  } else {
    return {authResult:false, UserInfo:null};
  }
}

//セッションID生成
function generateSessionId():string {
  const LENGTH = 24; //生成したい文字列の長さ
  const SOURCE = "abcdefghijklmnopqrstuvwxyz0123456789"; //元になる文字

  //セッションID
  let result = "";

  for(let i=0; i<LENGTH; i++){
    result += SOURCE[Math.floor(Math.random() * SOURCE.length)];
  }

  return result;
}
