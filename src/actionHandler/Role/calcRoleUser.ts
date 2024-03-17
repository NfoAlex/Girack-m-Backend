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

export default async function calcRoleUser(userId:string)
:Promise<number> {
  try {

    //権限をそれぞれ調べてレベルを返す
    if (await roleCheck(userId, "ServerManage")) {
      return 5;
    } else if (await roleCheck(userId, "RoleManage")) {
      return 4;
    } else if (
      await roleCheck(userId, "ChannelViewPrivate")
      ||
      await roleCheck(userId, "UserManage")
    ) {
      return 3;
    } else if (
      await roleCheck(userId, "ChannelRename")
      ||
      await roleCheck(userId, "MessageDelete")
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
