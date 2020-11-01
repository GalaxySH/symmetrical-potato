const xlg = require('../xlogger');
const checkAccess = require('../utils/checkaccess');
const { Client, Message } = require('discord.js')
const { lockGuildToggle } = require('../utils/database')

module.exports = {
    name: "lock",
    description: "lock the ping command from public access",
    /**
     * @param {Client} client 
     * @param {Message} message 
     */
    async execute(client, message) {
        try {
            // check for perms
            if (!(await checkAccess(message, true))) return;
            // show info if no args
            const locked = await lockGuildToggle(message.guild.id, client.database) 
            message.channel.send({
                embed: {
                    color: parseInt(process.env.SUCCESS_COLOR),
                    description: `\`${process.env.PREFIX}ping\` successfully ${locked ? "locked" : "unlocked"}`
                }
            });
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