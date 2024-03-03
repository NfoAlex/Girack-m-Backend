import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/SERVER.db");
import fetchUser from "../../db/fetchUser";
import fetchChannel from "./fetchChannel";

export default async function createChannel(
    channelName:string,
    description:string,
    userId:string
  ):Promise<boolean> {
  try {

    //TODO :: ロールチェック

    //空いているチャンネルIDを探して取得
    const channelIdGen = await getNewChannelId();

    //チャンネルデータを挿入
    db.run(
      "INSERT INTO CHANNELS (channelId, channelName, description, createdBy, isPrivate, speakableRole)",
      channelIdGen,
      channelName,
      description,
      userId,
      false,
      "MEMBER"
    );

    return true;

  } catch(e) {

    console.log("createChannel :: エラー->", e);
    return false;

  }
}

//チャンネルIDの空きを探す
async function getNewChannelId():Promise<string> {
  let tryCount:number = 0;

  return new Promise<string>((resolve) => {
    try {

      const checkLoop = setInterval(async () => {
        //生成するID
        let channelIdGen = "";
        //9桁分の数字追加してIDにする
        for (let i=0; i<4; i++) {
          channelIdGen += Math.trunc(Math.random() * 9); //乱数を追加
        }
    
        //チャンネル検索、データ格納
        const datUser = await fetchChannel(channelIdGen);
        console.log("authRegister :: getNewUserId : datUser->", datUser);
        
        //データ長さが0ならループ停止してIDを返す
        if (datUser === null) {
          clearInterval(checkLoop);
          resolve(channelIdGen); //IDを返す
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

      console.log("createChannel :: getNewChannelId : エラー->", e);
      resolve("");

    }
  });
}
