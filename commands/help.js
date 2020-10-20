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
                    description: `🔹 \`${config.prefix}ping\` - use default channel ping or mention a certain role\n🔹 \`${config.prefix}add\` - add a role to make mentionable in channel\n🔹 \`${config.prefix}adjwait\` - adjust the timeout until the mention confirmation\n🔹 \`${config.prefix}list\` - list the mentionable roles set in the channel\n🔹 \`${config.prefix}remove\` - unconfigure a role for the channel\n🔹 \`${config.prefix}accessrole\` - set the role for management\n🔹 \`${config.prefix}help\` - stop, get help`
                }
            }).catch(xlg.error);
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