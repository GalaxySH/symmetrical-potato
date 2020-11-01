const { stringToRole } = require('../utils/parsers')
const xlg = require('../xlogger')
const checkAccess = require('../utils/checkaccess')
const { Client, Message } = require('discord.js')
const {setAccessRole} = require('../utils/database')
const {checkGuildAccessRole} = require('../utils/database')

module.exports = {
    name: "accessrole",
    description: "set the role for management",
    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {string[]} args 
     */
    async execute(client, message, args) {
        try {
            // check for perms
            if (!(await checkAccess(message, true))) return;
            // show info if no args
            const accessRole = await checkGuildAccessRole(message.guild.id, message.client.database)
            if (args.length < 1) {
                return message.channel.send({
                    embed: {
                        color: parseInt(process.env.INFO_COLOR),
                        description: `Current AR:\n${(accessRole.accessrole && accessRole.accessrole !== null) ? message.guild.roles.cache.get(accessRole.accessrole) : "none"}`,
                        footer: {
                            text: `Send '${process.env.PREFIX}accessrole unset' to reset the role`
                        }
                    }
                }).catch(xlg.error);
            }
            // check if server staff wish to "unset" the AR
            if (args.join(" ") === "unset") {
                setAccessRole(message.guild.id, "", message.client.database).catch(err=>{
                    xlg.error(err)
                    message.channel.send({
                        embed: {
                            color: parseInt(process.env.FAIL_COLOR),
                            description: `error while applying new access role`
                        }
                    })
                })
            } else {
                if (args[0] === "@everyone" || args[0] === "@here") {
                    message.channel.send({
                        embed: {
                            color: parseInt(process.env.FAIL_COLOR),
                            description: `the access role cannot be @everyone or @here`
                        }
                    }).catch(xlg.error);
                    return false;
                }
                // check role args
                var roleTarget = stringToRole(message.guild, args[0], false, false);
                if (!roleTarget) {
                    message.channel.send({
                        embed: {
                            color: parseInt(process.env.FAIL_COLOR),
                            description: `the provided role was invalid`
                        }
                    }).catch(xlg.error);
                    return false;
                }
                if (roleTarget.id === accessRole.accessrole) {
                    message.channel.send({
                        embed: {
                            color: parseInt(process.env.FAIL_COLOR),
                            description: `the provided role (${roleTarget}) is already set as the access role`
                        }
                    }).catch(xlg.error);
                    return false;
                }
                
                // if all checks pass, set the new AR
                await setAccessRole(message.guild.id, roleTarget.id, client.database).catch(err=>{
                    xlg.error(err)
                    message.channel.send({
                        embed: {
                            color: parseInt(process.env.FAIL_COLOR),
                            description: `error while applying new access role`
                        }
                    })
                })
                message.channel.send({
                    embed: {
                        color: parseInt(process.env.INFO_COLOR),
                        description: `accessrole set to ${roleTarget}`
                    }
                })
            }
        } catch (error) {
            xlg.error(error);
            message.channel.send({
                embed: {
                    color: parseInt(process.env.FAIL_COLOR),
                    description: `**I am lacking the required permissions; I require:**\n*manage messages:* edit reactions\n*view messages [history]:* interact with users\n*send messages:* to fulfill purpose\n*manage roles:* interact with roles\n*mention @everyone, @here, so on:* to mention the unmentionables`
                }
            }).catch(xlg.error);
        }
    }
}
