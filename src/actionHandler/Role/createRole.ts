import Database from 'better-sqlite3';
const db = new Database('./records/ROLE.db');
db.pragma('journal_mode = WAL');

import type { IUserRole, IUserRoleBeforeParsing } from "../../type/User";

/**
 * ロールを作成する
 * @param _userId 
 * @param _roleDataCreating 
 * @returns 
 */
export default async function createRole(
  _userId: string,
  _roleDataCreating: {
    name: string,
    color: string
  }
):Promise<string|null> {
  try {

    //空いているロールIDを生成
    const roleIdNew = await getNewRoleId();
    //IDが空ならエラーとして処理を停止
    if (roleIdNew === "") {
      return null;
    }

    //ロールテーブルへ挿入
    db.prepare(
      `
      INSERT INTO ROLES (
        roleId,
        name,
        color
      )
      VALUES (?, ?, ?)
      `
    ).run(roleIdNew, _roleDataCreating.name, _roleDataCreating.color);

    return roleIdNew;

  } catch(e) {

    console.log("createRole :: エラー->", e);
    return null;

  }
}

/**
 * ロールIDの空きを探す
 * @returns string Idの空き
 */
async function getNewRoleId():Promise<string> {
  let tryCount = 0;

  return new Promise<string>((resolve) => {
    try {

      const checkLoop = setInterval(async () => {
        //生成するID
        let roleIdGen = "";
        //4桁分の数字追加してIDにする
        for (let i=0; i<4; i++) {
          roleIdGen += Math.trunc(Math.random() * 9); //乱数を追加
        }
    
        //そのIDのロールデータを取得してみる
        const datRole = db.prepare(
          "SELECT * FROM ROLES WHERE roleId=?"
        ).get(roleIdGen) as IUserRoleBeforeParsing | undefined;

        //console.log("createRole :: getNewRoleId : datRole->", datRole);
        
        //取得したロールデータが無効ならループ停止してIDを返す
        if (datRole === undefined) {
          clearInterval(checkLoop);
          resolve(roleIdGen); //IDを返す
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

      console.log("createRole :: getNewRoleId : エラー->", e);
      resolve("");

    }
  });
}
