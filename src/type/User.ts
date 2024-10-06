//ユーザー基本情報
export interface IUserInfo {
  userId: string,
  userName: string,
  role: string[],
  channelJoined: string[],
  banned: boolean,
};

//SQLから抜き出した生のユーザー情報
export interface IUserInfoBeforeParsing {
  userId: string,
  userName: string,
  role: string,
  channelJoined: string,
  banned: 1|0
};

//ユーザーが持つ権限情報
export interface IUserRole {
  roleId: string,
  name: string,
  color: string,
  ServerManage: boolean,
  RoleManage: boolean,
  ChannelManage: boolean,
  UserManage: boolean,
  MessageDelete: boolean,
  MessageAttatchFile: boolean
}

//SQLから抜き出した生のロールデータ
export interface IUserRoleBeforeParsing {
  roleId: string,
  name: string,
  color: string,
  ServerManage: 1|0,
  RoleManage: 1|0,
  ChannelManage: 1|0,
  UserManage: 1|0,
  MessageDelete: 1|0,
  MessageAttatchFile: 1|0
}

//ユーザーのパスワード
export interface IUserPassword {
  userId: string,
  password: string,
  salt: string
}

//セッション情報
export interface IUserSession {
  userId: string,
  sessionId: string,
  sessionName: string,
  loggedinTime: Date,
  loggedinTimeFirst: Date
};

//設定情報
export interface IUserConfig {
  userId: string,
  notification: {
    notifyAllMessages: boolean,
    notifyMention: boolean
  },
  theme: "dark"|"light",
  channel: {
    displayRole: boolean,
    displayAttatchmentSizeLimit: number,
  },
  sidebar: {
    ReadAllButtonEnabled: boolean,
    ReadAllButtonByShiftKey: boolean
  }
}

//DBに保存される設定用文字列
export interface IUserConfigBeforeParsing {
  notification: string,
  theme: "dark"|"light",
  channel: string,
  sidebar: string
}

//Inbox用の文字列
export interface IUserInbox {
  "mention": {
    [key: string]: string[] //ここでのkeyはチャンネルId
  },
  "event": {
    [key: string]: string[] //ここでのkeyはチャンネルId
  }
}
