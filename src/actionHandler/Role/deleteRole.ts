import Database from 'better-sqlite3';
const db = new Database('./records/ROLE.db');
db.pragma('journal_mode = WAL');

/**
 * ロールを削除
 * @param roleId 
 * @returns 
 */
export default function deleteRole(roleId:string) {
  try {

    //ロールを削除
    db.prepare("DELETE FROM ROLES WHERE roleId=?").run(roleId);

  } catch(e) {

    console.log("deleteRole :: エラー->", e);
    return false;

  }
}
