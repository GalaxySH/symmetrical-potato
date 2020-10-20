const fs = require('fs')
const { stringToRole } = require('../utils/parsers')
const xlg = require('../xlogger')
const checkAccess = require('../utils/checkaccess')

module.exports = {
    name: "accessrole",
    description: "set the role to allow access to the bot",
    async execute(client, message, args) {
        try {
            // check for perms
            if (!(await checkAccess(message))) return;
            // show info if no args
            var config = require("../config.json");
            if (args.length < 1) {
                return message.channel.send({
                    embed: {
                        color: config.info_color,
                        description: `Current AR:\n${(config.accessRole && config.accessRole !== null) ? message.guild.roles.cache.get(config.accessRole) : "none"}`,
                        footer: {
                            text: `Send '${config.prefix}acessrole unset' to reset the role`
                        }
                    }
                }).catch(xlg.error);
            }
            // check if server staff wish to "unset" the AR
            if (args.join(" ") === "unset") {
                config.accessRole = null;
            } else {
                // check role args
                var roleTarget = stringToRole(message.guild, args[0], false, false);
                if (!roleTarget) {
                    message.channel.send({
                        embed: {
                            color: config.fail_color,
                            description: `the provided role was invalid`
                        }
                    }).catch(xlg.error);
                    return false;
                }
                if (roleTarget.id === config.accessRole) {
                    message.channel.send({
                        embed: {
                            color: config.fail_color,
                            description: `the provided role (${roleTarget}) is already set as the access role`
                        }
                    }).catch(xlg.error);
                    return false;
                }
                
                // if all checks pass, set the new AR
                config.accessRole = roleTarget.id;
            }

            fs.writeFile('./config.json', JSON.stringify(config, null, 2), function (err) {
                if (err) {
                    xlg.error(err)
                    return message.channel.send({
                        embed: {
                            color: config.fail_color,
                            description: `error while applying new access role`
                        }
                    }).catch(xlg.error);
                }
                
                message.channel.send({
                    embed: {
                        color: config.info_color,
                        description: `access role set to ${(config.accessRole && config.accessRole !== null) ? message.guild.roles.cache.get(config.accessRole) : "`none`"}`
                    }
                }).catch(xlg.error);
            });
        } catch (error) {
            message.channel.send({
                embed: {
                    color: config.fail_color,
                    description: `This bot is lacking the required permissions.`
                }
            }).catch(xlg.error);
        }
    }
}