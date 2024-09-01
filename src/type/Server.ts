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
  clientName: string,
  description: string,
  latestUsedTime: string,
  createdBy: string,
  isEnabled: boolean,
  approvedStatus: "WAITING" | "APPROVED" | "BANNED"
}

export interface IAPIClientInfoBeforeParsing {
  apiClientId: string,
  clientName: string,
  description: string,
  latestUsedTime: string,
  createdBy: string,
  isEnabled: 1 | 0,
  approvedStatus: "WAITING" | "APPROVED" | "BANNED"
}