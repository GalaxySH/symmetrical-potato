const { stringToRole } = require('../utils/parsers');
const xlg = require('../xlogger');
const checkAccess = require('../utils/checkaccess');
const { removeRoles } = require("../utils/database")
const { getRoles } = require('../utils/database')

module.exports = {
    name: 'remove',
    description: 'unconfigure a role for the channel',
    async execute(client, message, args) {
        try {
            // check for perms
            if (!(await checkAccess(message, true))) return;
            // if no args, send detailed help (args not required)
            if (args.length < 1) {
                return message.channel.send({
                    embed: {
                        color: parseInt(process.env.INFO_COLOR),
                        description: `__**Ping Assist: Remove Helper Role**__\nUse \` ${process.env.PREFIX}remove <shortcut name> \` in the channel the helper role is registered in.`
                    }
                }).catch(xlg.error);
            }
            // check for bot perms
            //if (!message.channel.permissionsFor(message.guild.me).has(["MANAGE_ROLES", "READ_MESSAGE_HISTORY", "VIEW_CHANNEL", "SEND_MESSAGES"])) {}
            // check for roles
            const roles = await getRoles(message.guild.id, message.channel.id, client.database) 
            if (roles[args[1]]) return message.channel.send({
                embed: {
                    color: parseInt(process.env.FAIL_COLOR),
                    description: `${message.member}, that is an invalid role. :(`
                }
            }).catch(xlg.error);
            //let roleTarget = stringToRole(message.guild, args[0], false, false);
            // args.shift();
            // check for channel
            const status = await removeRoles(message.guild.id, message.channel.id, args[0], client.database).catch(err=>{
                xlg.error(err)
                return message.channel.send({
                    embed: {
                        color: parseInt(process.env.FAIL_COLOR),
                        description: `error while applying PingHelper updates`
                    }
                }).catch(xlg.error);
            })
    
            if(status === 3) {
                message.channel.send({
                    embed: {
                        color: parseInt(process.env.INFO_COLOR),
                        description: `entry with \` ${message.channel.id}:${args.join(" ").replace(/[`]+/, "\\`")} \` was removed`
                    }
                }).catch(xlg.error);
            } 
            else if(status === 1) {
                message.channel.send({
                    embed: {
                        color: parseInt(process.env.WARN_COLOR),
                        description: `that role is not currently mapped`
                    }
                }).catch(xlg.error);
            }
            else if (status === 2) {
                message.channel.send({
                    embed: {
                        color: parseInt(process.env.WARN_COLOR),
                        description: `Entry \` ${message.channel.id}:${args.join(" ").replace(/[`]+/, "\\`")} \` was removed. However, this was also a default role. \n To set a new default role add a new role to this channel with \`${process.env.PREFIX}add <role_id> <shortcut> default\``
                    }
                }).catch(xlg.error)
            }

        } catch (error) {
            xlg.error(error);
            message.channel.send({
                embed: {
                    color: parseInt(process.env.fail_color),
                    description: `**I am lacking the required permissions; I require:**\n*manage messages:* edit reactions\n*view messages [history]:* interact with users\n*send messages:* to fulfill purpose\n*manage roles:* interact with roles\n*mention @everyone, @here, so on:* to mention the unmentionables`
                }
            }).catch(xlg.error);
        }
    }
}