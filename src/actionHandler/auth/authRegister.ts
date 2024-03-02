import fs from "fs";
import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");
import fetchUser from "../../db/fetchUser";
import { ServerInfo } from "../../db/InitServer";

import { IUserConfig, IUserInfo } from "../../type/User";

export default async function authRegister(username:string, inviteCode:string|null)
:Promise<IUserInfo|"ERROR_WRONGINVITECODE"|"ERROR_DB_THING"> {
  try {

    //招待コードの確認
    if (ServerInfo.registration.invite.inviteOnly) { //招待制？
      //招待コードが違うならエラー文を返す
      if (ServerInfo.registration.invite.inviteCode !== inviteCode) {
        return "ERROR_WRONGINVITECODE";
      }
    }

    //ユーザー名の空きを確認
    if ((await fetchUser(null, username, true)) !== null) throw Error;
    
    //空いているユーザーIDを見つける
    const userIdGen = await getNewUserId();

    //ユーザーIDが空ならエラーとして停止
    if (userIdGen === "") throw Error;

    //パスワードを生成する
    const passwordGenerated:string = generateKey();

    //ユーザー情報をDBへ作成
    db.run("insert into USERS_INFO values (?,?,?,?,?,?)",
      userIdGen,
      username,
      "MEMBER",
      "0001",
      false,
      false
    );

    //生成したパスワードを記録
    db.run("insert into USERS_PASSWORD values (?,?)", userIdGen, passwordGenerated);

    //デフォルトのユーザー設定のJSON読み込み
    const defaultConfigData:IUserConfig = JSON.parse(
      fs.readFileSync('./src/db/defaultValues/UserConfig.json', 'utf-8')
    );
    //デフォルトの設定の値をDBへ挿入
    db.run("INSERT INTO USERS_CONFIG (userId, notification, theme, channel, sidebar) values (?,?,?,?,?)",
      userIdGen,
      JSON.stringify(defaultConfigData.notification),
      defaultConfigData.theme,
      JSON.stringify(defaultConfigData.channel),
      JSON.stringify(defaultConfigData.sidebar),
    );

    console.log("authRegister :: アカウント作成したよ ->", userIdGen, passwordGenerated);

    return {
      userId: userIdGen,
      userName: username,
      role: ["MEMBER"],
      channelJoined: ["0001"],
      loggedin: false,
      banned: false,
      password: passwordGenerated
    };

  } catch(e) {

    console.log("authRegister :: authRegister : エラー->", e);
    return "ERROR_DB_THING";

  }
}

//ユーザーIDの空きを探す
async function getNewUserId():Promise<string> {
  let tryCount:number = 0;

  return new Promise<string>((resolve) => {
    try {

      const checkLoop = setInterval(async () => {
        //生成するID
        let userIdGen = "";
        //9桁分の数字追加してIDにする
        for (let i=0; i<8; i++) {
          userIdGen += Math.trunc(Math.random() * 9); //乱数を追加
        }
    
        //ユーザー検索、データ格納
        const datUser = await fetchUser(userIdGen, null, false);
        console.log("authRegister :: getNewUserId : datUser->", datUser);
        
        //データ長さが0ならループ停止してIDを返す
        if (datUser === null) {
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

    } catch(e) {

      console.log("authRegister :: getNewUserId : エラー->", e);
      resolve("");

    }
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
