const { stringToRole } = require('../utils/parsers')
const xlg = require('../xlogger')
const checkAccess = require('../utils/checkaccess')
const {addRole} = require("../utils/database")
const {Client, Message} = require('discord.js')

module.exports = {
    name: 'add',
    description: 'add a role to make mentionable in channel',
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
            // if no args, send detailed help (args not required)
            
            if (args.length < 2) {
                return message.channel.send({
                    embed: {
                        color: parseInt(process.env.INFO_COLOR),
                        description: `__**Ping Assist: Add Helper Role**__\nUse \` ${process.env.PREFIX}add <role id> <shortcut name> <default>\` in the channel you wish the helper role to be pingable in.`
                    }
                }).catch(xlg.error);
            }
            // check for roles
            if (!stringToRole(message.guild, args[0], false, false)) return message.channel.send({
                embed: {
                    color: parseInt(process.env.FAIL_COLOR),
                    description: `${message.member}, that is an invalid role. :(`
                }
            }).catch(xlg.error);
            let roleTarget = stringToRole(message.guild, args[0], false, false);
            args.shift();
            // check for channel
            const updated = await addRole(message.guild.id, roleTarget.id, message.channel.id, args[0], args[2], client.database).catch(err=>{
                xlg.error(err)
                message.channel.send({
                    embed: {
                        color: parseInt(process.env.FAIL_COLOR),
                        description: `error while applying PingHelper updates`
                    }
                }).catch(xlg.error);
            })
            if (updated === 2){
                message.channel.send({
                    embed: {
                        color: parseInt(process.env.INFO_COLOR),
                        description: `Entry \` ${roleTarget.name}\` added to channel \`${message.channel.name}\` as \`${args[0]}\`.\n It is configured to be a default ping, so calling \`${process.env.PREFIX}ping\` in this channel without any arguements will default to this role`
                    }
                }).catch(xlg.error);
            }
            if (updated === 3) {
                message.channel.send({
                    embed: {
                        color: parseInt(process.env.INFO_COLOR),
                        description: `Entry \` ${roleTarget.name}\` added to channel \`${message.channel.name}\` as \`${args[0]}\`.\n Call it with \`${process.env.PREFIX}ping ${args[0]}\`, in this channel.`
                    }
                }).catch(xlg.error);
            } 
            if (updated === 1){
                return message.channel.send({
                    embed: {
                        color: parseInt(process.env.WARN_COLOR),
                        description: `that PingHelper entry already exists`
                    }
                }).catch(xlg.error);
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