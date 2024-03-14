import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

import type { IUserInfo, IUserInfoBeforeParsing } from "../../type/User";

export default async function fetchUserAll(indexPage:number)
:Promise<{[key: string]: IUserInfo} | null> {
  try {

    //ユーザーを取得し始める位置(1ページ30人)
    const indexStarting:number = 30 * (indexPage - 1);
    
    return new Promise((resolve) => {
      db.all("SELECT * FROM USERS_INFO LIMIT 30 OFFSET ? ", indexStarting, (err:Error, datUser:IUserInfoBeforeParsing[]) => {
        if (err) {
          console.log("fetchUser(userId) :: ERROR ->", err);
          resolve(null);
        } else {
          //console.log("fetchUserAll :: 検索結果->", userId, datUser);
          //そもそも結果が無いならそう返す
          if (datUser.length === 0) {
            resolve(null);
            return;
          }

          //パースするユーザー情報を入れるJSON
          const datUserParsed:{
            [key: string]: IUserInfo
          } = {};

          //ユーザーの数だけループしてパース
          for (let user of datUser) {
            //JSONへ格納
            datUserParsed[user.userId] = {
              userId: user.userId,
              userName: user.userName,
              role: user.role.split(","),
              channelJoined: user.channelJoined.split(","),
              loggedin: user.loggedin,
              banned: user.banned
            };
          }

          //ユーザー情報を返す
          resolve(datUserParsed);
          return;
        }
      });
    });

  } catch(e) {

    console.log("fetchUserAll :: エラー->", e);
    return null;

  }
}
