const fs = require('fs')
const { stringToRole } = require('../utils/parsers')
const xlg = require('../xlogger')
const checkAccess = require('../utils/checkaccess')

module.exports = {
    name: 'remove',
    description: 'remove a helper role from a channel',
    async execute(client, message, args) {
        // check for perms
        if (!(await checkAccess(message))) return;
        // if no args, send detailed help (args not required)
        if (args.length < 2) {
            return message.channel.send({
                embed: {
                    color: 37809,
                    description: `__**Ping Assist: Remove Helper Role**__\nUse \` remove <role id> <shortcut name> \` in the channel the helper role is registered in.`
                }
            }).catch(xlg.error);
        }
        // check for bot perms
        if (!message.channel.permissionsFor(message.guild.me).has(["MANAGE_ROLES", "READ_MESSAGE_HISTORY", "MANAGE_MESSAGES", "VIEW_CHANNEL", "SEND_MESSAGES"]) || !message.channel.manageable) {
            return message.channel.send({
                embed: {
                    color: 16711680,
                    description: `This bot is lacking the required permissions.`
                }
            }).catch(xlg.error);
        }
        // check for roles
        if (!stringToRole(message.guild, args[0], false, false)) return message.channel.send({
            embed: {
                color: 16711680,
                description: `${message.member}, that is an invalid role. :(`
            }
        }).catch(xlg.error);
        //let roleTarget = stringToRole(message.guild, args[0], false, false);
        args.shift();
        // check for channel
        var hm = require('../helpermaps.json');

        if (!hm[message.channel.id]) {
            return message.channel.send({
                embed: {
                    color: 16711680,
                    description: `there is no existing role configuration for this channel`
                }
            }).catch(xlg.error);
        }
        if (hm[message.channel.id][args.join(" ")]) {
            delete hm[message.channel.id][args.join(" ")];
            message.channel.send({
                embed: {
                    color: 37809,
                    description: `entry with \` ${message.channel.id}:${args.join(" ").replace(/[`]+/, "\\`")} \` was removed`
                }
            }).catch(xlg.error);
        } else {
            return message.channel.send({
                embed: {
                    color: 16750899,
                    description: `that role is not currently mapped`
                }
            }).catch(xlg.error);
        }

        fs.writeFile('./helpermaps.json', JSON.stringify(hm, null, 2), function (err) {
            if (err) {
                xlg.error(err)
                return message.channel.send({
                    embed: {
                        color: 16711680,
                        description: `error while applying PingHelper updates`
                    }
                }).catch(xlg.error);
            }
        });
    }
}