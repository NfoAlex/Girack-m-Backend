import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");
import fetchUser from "../../db/fetchUser";

import { IUserInfo } from "../../type/User";

export default async function authRegister(username:string):Promise<IUserInfo | -1> {
  const userId = await getNewUserId();

  //ユーザーIDが空ならエラーとして停止
  if (userId === "") return -1;

  //パスワードを生成する
  const passwordGenerated:string = generateKey();

  //ユーザー情報をDBへ作成
  db.run("insert into USERS_INFO values (?)",
    userId,
    username,
    "MEMBER",
    false,
    false,
    passwordGenerated
  );

  return {
    userId: "12345678",
    name: username,
    role: ["MEMBER"],
    loggedin: false,
    banned: false,
    pw: "password"
  };
}

async function getNewUserId():Promise<string> {
  const checkLoop = setInterval(async () => {
    let userIdGen = "";

    //9桁分の数字追加
    for (let i=0; i<8; i++) {
      userIdGen += Math.trunc(Math.random() * 9); //乱数を追加
    }

    //ユーザー検索、データ格納
    const datUser:IUserInfo[] = await fetchUser(null, userIdGen);
    console.log("authRegister :: getNewUserId : datUser->", datUser);
    
    //データ長さが0ならループ停止してIDを返す
    if (datUser.length === 0) {
      clearInterval(checkLoop);
      return userIdGen;
    }
  }, 10);

  return "";
}

//パスワード生成
function generateKey():string {
  const LENGTH = 24; //生成したい文字列の長さ
  const SOURCE = "abcdefghijklmnopqrstuvwxyz0123456789"; //元になる文字
  let result = ""; //パスワード文字列

  //パスワード生成、変数へ文字を追加
  for(let i=0; i<LENGTH; i++){
    result += SOURCE[Math.floor(Math.random() * SOURCE.length)];
  }
  return result;
}
