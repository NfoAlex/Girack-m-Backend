import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");
import fetchUser from "../../db/fetchUser";

import { IUserInfo } from "../../type/User";

export default async function authRegister(username:string):Promise<IUserInfo | -1> {
  //TODO :: 招待コードの確認
  
  const userIdGen = await getNewUserId();

  //ユーザーIDが空ならエラーとして停止
  if (userIdGen === "") return -1;

  //パスワードを生成する
  const passwordGenerated:string = generateKey();

  //ユーザー情報をDBへ作成
  db.run("insert into USERS_INFO values (?,?,?,?,?,?,?)",
    userIdGen,
    username,
    "MEMBER",
    "0001",
    false,
    false,
    passwordGenerated
  );

  console.log("authRegister :: アカウント作成したよ ->", userIdGen, passwordGenerated);

  return {
    userId: userIdGen,
    name: username,
    role: ["MEMBER"],
    channelJoined: ["0001"],
    loggedin: false,
    banned: false,
    password: passwordGenerated
  };
}

//ユーザーIDの空きを探す
async function getNewUserId():Promise<string> {
  let tryCount:number = 0;

  return new Promise<string>((resolve) => {
    const checkLoop = setInterval(async () => {
      //生成するID
      let userIdGen = "";
      //9桁分の数字追加してIDにする
      for (let i=0; i<8; i++) {
        userIdGen += Math.trunc(Math.random() * 9); //乱数を追加
      }
  
      //ユーザー検索、データ格納
      const datUser:IUserInfo[] = await fetchUser(userIdGen, null);
      console.log("authRegister :: getNewUserId : datUser->", datUser);
      
      //データ長さが0ならループ停止してIDを返す
      if (datUser.length === 0) {
        clearInterval(checkLoop);
        resolve(userIdGen); //IDを返す
      }
      //10回試しても空きがないなら
      if (tryCount === 10) {
        clearInterval(checkLoop);
        resolve(""); //空で返す
      }
      //試行回数加算
      tryCount++;
    }, 10);
  });
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
