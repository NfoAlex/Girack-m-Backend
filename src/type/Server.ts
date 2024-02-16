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
      TxtMaxLength: number,
      FileMaxSize: number
    }
  }
};