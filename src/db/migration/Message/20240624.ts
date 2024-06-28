import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/MESSAGE.db");

/**
 * すべてのチャンネル履歴テーブルへreplyDataカラムを追加
 */
export default async function migrationMessage20240624() {
  //チャンネル分のテーブルへreplyDataカラムを追加
  db.all(
    `
    SELECT name FROM sqlite_master WHERE type='table';
    `,
    (err:Error, tables:[{name:string}]) => {
      //console.log("20240624 :: tables->", tables);

      //ループしてlinkDataカラムを追加
      for (let channelName of tables) {
        db.run(
          `ALTER TABLE ` + channelName.name + ` ADD replyData TEXT DEFAULT '{}'`, 
          (err:Error)=>{/* エラーなら（すでにあるなら）何もしない */}
        );
      }
      return;
    }
  );
}
