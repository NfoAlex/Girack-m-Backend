import fetchUser from "../actionHandler/User/fetchUser";
import type { IUserRole } from "../type/User";

import Database from 'better-sqlite3';
const db = new Database('./records/ROLE.db');
db.pragma('journal_mode = WAL');

//ロールのJSONデータをキーで参照できるように
type UserRoleKey = keyof IUserRole;

/**
 * 指定のユーザーIdが指定項目の権限を持っているかどうか調べる
 * @param _userId 調べるユーザーId
 * @param _termChecking 調べるロール内の権限
 * @returns 
 */
export default function roleCheck(_userId:string, _termChecking:UserRoleKey):boolean {
  try {

    //SYSTEMならtrue
    if (_userId === "SYSTEM") {
      return true;
    }

    //ユーザー情報を取得する
    const userInfo = fetchUser(_userId, null);
    //ユーザーがなければ取りやめ
    if (userInfo === null) {
      return false
    }

    //SQLでWHERE条件を指定するためのSQL文用変数
    //👇このSQL文を使ってロールIDに引っかかるROLEをすべて取得する
    let sqlContextWhereFull = "";
    //ロールの数分条件文追加
    for (const index in userInfo.role) {
      //追加するのが最後のロールIDかどうか
      const isLastRole:boolean = (userInfo.role.length-1)===Number.parseInt(index);

      //SQLへ条件追加するこのロール用の文
      let sqlContextWhereSingle = "";
      //SQLへ条件追加する文を作成、最後ならANDをつけない
      if (isLastRole) {
        sqlContextWhereSingle = `roleId='${userInfo.role[index]}'`;
      } else {
        sqlContextWhereSingle = `roleId='${userInfo.role[index]}' OR `;
      }

      sqlContextWhereFull += sqlContextWhereSingle;
    }

    //ロールデータを取得するSQL処理
    const stmtRoles = db.prepare(`SELECT * FROM ROLES WHERE ${sqlContextWhereFull}`);
    //データ取得をループする処理
    const iterateRoles = stmtRoles.iterate() as Iterable<IUserRole>;

    //ループでロールの該当権限が有効かどうか調べる
    for (const role of iterateRoles) {
      if (role[_termChecking]) {
        return true;
      }
    }

    return false;

  } catch(e) {

    console.log("roleCheck :: エラー->", e);
    return false;

  }
}
