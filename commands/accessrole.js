const fs = require('fs')
const { stringToRole } = require('../utils/parsers')
const xlg = require('../xlogger')
const checkAccess = require('../utils/checkaccess')

module.exports = {
    name: "accessrole",
    description: "set the role to allow access to the bot",
    async execute(client, message, args) {
        // check for perms
        if (!(await checkAccess(message))) return;
        // check for bot perms
        if (!message.channel.permissionsFor(message.guild.me).has(["MANAGE_ROLES", "READ_MESSAGE_HISTORY", "MANAGE_MESSAGES", "VIEW_CHANNEL", "SEND_MESSAGES"]) || !message.channel.manageable) {
            return message.channel.send({
                embed: {
                    color: 16711680,
                    description: `this bot is lacking the required permissions`
                }
            }).catch(xlg.error);
        }
        // show info if no args
        var config = require("../config.json");
        if (args.length < 1) {
            return message.channel.send({
                embed: {
                    color: 37809,
                    description: `the current access role is:\n${message.guild.roles.cache.get(config.accessRole)}`
                }
            }).catch(xlg.error);
        }
        // check role args
        var roleTarget = stringToRole(message.guild, args[0], false, false);
        if (!roleTarget) {
            return message.channel.send({
                embed: {
                    color: 16711680,
                    description: `the provided role was invalid`
                }
            }).catch(xlg.error);
        }
        if (roleTarget.id == config.accessRole) {
            return message.channel.send({
                embed: {
                    color: 16711680,
                    description: `the provided role (${roleTarget}) is already set as the access role`
                }
            }).catch(xlg.error);
        }

        config.accessRole = roleTarget.id;

        fs.writeFile('./config.json', JSON.stringify(config, null, 2), function (err) {
            if (err) {
                xlg.error(err)
                return message.channel.send({
                    embed: {
                        color: 16711680,
                        description: `error while applying new access role`
                    }
                }).catch(xlg.error);
            }
            
            message.channel.send({
                embed: {
                    color: 37809,
                    description: `access role set to ${message.guild.roles.cache.get(config.accessRole)}`
                }
            }).catch(xlg.error);
        });
    }
}