import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/MESSAGE.db");

/**
 * すべてのチャンネル履歴テーブルへlinkDataカラムを追加
 */
export default async function migration20240603() {
  //チャンネル分のテーブルへlinkDataカラムを追加
  db.all(
    `
    SELECT name FROM sqlite_master WHERE type='table';
    `,
    (err:Error, tables:[{name:string}]) => {
      //console.log("20240603 :: tables->", tables);

      //ループしてlinkDataカラムを追加
      for (let channelName of tables) {
        db.run(`ALTER TABLE ` + channelName.name + ` ADD linkData TEXT`, (err:Error)=>{});
      }
      return;
    }
  );
}
