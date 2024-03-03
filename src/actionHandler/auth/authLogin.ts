import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");
import fetchUser from "../../db/fetchUser";

import { IUserInfo, IUserPassword } from "../../type/User";

export default async function authLogin(username:string, password:string)
:Promise<{authResult:boolean, UserInfo:IUserInfo|null, sessionId:string|null}> {
  try {

    //ユーザー情報取得
    const RESULT = await fetchUser(null, username);
    //console.log("authLogin :: authLogin : RESULT ->", RESULT);

    //そもそもユーザーが見つからないなら失敗として返す
    if (RESULT === null) return {authResult:false, UserInfo:null, sessionId:null};

    //パスワードを比較して結果保存
    const authResult:boolean = await new Promise(async (resolve) => {
      db.all("SELECT * FROM USERS_PASSWORD WHERE userId = ?", [RESULT.userId], (err:Error, datUser:IUserPassword[]) => {
        if (err) {
          console.log("authLogin :: authLogin(db) : ERROR ->", err);
          resolve(false);
        } else {
          //console.log("authLogin :: authLogin(db) : 検索結果->", datUser);
          //パスワードが合っているならtrueに
          if (datUser[0].password === password) {
            //console.log("authLogin :: authLogin(db) : パスワード合ってるね")
            resolve(true);
          } else {
            //console.log("authLogin :: authLogin(db) : パスワード違う");
            resolve(false);
          }
        }
      });
    });

    //違うなら失敗結果を返す
    if (authResult === false) return {authResult:false, UserInfo:null, sessionId:null};

    //セッション情報を作成してDBへ挿入
    const sessionIdGen = generateSessionId();
    db.run("insert into USERS_SESSION(userId, sessionId, sessionName) values(?,?,?)",
      RESULT.userId,
      sessionIdGen,
      "ログイン"
    );
    
    return {authResult:true, UserInfo:RESULT, sessionId:sessionIdGen};

  } catch(e) {

    console.log("authLogin :: authLogin : エラー->", e);
    return {authResult:false, UserInfo:null, sessionId:null};

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
