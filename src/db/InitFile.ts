import Database from 'better-sqlite3';
const db = new Database('./records/FILEINDEX.db');
db.pragma('journal_mode = WAL');

db.exec(
  `
  create table if not exists FOLDERS (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TXT NOT NULL,
    positionedDirectoryId TEXT NOT NULL
  )
  `
);

//ユーザーIdのインデックス作成するように
db.exec(
  `create index if not exists idx_userId on FOLDERS(userId)`
);

console.log("initFile :: ファイルインデックス用DB作成完了");

db.close();
