import sqlite3 from "sqlite3";
import { IUserRole } from "../../type/User";
const db = new sqlite3.Database("./records/ROLE.db");

export default function fetchRoles():Promise<IUserRole[]|null>|null {
  try {

    return new Promise((resolve) => {
      //ロールデータをすべて取得
      db.run("SELECT * FROM ROLES", (err:Error, roleData:IUserRole[]) => {
        if (err) {
          resolve(null);
          return;
        } else {
          resolve(roleData);
          return;
        }
      });
    });

  } catch(e) {

    console.log("fetchRoles :: エラー->", e);
    return null;

  }
}
