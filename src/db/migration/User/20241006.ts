import Database from 'better-sqlite3';
import * as crypto from "node:crypto";
import type { IUserPassword } from '../../../type/User';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

/**
 * USERS_PASSWORDへsaltカラム追加して全ユーザーのパスワードをハッシュ化
 */
export default function migration20241006() {
  //カラム名を取得する構文
  const stmt = db.prepare("PRAGMA table_info(USERS_PASSWORD)");
  const columns = stmt.all() as {
    cdi: number,
    name: string,
    type: string,
    notnull: number,
    dflt_value: string|null,
    pk: number
  }[];

  //console.log("20241006(user) :: columns->", columns);

  //すでにsaltカラムがあるなら停止
  for (const c of columns) {
    if (c.name === "salt") {
      return;
    }
  }

  //saltテーブル作成
  db.prepare(
    `ALTER TABLE USERS_PASSWORD ADD salt TEXT DEFAULT ''`
  ).run();

  //全パスワードデータを配列で取得
  const passDatas = db.prepare(
    "SELECT * FROM USERS_PASSWORD"
  ).all() as IUserPassword[] | undefined;

  //console.log("20241006(user) :: passDatas->", passDatas);

  //もし取れなかったらスルー
  if (passDatas === undefined) return;

  //ユーザー数分ループしてパスワードをハッシュする
  for (const pass of passDatas) {
    //ソルト
    const salt = crypto.randomBytes(16).toString('hex');
    //ソルトを加える
    const saltedPassword = pass.password + salt;
    //パスワードをハッシュ
    const hashedPassword = crypto.createHash('sha256').update(saltedPassword).digest('hex');

    //パスワードをハッシュしたものに書き換え
    db.prepare(
      "UPDATE USERS_PASSWORD SET password=?,salt=? WHERE userId=?"
    ).run(hashedPassword, salt, pass.userId);
  }

}
