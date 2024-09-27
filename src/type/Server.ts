//インスタンス情報
export default interface IServerInfo {
  servername: string,
  registration: {
    available: boolean,
    invite: {
      inviteOnly: boolean,
      inviteCode: string|undefined,
    }
  },
  config: {
    PROFILE: {
      iconMaxSize: number,
      usernameMaxLength: number
    },
    CHANNEL: {
      channelIdAnnounceRegistration: string,
      defaultJoinOnRegister: string[],
    },
    MESSAGE: {
      TxtMaxLength: number
    },
    STORAGE: {
      StorageSizeLimit: number
    }
  }
};

export interface IAPIClientInfo {
  apiClientId: string,
  apiKey: string,
  clientName: string,
  description: string,
  latestUsedTime: string,
  createdUserId: string,
  isEnabled: boolean,
  approvedStatus: "WAITING" | "APPROVED" | "BANNED"
}

export interface IAPIClientInfoBeforeParsing {
  apiClientId: string,
  apiKey: string,
  clientName: string,
  description: string,
  latestUsedTime: string,
  createdUserId: string,
  isEnabled: 1 | 0,
  approvedStatus: "WAITING" | "APPROVED" | "BANNED"
}