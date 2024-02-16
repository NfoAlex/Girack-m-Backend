//ユーザー基本情報
export interface IUserInfo {
  userId: string,
  name: string,
  role: string,
  loggedin: string,
  banned: boolean,
  pw: string
};

//セッション情報
export interface IUserSession {
  userId: string,
  name: string,
  loggedinTime: Date,
  loggedinTimeFirst: Date
};

//チャンネル参加情報
export interface IUserChannel {
  userId: string,
  channelIds: string[],
};