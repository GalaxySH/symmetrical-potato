const xlg = require('../xlogger');

module.exports = {
    name: "help",
    description: "stop, get help",
    async execute(client, message) {
        try {
            var cmdMap = [];
            client.commands.forEach(c => {
                cmdMap.push(`🔹 \`${process.env.PREFIX}${c.name}\`\n${c.description}`)
            })
            message.channel.send({
                embed: {
                    color: parseInt(process.env.NAVY_COLOR),
                    title: "Server Commands",
                    description: cmdMap.join("\n")
                }
            }).catch(xlg.error);
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