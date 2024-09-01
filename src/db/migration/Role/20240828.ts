import Database from 'better-sqlite3';
const db = new Database('./records/ROLE.db');
db.pragma('journal_mode = WAL');

/**
 * ROLESテーブルへAPIUseカラム追加
 */
export default function migrationRole20240612() {
  //かぶり防止のためのtry/catch
  try {
    db.prepare(
      "ALTER TABLE ROLES ADD APIUse BOOLEAN DEFAULT '0'"
    ).run();

    //HOSTは1(有効)に設定
    db.prepare(
      "UPDATE ROLES SET APIUse='1' WHERE roleId='HOST'"
    ).run();
  } catch(e) {}
}
