/*
                   _ooOoo_
                  o8888888o
                  88" . "88
                  (| -_- |)
                  O\  =  /O
               ____/`---'\____
             .'  \\|     |//  `.
            /  \\|||  :  |||//  \
           /  _||||| -:- |||||-  \
           |   | \\\  -  /// |   |
           | \_|  ''\---/''  |   |
           \  .-\__  `-`  ___/-. /
         ___`. .'  /--.--\  `. . __
      ."" '<  `.___\_<|>_/___.'  >'"".
     | | :  `- \`.;`\ _ /`;.`/ - ` : | |
     \  \ `-.   \_ __\ /__ _/   .-` /  /
======`-.____`-.___\_____/___.-`____.-'======
                   `=---='
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            佛祖保佑       永无BUG
*/

const { GUI, selectGUI } = require("./BetterChat/modules/gui");
const { getConfigData, getPlayerData, updatePlayerData, apiParsing } = require("./BetterChat/modules/data");
const event = require("./BetterChat/modules/event");
const Prefix = getConfigData('config', "Prefix");
const { PAPI } = require(`./GMLIB-LegacyRemoteCallApi/lib/BEPlaceholderAPI-JS.js`);


mc.listen("onServerStarted", () => {
    const BetterChat = mc.newCommand("betterchat", "更好的聊天插件", PermType.Any);
    BetterChat.setAlias('bchat'); // 指令别名

    BetterChat.mandatory('player', ParamType.Player);
    BetterChat.optional('string', ParamType.String);

    BetterChat.setEnum('rename', ['rename']);
    BetterChat.mandatory('rename', ParamType.Enum, 'rename', 1);
    BetterChat.overload(['rename', 'player', 'string']);

    BetterChat.setEnum('setitle', ['setitle']);
    BetterChat.mandatory('setitle', ParamType.Enum, 'setitle', 1);
    BetterChat.overload(['setitle', 'player', 'string']);

    BetterChat.setEnum('cmd', ['gui', 'format', 'bubbles']);
    BetterChat.mandatory('cmd', ParamType.Enum, 'cmd', 1);
    BetterChat.overload(['cmd']);

    BetterChat.setCallback((_cmd, ori, out, res) => {
        const Player = ori.player; // 玩家对象

        if (res.cmd == "gui") {
            return Player ? GUI(Player) : out.error("控制台无法使用菜单");
        } else if (res.cmd == "format") {
            return Player ? selectGUI(Player, true) : out.error("控制台无法使用菜单");
        } else if (res.cmd == "bubbles") {
            return Player ? selectGUI(Player, false) : out.error("控制台无法使用菜单");
        }
        
        const resPlayer = res.player[0]; // 被操作的玩家对象
        const contents = res.string; // 回调的输入内容
        const playerObj = getPlayerData(resPlayer.realName); // 获取玩家数据对象

        if (res.rename == "rename") {
            if (!Player.isOP() && resPlayer.realName != Player.realName) return out.error(Prefix + "你没有权限更改他人的昵称"); //判断是否为OP
            updatePlayerData(resPlayer.realName, contents, playerObj.title, "", 0, playerObj.chat_bubbles, playerObj.chat_format);
            Player.tell(Prefix + resPlayer.realName + "的昵称已修改为: " + contents);
        }

        if (res.setitle == "setitle") {
            if (!Player.isOP()) return Player.tell(Prefix + "你没有权限设置称号"); //判断是否为OP
            updatePlayerData(resPlayer.realName, playerObj.nick, contents, "", 0, playerObj.chat_bubbles, playerObj.chat_format);
            mc.broadcast(`${Prefix} "恭喜玩家" ${resPlayer.realName} "获得" ${contents} 称号`);
        }

    })

    BetterChat.setup();
});

// 导出 updataPlayerData , getPlayerData , GUI 函数
ll.exports(updatePlayerData,'BetterChat_updataPlayersData','updata_BetterChat_PlayersData');
ll.exports(getPlayerData,'BetterChat_getPlayerData','get_BetterChat_PlayerData');
ll.exports(GUI,'BetterChat_mainGUI','BetterChat_mainGUI');
ll.exports(apiParsing,'BetterChat_apiParsing','BetterChat_apiParsing');