import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

import Database from 'better-sqlite3';
const _db = new Database('./records/USER.db', {verbose: console.log });
_db.pragma('journal_mode = WAL');

import type { IUserSession } from "../../type/User";

/**
 * 指定したユーザーのセッションデータを取得
 * @param _userId 
 * @param _indexNumber 
 * @returns 
 */
export default function fetchSession(_userId: string, _indexNumber: number)
:IUserSession[] | null {
  try {

    //オフセットでずらすデータ数
    const offsetNum = 10 * (_indexNumber-1 || 0);

    const sessionData = _db.prepare(
      "SELECT * FROM USERS_SESSION WHERE userId=? LIMIT 10 OFFSET ?"
    ).all(_userId, offsetNum) as IUserSession[];

    return sessionData;

  } catch(e) {

    console.log("fetchSession :: エラー->", e);
    return null;

  }
}