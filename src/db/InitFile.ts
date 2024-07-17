import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/FILEINDEX.db");

db.serialize(() => {
  //フォルダー構成用のテーブル作成
  db.run(
    `
    create table if not exists FOLDERS (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TXT NOT NULL,
      positionedDicretory TEXT NOT NULL
    )
    `,
    (err:Error) => {
      if (err) {
        console.log("InitFile :: db->", err);
      }
    }
  );

  console.log("initFile :: db : ファイルインデックス用DB作成完了");
});

db.close();
