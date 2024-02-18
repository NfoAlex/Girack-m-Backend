//ユーザー基本情報
export interface IUserInfo {
  userId: string,
  name: string,
  role: string,
  loggedin: string,
  banned: boolean,
  pw: string
};

//他の人に共有する用のユーザー基本情報
export interface IUserInfoPublic {
  userId: string,
  name: string,
  role: string,
  loggedin: string,
  banned: boolean,
};


//セッション情報
export interface IUserSession {
  userId: string,
  sessionId: string,
  name: string,
  loggedinTime: Date,
  loggedinTimeFirst: Date
};

//チャンネル参加情報
export interface IUserChannel {
  userId: string,
  channelIds: string[],
};
