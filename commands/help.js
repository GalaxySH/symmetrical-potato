const xlg = require('../xlogger');
const config = require("../config.json");

module.exports = {
    name: "help",
    description: "get command list",
    async execute(client, message) {
        try {
            message.channel.send({
                embed: {
                    color: config.navy_color,
                    title: "Server Commands",
                    description: `🔹 \`${config.prefix}ping\` - use default channel ping or mention a certain role\n🔹 \`${config.prefix}add\` - add a role to make mentionable in channel\n🔹 \`${config.prefix}adjwait\` - adjust the timeout until the mention confirmation\n🔹 \`${config.prefix}list\` - list the mentionable roles set in the channel\n🔹 \`${config.prefix}remove\` - unconfigure a role for the channel\n🔹 \`${config.prefix}accessrole\` - set the role for management\n🔹 \`${config.prefix}lock\` - lock the \`${config.prefix}ping\` command from public access\n🔹 \`${config.prefix}help\` - stop, get help`
                }
            }).catch(xlg.error);
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