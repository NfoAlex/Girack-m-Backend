import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import type { IUserInfo, IUserInfoBeforeParsing } from "../../type/User";

/**
 * ユーザーを検索する
 * @param _userName 
 * @param _rule 
 * @param _channelId 
 * @returns 
 */
export default function searchUser(
  _userName: string,
  _rule: "FULL"|"PARTIAL",
  _channelId?: string
):IUserInfo[] {
  try {

    //チャンネルIdの指定があるかどうかでSQL文へ追加する文構成
    const stmtOptionChannel =
      _channelId!==undefined 
      ?
        ` AND channelJoined LIKE '%${_channelId}%'`
      :
        "";

  
    //検索用クエリー
    const searchQuery = 
      _rule==='PARTIAL'
      ?
        `%${_userName}%` //部分検索
      :
        _userName; //完全検索

    const users = db.prepare(
      `SELECT * FROM USERS_INFO WHERE userName LIKE ? ${stmtOptionChannel}`
    ).all(searchQuery) as IUserInfoBeforeParsing[];

    //パースしたユーザー情報配列
    const usersParsed:IUserInfo[] = []
    //パース処理
    for (const user of users) {
      usersParsed.push({
        ...user,
        channelJoined: user.channelJoined.split(","),
        threadJoined: user.threadJoined.split(","),
        role: user.role.split(","),
        banned: user.banned===1
      })
    }

    return usersParsed;

  } catch(e) {

    console.log("searchUser :: エラー->", e);
    return [];

  }
}
