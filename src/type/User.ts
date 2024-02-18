//ユーザー基本情報
export interface IUserInfo {
  userId: string,
  name: string,
  role: string[],
  channelJoined: string[],
  loggedin: boolean,
  banned: boolean,
  pw: string
};

//他の人に共有する用のユーザー基本情報
export interface IUserInfoPublic {
  userId: string,
  name: string,
  role: string,
  loggedin: boolean,
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
