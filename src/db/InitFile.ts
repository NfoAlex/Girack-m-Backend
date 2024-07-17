import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/FILEINDEX.db");

db.serialize(() => {
  //ファイルインデックス用のフォルダ用ホルダー作成
  db.run(`create table if exists FOLDER_LISTING(
    userId TEXT PRIMARY KEY,
    folder TEXT NOT NULL
  )`);

  console.log("initFile :: db : ファイルインデックス用DB作成完了");
});

db.close();
