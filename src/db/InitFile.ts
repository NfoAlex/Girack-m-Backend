import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/FILEINDEX.db");

db.serialize(() => {
  //ファイルインデックス用のテーブル作成
  //...

  console.log("initFile :: db : ファイルインデックス用DB作成完了");
});

db.close();
