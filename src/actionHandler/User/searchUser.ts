import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

import { IUserInfo } from "../../type/User";

export default async function searchUser(
  userName: string,
  rule: "FULL"|"PARTIAL",
  channelId?: string
):Promise<IUserInfo[]> {
  return new Promise<IUserInfo[]>((resolve) => {
    //チャンネルIdの指定があるかどうかでSQL文へ追加する文構成
    const optionChannel =
      channelId!==undefined 
      ?
        " AND channelJoined LIKE '%" + channelId + "%'"
      :
        "";

  
    //検索用クエリー
    const searchQuery = 
      rule==='PARTIAL'
      ?
        "%" + userName + "%" //部分検索
      :
        userName; //完全検索

    console.log("searchUser :: sql文 ->", 
      `
      SELECT * FROM USERS_INFO
        WHERE userName LIKE 
      ` + searchQuery + optionChannel
    );

    //ユーザー名でクエリが含まれるものを取得
    db.all(
      `
      SELECT * FROM USERS_INFO
        WHERE userName LIKE ?
      ` + optionChannel,
      [searchQuery],
      (err:Error, datUser:IUserInfo[]) => {
        if (err) {
          console.log("searchUser :: ERROR ->", err);
          resolve([]);
        } else {
          //console.log("searchUser :: 検索結果->", userName, datUser);
          resolve(datUser);
        }
      }
    );
    
  });
}
