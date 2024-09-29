export interface IChannelbeforeParsing {
  channelId: string,
  channelName: string,
  description: string,
  createdBy: string,
  isPrivate: 0|1,
  speakableRole: string
}

export interface IChannel {
  channelId: string,
  channelName: string,
  description: string,
  createdBy: string,
  isPrivate: boolean,
  speakableRole: string[]
}

export interface IThreadbeforeParsing {
  threadId: string,
  threadName: string,
  createdBy: string,
  speakableRole: string,
  parentChannelId: string,
  parentMessageId: string
}

export interface IThread {
  threadId: string,
  threadName: string,
  createdBy: string,
  speakableRole: string[],
  parentChannelId: string,
  parentMessageId: string
}


export interface IChannelOrder {
  channelId: string,
  isThread: boolean,
  isFolder: boolean,
  child?: []
}
