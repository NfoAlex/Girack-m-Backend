import Database from 'better-sqlite3';
const db = new Database('./records/MESSAGE.db');
db.pragma('journal_mode = WAL');

/**
 * すべてのチャンネル履歴テーブルへisSystemMessageカラムを追加
 */
export default function migrationMessage20240822() {
  //チャンネル分のテーブル取得
  const tableChannels = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table'"
  ).all() as {name:string}[];

  //ループして履歴テーブル全部にisSystemMessage列を追加
  for (const channelName of tableChannels) {
    //被りエラー防止のためのtry/catch
    try {
      db.prepare(
        `ALTER TABLE ${channelName.name} ADD isSystemMessage BOOLEAN NOT NULL DEFAULT '0'`
      ).run();
    } catch(e) {}
  }
  
  db.close();
}

