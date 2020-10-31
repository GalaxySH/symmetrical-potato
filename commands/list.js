const xlg = require('../xlogger')
//const checkAccess = require('../utils/checkaccess')
const { getRoles }= require('../utils/database')

module.exports = {
    name: 'list',
    description: 'list the mentionable roles set in the channel',
    async execute(client, message, args) {
        await getRoles(message.guild.id, "", client.database)
        try {
            // check for perms
            //if (!(await checkAccess(message))) return; // removed perm restrictions because i don't know why they were here in the first place
            args.shift();
            // check for channel
            const roles = await getRoles(message.guild.id, message.channel.id, client.database).catch(err=>{
                xlg.error(err)
                return message.channel.send({
                    embed: {
                        color: parseInt(process.env.FAIL_COLOR),
                        description: `error while applying PingHelper updates`
                    }
                }).catch(xlg.error);
            })
            if (roles && Object.keys(roles).length > 0) {
                let helpKeys = Object.keys(roles);
                let helpList = Object.values(roles).map((r, i) => {
                    return `${helpKeys[i]} -> ${message.guild.roles.cache.get(r) || "**no-role**"}`
                });
                return message.channel.send({
                    embed: {
                        color: parseInt(process.env.INFO_COLOR),
                        description: `${helpList.join("\n")}`
                    }
                }).catch(xlg.error);
            } else {
                return message.channel.send({
                    embed: {
                        color: parseInt(process.env.WARN_COLOR),
                        description: `__**Ping Assist: List Helper Roles**__\nUse \` ${process.env.PREFIX}list \` in the channel you wish to see the roles listed for.\n\n> **there are no helper roles for this channel**`
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