import fs from "node:fs";
import fetchUser from "../User/fetchUser";
import { ServerInfo } from "../../db/InitServer";

import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import type { IUserConfig, IUserInfo } from "../../type/User";
import type IServerInfo from "../../type/Server";

export default async function authRegister(username:string, inviteCode:string|null)
:Promise<{userInfo:IUserInfo, password:string}|"ERROR_WRONGINVITECODE"|"ERROR_DB_THING"> {
  try {

    //招待コードの確認
    if (ServerInfo.registration.invite.inviteOnly) { //招待制？
      //招待コードが違うならエラー文を返す
      if (ServerInfo.registration.invite.inviteCode !== inviteCode) {
        return "ERROR_WRONGINVITECODE";
      }
    }

    //一番最初のユーザーを登録するのかどうか
      //最後に返すロールの内容用
    let isFirstUser = false;

    //ユーザー名の空きを確認
    if ((fetchUser(null, username)) !== null) throw Error;
    
    //空いているユーザーIDを見つける
    const userIdGen = await getNewUserId();
    //ユーザーIDが空ならエラーとして停止
    if (userIdGen === "") throw Error;

    //パスワードを生成する
    const passwordGenerated:string = generateKey();
    
    //サーバーの設定ファイル読み取り
    const ServerConfig:IServerInfo = JSON.parse(fs.readFileSync("./records/server.json", "utf-8"));

    const count = db.prepare("SELECT COUNT(*) FROM USERS_INFO").get() as {"COUNT(*)":number};
    //console.log("authRegister :: カウント->", count);

    //ユーザー数が0ならHOSTアカウントを作る、1以上ならMemberで普通に作る
    if (count["COUNT(*)"] === 0) {
      db.prepare(
        "insert into USERS_INFO values (?,?,?,?,?)"
      ).run(userIdGen, username, "HOST", "0001", 0);

      //一人目のユーザーであることを記憶しておく
      isFirstUser = true;
    } else {
      db.prepare(
        "insert into USERS_INFO values (?,?,?,?,?)"
      ).run(
        userIdGen,
        username,
        "Member",
        ServerConfig.config.CHANNEL.defaultJoinOnRegister.join(","), //デフォで参加するチャンネル
        0
      );
    }

    //生成したパスワードを記録
    db.prepare(
      "INSERT INTO USERS_PASSWORD values (?,?)"
    ).run(userIdGen, passwordGenerated);

    //デフォルトのユーザー設定のJSON読み込み
    const defaultConfigData:IUserConfig = JSON.parse(
      fs.readFileSync('./src/db/defaultValues/UserConfig.json', 'utf-8')
    );
    //デフォルトの設定の値をDBへ挿入
    db.prepare(
      "INSERT INTO USERS_CONFIG (userId, notification, theme, channel, sidebar) values (?,?,?,?,?)"
    ).run(
      userIdGen,
      JSON.stringify(defaultConfigData.notification),
      defaultConfigData.theme,
      JSON.stringify(defaultConfigData.channel),
      JSON.stringify(defaultConfigData.sidebar)
    );

    //デフォルトのユーザーデータ用テーブルのデータを作成
    db.prepare(
      "INSERT INTO USERS_SAVES (userId) values (?)"
    ).run(userIdGen);

    //console.log("authRegister :: アカウント作成したよ ->", userIdGen, passwordGenerated);

    return {
      userInfo: {
        userId: userIdGen,
        userName: username,
        role: isFirstUser?["HOST"]:["MEMBER"], //最初のユーザーならHOST
        channelJoined: ["0001"],
        threadJoined: [],
        banned: false,
      },
      password: passwordGenerated
    };

  } catch(e) {

    console.log("authRegister :: authRegister : エラー->", e);
    return "ERROR_DB_THING";

  }
}

//ユーザーIDの空きを探す
async function getNewUserId():Promise<string> {
  let tryCount = 0;

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
        const datUser = fetchUser(userIdGen, null);
        //console.log("authRegister :: getNewUserId : datUser->", datUser);
        
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
