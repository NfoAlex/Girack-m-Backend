import sqlite3 from "sqlite3";
import { IUserRole } from "../../type/User";
import fetchRoles from "./fetchRoles";
const db = new sqlite3.Database("./records/ROLE.db");

export default async function createRole(
  userId: string,
  roleDataCreating: IUserRole
):Promise<boolean> {
  try {

    // ToDo :: ロールの確認

    //空いているロールIDを生成
    const roleIdNew = await getNewRoleId();
    //IDが空ならエラーとして処理を停止
    if (roleIdNew === "") {
      return false;
    }

    //書き込み結果を待ってそれを返す
    return new Promise((resolve) => {
      //テーブルへデータ挿入
      db.run(`
        INSERT INTO ROLES (
          roleId,
          name,
          ServerManage,
          RoleManage,
          ChannelRename,
          ChannelViewPrivate,
          ChannelCreateAndDelete,
          UserManage,
          MessageDelete,
          MessageAttatchFile
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          roleIdNew, //生成したロールID
          roleDataCreating.name, //名前
          roleDataCreating.ServerManage, //その他権限...
          roleDataCreating.RoleManage,
          roleDataCreating.ChannelRename,
          roleDataCreating.ChannelViewPrivate,
          roleDataCreating.ChannelCreateAndDelete,
          roleDataCreating.UserManage,
          roleDataCreating.MessageDelete,
          roleDataCreating.MessageAttatchFile
        ],
        (err) => {
          if (err) {
            resolve(false);
            return;
          } else {
            resolve(true);
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("createRole :: エラー->", e);
    return false;

  }
}

//チャンネルIDの空きを探す
async function getNewRoleId():Promise<string> {
  let tryCount:number = 0;

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
        const datRole = await new Promise((resolve) => {
          db.all(
            "SELECT * FROM ROLES WHERE roleId=?",
            roleIdGen,
            (err, roleDat:IUserRole[]) => {
              resolve(roleDat[0]);
            }
          )
        });
        console.log("createRole :: getNewRoleId : datRole->", datRole);
        
        //取得したロールデータの長さが0ならループ停止してIDを返す
        if (datRole === null) {
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
