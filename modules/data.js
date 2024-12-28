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

const Info = new JsonConfigFile("./plugins/BetterChat/data/Data.json");
Info.init("data", []);
const conf = new JsonConfigFile("./plugins/BetterChat/config.json");
const config = conf.init("config", {});
const api = conf.init("api", {});
const forbiddenWords = conf.init("forbiddenWords", []);
const { PAPI } = require(`../../GMLIB-LegacyRemoteCallApi/lib/BEPlaceholderAPI-JS.js`);

/**
 * 获取配置数据
 * 如果配置数据不存在，则返回 null
 * @param {string} key - 要搜索的配置数据的键
 * @returns {Object|null} - 找到的配置数据对象，如果未找到则返回 null
 */
function getConfigData(type, key) {
    switch (type) {
        case "config":
            return config[`${key}`] || null; // 返回配置数据对象
        case "api":
            return api; // 返回api对象
        case "forbiddenWords":
            return forbiddenWords; // 返回违禁词数组
        default:
            return null; // 返回 null
    }
}

/**
 * 更新或添加玩家数据到存储中
 * 如果玩家已经存在，则更新其数据；如果不存在，则添加新的玩家数据
 * @param {string} name - 玩家的真实姓名
 * @param {string} nick - 玩家自定义的昵称
 * @param {string} title - 玩家的称号
 * @param {string} message - 玩家的消息
 * @param {number} time - 气泡持续时间（秒）
 * @param {string} chat_format - 聊天消息格式
 * @param {string} chat_bubbles - 聊天头顶气泡的格式
 * @returns {void} - 该函数用于修改玩家数据文件 不返回任何值
 */
function updatePlayerData(name, nick, title, message, time,chat_bubbles, chat_format) {
    let data = Info.get("data") || [];

    const existingIndex = data.findIndex(player => player.name === name); // 查找玩家 返回其在数组中的索引 如果找不到该玩家 则返回 -1

    if (existingIndex !== -1) {
        data[existingIndex] = { ...data[existingIndex], nick, title, message, time, chat_format, chat_bubbles }; // 更新现有玩家数据
    } else data.push({ name, nick, title, message, time, chat_format, chat_bubbles }); // 添加新玩家数据

    Info.set("data", data); // 写入文件
}

/**
 * 获取指定名称的玩家数据
 * 如果未找到匹配的名称，则返回 null
 * @param {string} name - 要搜索的玩家名称
 * @returns {Object|null} - 找到的玩家数据对象，如果未找到则返回 null
 */
function getPlayerData(name) {
    let data = Info.get("data") || [];
    // 使用 find 方法查找匹配的玩家数据并返回
    return data.find(p => p.name === name);
}

/**
 * 转义正则表达式中的特殊字符
 * 
 * @param {string} string - 要转义的字符串
 * @returns {string} - 转义后的字符串
 */
function escapeRegExp(string) { return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/**
 * 解析API字符串
 * 
 * @param {string} str - 要解析的字符串
 * @param {Object} player - 玩家对象
 * @returns {string} - 解析后的字符串
 */
function apiParsing(str, player) {
    str = PAPI.translateString(str, player); // 使用 PAPI 解析字符串

    str = replacePlaceholders(str, player); // 解析玩家变量

    for (const key in getConfigData('api')) { // 遍历 api 配置数据中的键
        str = str.replace(new RegExp(escapeRegExp(key), 'g'), getConfigData('api')[key]); // 解析字符串中的键并替换为对应的值
    }

    return str; // 返回解析后的字符串
}

/**
 * 替换字符串中的占位符
 * 
 * @param {string} str - 要替换占位符的字符串
 * @param {Object} player - 玩家对象
 * @returns {string} - 替换占位符后的字符串
 */
function replacePlaceholders(str, player) {
    return str.replace(/{(\w+)}/g, (_match, path) => { // 使用正则表达式匹配字符串中的占位符
        try {
            let ValueFromPath = getValueFromPath(player, path.split('_'));
            return ValueFromPath === undefined ? str : ValueFromPath;
        } catch (error) {
            return str; // 如果发生错误，返回原始字符串
        }
    });
}

/**
 * 根据路径从对象中获取值
 * 
 * @param {Object} object - 要搜索的对象
 * @param {Array} path - 路径数组，指示在对象中查找值的位置
 * @returns {string} - 找到的值，如果未找到则返回 undefined
 */
function getValueFromPath(object, path) {
    for (let i = 0; i < path.length; i++) {  // 根据路径循环查找数据
        object = object[path[i]]; // 用对象的[]方法查找数据
    }

    return object; // 返回查找结果
}

/**
 * 获取所有玩家的列表
 * 该函数从存储的数据中检索所有玩家的名称，并将它们作为数组返回
 * @returns {Array<string>} 包含所有玩家名称的数组
 */
function getPlayerList() {
    const playerList = [];
    const data = Info.get("data") || [];
    for (let i in data) {
        playerList.push(data[i].name);
    }
    return playerList;
}

setInterval(() => {
    const players = mc.getOnlinePlayers(); // 获取在线玩家对象数组
    players.forEach(player => { // 遍历玩家对象数组
        if (player.isSimulatedPlayer()) return; // 忽略模拟玩家
        
        let playerObj = getPlayerData(player.realName); // 获取玩家数据对象
        let displayName = playerObj.chat_bubbles // 使用 replace 方法替换字符串中的占位符
            .replace(/\{player_name}/g, `${playerObj.nick}§r`)
            .replace(/\{player_msg}/g, playerObj.message)
            .replace(/\{player_titles}/g, playerObj.title ? `[${playerObj.title}§r] ` : "");

        displayName = apiParsing(displayName, player); // 解析API字符串

        if (playerObj.time === 0) {
            player.rename(displayName); // 复原玩家名称
        } else {
            updatePlayerData(player.realName, playerObj.nick, playerObj.title, playerObj.message, playerObj.time - 1, playerObj.chat_bubbles, playerObj.chat_format); // 减少时间
            player.rename(`${playerObj.message}\n${displayName}`); // 设置头顶聊天气泡
        }
    });
}, 1000);

module.exports = {
    getConfigData,
    updatePlayerData,
    getPlayerData,
    apiParsing,
    getPlayerList,
    Info
}

