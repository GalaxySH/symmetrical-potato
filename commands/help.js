const xlg = require('../xlogger');

module.exports = {
    name: "help",
    description: "get command list",
    async execute(client, message) {
        message.channel.send({
            embed: {
                color: 6969,
                title: "Server Commands",
                description: "🔹 `ping` - use default channel ping or mention a certain role\n🔹 `add` - add a role to make mentionable in channel\n🔹 `adjwait` - adjust the timeout until the mention confirmation\n🔹 `list` - list the mentionable roles set in the channel\n🔹 `remove` - unconfigure a role for the channel\n🔹 `accessrole` - set the role for management\n🔹 `help` - stop, get help"
            }
        }).catch(xlg.error);
    }
}