//ユーザー基本情報
export interface UserInfo {
  userId: string,
  name: string,
  role: string,
  loggedin: string,
  banned: boolean,
  pw: string
};

//セッション情報
export interface UserSession {
  userId: string,
  name: string,
  loggedinTime: Date,
  loggedinTimeFirst: Date
};

//チャンネル参加情報
export interface UserChannel {
  userId: string,
  channelIds: string[],
};