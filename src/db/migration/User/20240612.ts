import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

/**
 * USERS_SAVEへinboxカラム追加
 */
export default async function migration20240612() {
  db.all(
    `
    ALTER TABLE USERS_SAVES ADD inbox TEXT DEFAULT '{ "mention": {}, "event": {} }';
    `,
    (err:Error, tables:[{name:string}]) => {
      if (err) {
        console.log("migration(20240612) :: エラー!->", err);
      }
      return;
    }
  );
}
