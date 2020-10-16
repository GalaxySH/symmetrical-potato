//const { stringToRole } = require('../utils/parsers')
const xlg = require('../xlogger')
//const checkAccess = require('../utils/checkaccess')

module.exports = {
    name: 'ping',
    description: "add a helper mention to the ping queue",
    usage: "<name or shortcut of role>",
    cooldown: 1,
    async execute(client, message, args) {
        // check for perms
        //if (!(await checkAccess(message))) return;
        // check for roles
        // check for channel
        var hm = require("../helpermaps.json");
        if (hm[message.channel.id]) {
            let helperKeys = Object.keys(hm[message.channel.id]);
            if ((!args.length) && Object.values(hm[message.channel.id])[0] && helperKeys[0] !== "" && helperKeys[0] !== null) {
                message.channel.send(`${message.guild.roles.cache.get(Object.values(hm[message.channel.id])[0])}, ${message.member} is asking for help above ^^`).catch(xlg.error);
                return;
            }
            if (helperKeys.includes(args.join(" "))) {
                message.channel.send(`${message.guild.roles.cache.get(hm[message.channel.id][args.join(" ")])}, ${message.member} is asking for help above ^^`).catch(xlg.error);
                return;
            }
            return message.channel.send({
                embed: {
                    color: 16711680,
                    description: `**can't ping default:**\nno roles could be found. a proper helper role could not be found or sent.`
                }
            }).catch(xlg.error);
        } else {
            return message.channel.send({
                embed: {
                    color: 16711680,
                    description: `**can't ping default:**\nno helper roles exist for this channel`
                }
            }).catch(xlg.error);
        }

        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        /*const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms.`);
        console.log(`API Latency is ${Math.round(client.ping)}ms.`);*/
    }
}