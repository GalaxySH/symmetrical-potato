const fs = require('fs')
const { stringToRole } = require('../utils/parsers')
const xlg = require('../xlogger')
const checkAccess = require('../utils/checkaccess')
const config = require("../config.json");

module.exports = {
    name: 'add',
    description: 'add a role to make mentionable in channel',
    async execute(client, message, args) {
        try {
            // check for perms
            if (!(await checkAccess(message, true))) return;
            // if no args, send detailed help (args not required)
            if (args.length < 2) {
                return message.channel.send({
                    embed: {
                        color: config.info_color,
                        description: `__**Ping Assist: Add Helper Role**__\nUse \` ${config.prefix}add <role id> <shortcut name> \` in the channel you wish the helper role to be pingable in.`
                    }
                }).catch(xlg.error);
            }
            // check for roles
            if (!stringToRole(message.guild, args[0], false, false)) return message.channel.send({
                embed: {
                    color: config.fail_color,
                    description: `${message.member}, that is an invalid role. :(`
                }
            }).catch(xlg.error);
            let roleTarget = stringToRole(message.guild, args[0], false, false);
            args.shift();
            // check for channel
            var hm = require('../helpermaps.json');

            if (!hm[message.channel.id]) {
                hm[message.channel.id] = {};
            }
            if (!hm[message.channel.id][roleTarget.name]) {
                hm[message.channel.id][roleTarget.name] = roleTarget.id;
                message.channel.send({
                    embed: {
                        color: config.warn_color,
                        description: `default entry \` ${message.channel.id}:${roleTarget.name} \` did not exist previously\nadded channel to PingHelper mapping with role name \`${roleTarget.name}\``
                    }
                }).catch(xlg.error);
            }
            if (!hm[message.channel.id][args.join(" ")]) {
                hm[message.channel.id][args.join(" ")] = roleTarget.id;
                message.channel.send({
                    embed: {
                        color: config.info_color,
                        description: `entry \` ${message.channel.id}:${args.join(" ").replace(/[`]+/, "\\`")} \` did not exist previously\nadded channel to PingHelper mapping with role shortcut \`${args.join(" ")}\``
                    }
                }).catch(xlg.error);
            } else {
                return message.channel.send({
                    embed: {
                        color: config.warn_color,
                        description: `that PingHelper entry already exists`
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