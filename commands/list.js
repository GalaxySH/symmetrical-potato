const xlg = require('../xlogger')
const checkAccess = require('../utils/checkaccess')

module.exports = {
    name: 'list',
    description: 'add a helper role to a channel',
    async execute(client, message, args) {
        // check for perms
        if (!(await checkAccess(message))) return;
        // if no args, send detailed help (args not required)
        /*if (args.length < 2) {
            return message.channel.send({
                embed: {
                    color: 37809,
                    description: `__**Ping Assist: List Helper Roles**__\nUse \` list \` in the channel you wish to see the roles listed for.`
                }
            }).catch(xlg.error);
        }*/
        // check for bot perms
        if (!message.channel.permissionsFor(message.guild.me).has(["READ_MESSAGE_HISTORY", "VIEW_CHANNEL", "SEND_MESSAGES"]) || !message.channel.manageable) {
            return message.channel.send({
                embed: {
                    color: 16711680,
                    description: `this bot is lacking the required permissions`
                }
            }).catch(xlg.error);
        }
        args.shift();
        // check for channel
        var hm = require('../helpermaps.json');

        if (hm[message.channel.id] && Object.keys(hm[message.channel.id]).length > 0) {
            let helpKeys = Object.keys(hm[message.channel.id]);
            let helpList = Object.values(hm[message.channel.id]).map((r, i) => {
                return `${helpKeys[i]} -> ${message.guild.roles.cache.get(r) || "**no-role**"}`
            });
            return message.channel.send({
                embed: {
                    color: 37809,
                    description: `${helpList.join("\n")}`
                }
            }).catch(xlg.error);
        } else {
            return message.channel.send({
                embed: {
                    color: 16750899,
                    description: `__**Ping Assist: List Helper Roles**__\nUse \` list \` in the channel you wish to see the roles listed for.\n\n> **there are no helper roles for this channel**`
                }
            }).catch(xlg.error);            
        }
    }
}