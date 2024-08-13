import fetchUser from "../User/fetchUser";

import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import type { IUserInfo, IUserPassword } from "../../type/User";

/**
 * パスワード認証を行う
 * @param _username 
 * @param _password 
 * @returns 
 */
export default function authLogin(_username:string, _password:string)
:{authResult:boolean, UserInfo:IUserInfo|null, sessionId:string|null} {
  try {

    //ユーザー情報取得
    const RESULT = fetchUser(null, _username);
    //console.log("authLogin :: authLogin : RESULT ->", RESULT);

    //そもそもユーザーが見つからないなら失敗として返す
    if (RESULT === null) return {authResult:false, UserInfo:null, sessionId:null};

    //パスワードデータを取得
    const passwordData = db.prepare(
      "SELECT * FROM USERS_PASSWORD WHERE userId=?"
    ).get(RESULT.userId) as IUserPassword|undefined;
    //undefinedなら停止
    if (passwordData === undefined) return {authResult:false, UserInfo:null, sessionId:null};

    //パスワード比較
    const authResult = passwordData.password === _password;

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
