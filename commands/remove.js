const fs = require('fs');
const { stringToRole } = require('../utils/parsers');
const xlg = require('../xlogger');
const checkAccess = require('../utils/checkaccess');
const config = require("../config.json");
const { removeRoles } = require("../utils/database")

module.exports = {
    name: 'remove',
    description: 'unconfigure a role for the channel',
    async execute(client, message, args) {
        try {
            // check for perms
            if (!(await checkAccess(message, true))) return;
            // if no args, send detailed help (args not required)
            if (args.length < 2) {
                return message.channel.send({
                    embed: {
                        color: parseInt(process.env.INFO_COLOR),
                        description: `__**Ping Assist: Remove Helper Role**__\nUse \` ${process.env.PREFIX}remove <role id> <shortcut name> \` in the channel the helper role is registered in.`
                    }
                }).catch(xlg.error);
            }
            // check for bot perms
            //if (!message.channel.permissionsFor(message.guild.me).has(["MANAGE_ROLES", "READ_MESSAGE_HISTORY", "VIEW_CHANNEL", "SEND_MESSAGES"])) {}
            // check for roles
            if (!stringToRole(message.guild, args[0], false, false)) return message.channel.send({
                embed: {
                    color: config.fail_color,
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
                        color: config.fail_color,
                        description: `there is no existing role configuration for this channel`
                    }
                }).catch(xlg.error);
            }
            if (hm[message.channel.id][args.join(" ")]) {
                delete hm[message.channel.id][args.join(" ")];
                message.channel.send({
                    embed: {
                        color: config.info_color,
                        description: `entry with \` ${message.channel.id}:${args.join(" ").replace(/[`]+/, "\\`")} \` was removed`
                    }
                }).catch(xlg.error);
            } else {
                return message.channel.send({
                    embed: {
                        color: config.warn_color,
                        description: `that role is not currently mapped`
                    }
                }).catch(xlg.error);
            }
    
            fs.writeFile('./helpermaps.json', JSON.stringify(hm, null, 2), function (err) {
                if (err) {
                    xlg.error(err)
                    return message.channel.send({
                        embed: {
                            color: config.fail_color,
                            description: `error while applying PingHelper updates`
                        }
                    }).catch(xlg.error);
                }
            });
        } catch (error) {
            xlg.error(error);
            message.channel.send({
                embed: {
                    color: config.fail_color,
                    description: `**I am lacking the required permissions; I require:**\n*manage messages:* edit reactions\n*view messages [history]:* interact with users\n*send messages:* to fulfill purpose\n*manage roles:* interact with roles\n*mention @everyone, @here, so on:* to mention the unmentionables`
                }
            }).catch(xlg.error);
        }
    }
}