import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/MESSAGE.db");

/**
 * すべてのチャンネル履歴テーブルへisEditedカラムを追加
 */
export default async function migrationMessage20240709() {
  //チャンネル分のテーブルへisEditedカラムを追加
  db.all(
    `
    SELECT name FROM sqlite_master WHERE type='table';
    `,
    (err:Error, tables:[{name:string}]) => {
      //console.log("20240709 :: tables->", tables);

      //ループしてisEditedカラムを追加
      for (let channelName of tables) {
        db.run(`ALTER TABLE ` + channelName.name + ` ADD isEdited BOLEAN NOT NULL DEFAULT '0'`, (err:Error)=>{});
      }
      return;
    }
  );
}
