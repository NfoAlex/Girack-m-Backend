import Database from 'better-sqlite3';
const db = new Database('./records/ROLE.db');
db.pragma('journal_mode = WAL');

//ロール情報を保存するROLESテーブルを無ければ作成
db.exec(
  `
  create table if not exists ROLES(
    roleId TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#ffffff',
    ServerManage BOOLEAN NOT NULL DEFAULT '0',
    RoleManage BOOLEAN NOT NULL DEFAULT '0',
    ChannelManage BOOLEAN NOT NULL DEFAULT '0',
    UserManage BOOLEAN NOT NULL DEFAULT '0',
    MessageDelete BOOLEAN NOT NULL DEFAULT '0',
    MessageAttatchFile BOOLEAN NOT NULL DEFAULT '0',
    APIUse BOOLEAN NOT NULL DEFAULT '0'
  )
  `
);

//無かったらMEMBERロールを挿入する
db.prepare(`
  INSERT INTO ROLES (
    roleId,
    name
  )
  VALUES (?, ?)
  ON CONFLICT(roleId) DO NOTHING;
  `
).run("MEMBER","Member");

//無かったらHOSTロールを挿入する
db.prepare(`
  INSERT INTO ROLES (
    roleId,
    name,
    color,
    ServerManage,
    RoleManage,
    ChannelManage,
    UserManage,
    MessageDelete,
    MessageAttatchFile,
    APIUse
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(roleId) DO NOTHING;
  `
).run(
  "HOST",
  "Host",
  "#7E097E",
  1,
  1,
  1,
  1,
  1,
  1,
  1
);

console.log("InitRole :: ロールDB作成完了");
db.close();
