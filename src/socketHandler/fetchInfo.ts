import { Socket, Server } from "socket.io";
import { ServerInfo } from "../db/InitServer";
import IServerInfo from "../type/Server";

module.exports = (io:Server) => {
  io.on("connection", (socket:Socket) => {

    //基本インスタンス情報(招待コードなど省く)を取得
    socket.on("fetchServerInfoLimited", ():{
      result: string,
      data: IServerInfo
    } => {
      //転送するインスタンス情報を削るためにクローンする
      const ServerInfoLimited:IServerInfo = structuredClone(ServerInfo);
      //招待コードを削除
      delete ServerInfoLimited.registration.invite.inviteCode;

      //返す
      return { result:"SUCCESS", data:ServerInfoLimited }
    });

    //全てのインスタンス情報を取得
    socket.on("fetchServerInfoFull", ():{
      result: string,
      data: IServerInfo
    } => {
      return { result:"SUCCESS", data:ServerInfo };
    });

  });
}