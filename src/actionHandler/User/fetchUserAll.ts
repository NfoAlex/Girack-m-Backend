import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import type { IUserInfo, IUserInfoBeforeParsing } from "../../type/User";

/**
 * 複数ユーザーの情報を取得(30人単位)
 * @param _indexPage 
 * @returns 
 */
export default function fetchUserAll(_indexPage:number)
:{
  datUser: {
    [key: string]: IUserInfo;
  } | null;
  countUser: number;
} | null
{
  try {

    //ユーザーを取得し始める位置(1ページ30人)
    const indexStarting:number = 30 * (_indexPage - 1);

    //ユーザー数計算
    const usersNumRaw = db.prepare("SELECT count(*) FROM USERS_INFO").get() as {"count(*)":number};
    const userNum = usersNumRaw["count(*)"];

    //ユーザー情報を取得
    const userInfos = db.prepare(
      "SELECT * FROM USERS_INFO LIMIT 30 OFFSET ?"
    ).all(indexStarting) as IUserInfoBeforeParsing[];

    //パースしたユーザー情報を入れるJSON
    const userInfosParsed:{
      [key: string]: IUserInfo
    } = {};

    //ユーザーの数だけループしてパース
    for (const user of userInfos) {
      //JSONへ格納
      userInfosParsed[user.userId] = {
        userId: user.userId,
        userName: user.userName,
        role: user.role.split(","),
        channelJoined: user.channelJoined.split(","),
        banned: user.banned === 1
      };
    }

    return {datUser: userInfosParsed, countUser: userNum};

  } catch(e) {

    console.log("fetchUserAll :: エラー->", e);
    return null;

  }
}
