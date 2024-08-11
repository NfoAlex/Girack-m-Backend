import fetchUser from "../User/fetchUser";

import Database from 'better-sqlite3';
const db = new Database('./records/USER.db', {verbose: console.log });
db.pragma('journal_mode = WAL');

import type { IUserInfo, IUserPassword } from "../../type/User";

export default async function authLogin(username:string, password:string)
:Promise<{authResult:boolean, UserInfo:IUserInfo|null, sessionId:string|null}> {
  try {

    //ユーザー情報取得
    const RESULT = await fetchUser(null, username);
    //console.log("authLogin :: authLogin : RESULT ->", RESULT);

    //そもそもユーザーが見つからないなら失敗として返す
    if (RESULT === null) return {authResult:false, UserInfo:null, sessionId:null};

    //パスワードを比較して結果保存
    const authResult:boolean = await new Promise((resolve) => {
      const passwordData =
        db.prepare("SELECT * FROM USERS_PASSWORD WHERE userId=?")
        .get(RESULT.userId) as IUserPassword|null;
      
      console.log("authLogin :: passwordData->", passwordData);
      if (passwordData !== null) {
        if (passwordData.password === password) {
          resolve(true);
          return;
        }
      }

      resolve(false);
      return;
    });

    //違うなら失敗結果を返す
    if (authResult === false) return {authResult:false, UserInfo:null, sessionId:null};

    //セッション情報を作成してDBへ挿入
    const sessionIdGen = generateSessionId();
    db.prepare(
      "INSERT INTO USERS_SESSION(userId, sessionId, sessionName) values(?,?,?)"
    ).run(RESULT.userId, sessionIdGen, "ログイン");
    
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
