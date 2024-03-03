//ユーザー基本情報
export interface IUserInfo {
  userId: string,
  userName: string,
  role: string[],
  channelJoined: string[],
  loggedin: boolean,
  banned: boolean,
};

//ユーザーのパスワード
export interface IUserPassword {
  userId: string,
  password:string
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
    enabled: boolean,
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
