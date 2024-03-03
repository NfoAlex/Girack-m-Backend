//権限チェック
import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/ROLE.db");
import fetchUser from "../db/fetchUser";
import { IUserRole } from "../type/User";

//ロールのJSONデータをキーで参照できるように
type UserRoleKey = keyof IUserRole;

export async function roleCheck(userId:string, termChecking:UserRoleKey):Promise<boolean> {
  try {

    return new Promise(async (resolve) => {
      //ユーザーが持つ総合的な権限データ
      let userRolePower:IUserRole = {
        ServerManage: false,
        RoleManage: false,
        ChannelRename: false,
        ChannelViewPrivate: false,
        ChannelCreateAndDelete: false,
        UserManage: false,
        MessageDelete: false,
        MessageAttatchFile: false
      };
    
      //ユーザー情報を取得する
      const userInfo = await fetchUser(userId, null);
      //ユーザーがなければ取りやめ
      if (userInfo === null) {
        resolve(false);
        return;
      }

      //SQLでWHERE条件を指定するためのSQL文用変数
        //👇これを使ってロールIDに引っかかるROLEをすべて取得する
      let sqlContextWhereFull = "";
      //ロールの数分条件文追加
      for (let index in userInfo.role) {
        //追加するのが最後のロールIDかどうか
        const isLastRole:boolean = (userInfo.role.length-1)===parseInt(index);

        //SQLへ条件追加するこのロール用の文
        let sqlContextWhereSingle:string = "";
        //SQLへ条件追加する文を作成、最後ならANDをつけない
        if (isLastRole) {
          sqlContextWhereSingle = "roleId='" + userInfo.role[index] + "'";
        } else {
          sqlContextWhereSingle = "roleId='" + userInfo.role[index] + "' AND ";
        }

        sqlContextWhereFull += sqlContextWhereSingle;
      }

      console.log("SELECT * FROM ROLES WHERE " + sqlContextWhereFull);

      //ユーザーが持つロールの権限データをすべて取得する
      db.all("SELECT * FROM ROLES WHERE " + sqlContextWhereFull, (err:Error, datRoles:IUserRole[]) => {
        if (err) {
          console.log("roleCheck :: db : エラー->", err);
          resolve(false);
        } else {
          console.log("roleCheck :: db : 結果->", datRoles);
          //ロール分調べて権限が足りるか調べる
          for (let role of datRoles) {
            //権限の値がtrueなら「できる」と返す
            if (role[termChecking] === true) {
              resolve(true);
              return;
            }
          }
          //ループ抜けちゃったらできないと返す
          resolve(false);
          return;
        }
      });
    });

  } catch(e) {

    console.log("roleCheck :: エラー->", e);
    return false;

  }
}
