import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/ROLE.db");

export default async function deleteRole(roleId:string) {
  try {

    return new Promise((resolve) => {
      db.run("DELETE FROM ROLES WHERE roleId=?", roleId, (err) => {
        if (err) {
          resolve(false);
          return;
        } else {
          resolve(true);
          return;
        }
      });
    });

  } catch(e) {

    console.log("deleteRole :: エラー->", e);
    return false;

  }
}
