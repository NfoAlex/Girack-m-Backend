import roleCheck from "../../util/roleCheck";

/*
//権限それぞれの持つレベル(数値)
const roleLevel:{
  [key:string]: number
} = {
  ServerManage: 5,
  RoleManage: 4,
  ChannelRename: 2,
  ChannelViewPrivate: 3,
  ChannelCreateAndDelete: 2,
  UserManage: 3,
  MessageDelete: 2,
  MessageAttatchFile: 1
};
*/

export default function calcRoleUser(userId:string)
:number {
  try {

    //権限をそれぞれ調べてレベルを返す
    if (roleCheck(userId, "ServerManage")) {
      return 5;
    }
    
    if (roleCheck(userId, "RoleManage")) {
      return 4;
    }
    
    if (
      roleCheck(userId, "ChannelManage")
      ||
      roleCheck(userId, "UserManage")
    ) {
      return 3;
    }
    
    if (
      roleCheck(userId, "MessageDelete")
    ) {
      return 2;
    }

    //2以下はもう1として返す
    return 1;

  } catch(e) {

    console.log("calcRole :: エラー ->", e);
    return 0;

  }
}
