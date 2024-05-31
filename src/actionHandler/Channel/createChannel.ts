import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/SERVER.db");
import fetchUser from "../User/fetchUser";
import fetchChannel from "./fetchChannel";

export default async function createChannel(
    channelName:string,
    description:string,
    isPrivate:boolean,
    userId:string,
  ):Promise<boolean> {
  try {

    return new Promise(async (resolve) => {
      //TODO :: ロールチェック

      //空いているチャンネルIDを探して取得
      const channelIdGen = await getNewChannelId();
      //IDが空なら失敗として返す
      if (channelIdGen === "") return false;

      //チャンネルデータを挿入
      return db.run(`
        INSERT INTO CHANNELS (
          channelId, channelName, description, createdBy, isPrivate, speakableRole
        )
        values (?,?,?,?,?,?)
        `,
        channelIdGen,
        channelName,
        description,
        userId,
        isPrivate,
        "MEMBER",
        (err:Error) => { //結果処理
          //エラーなら失敗と返し、無事ならtrueを返す
          if (err) {
            resolve(false);
          } else {
            resolve(true);
          }
        }
      );
    });

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
        //4桁分の数字追加してIDにする
        for (let i=0; i<4; i++) {
          channelIdGen += Math.trunc(Math.random() * 9); //乱数を追加
        }
    
        //チャンネル検索、データ格納
        const datChannel = await fetchChannel(channelIdGen, "SYSTEM");
        console.log("createChannel :: getNewChannelId : datChannel->", datChannel);
        
        //データ長さが0ならループ停止してIDを返す
        if (datChannel === null) {
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
