//ユーザー基本情報
export interface IUserInfo {
  userId: string,
  userName: string,
  role: string[],
  channelJoined: string[],
  loggedin: boolean,
  banned: boolean,
  password: string
};

//他の人に共有する用のユーザー基本情報
export interface IUserInfoPublic {
  userId: string,
  userName: string,
  role: string,
  channelJoined: string[],
  loggedin: boolean,
  banned: boolean,
};

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
