//const { stringToRole } = require('../utils/parsers')
const xlg = require('../xlogger');
//const checkAccess = require('../utils/checkaccess')
const { getFriendlyUptime } = require("../utils/time");
const Discord = require("discord.js");

module.exports = {
    name: 'ping',
    aliases: ["mention"],
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
            let mentionRole;
            if ((!args.length) && Object.values(hm[message.channel.id])[0] && helperKeys[0] !== "" && helperKeys[0] !== null) {
                mentionRole = message.guild.roles.cache.get(Object.values(hm[message.channel.id])[0]);
            } else if (helperKeys.includes(args.join(" "))) {
                mentionRole = message.guild.roles.cache.get(hm[message.channel.id][args.join(" ")]);
            } else {
                return message.channel.send({
                    embed: {
                        color: 16711680,
                        description: `**can't ping default:**\nno roles could be found. a proper helper role could not be found or sent.`
                    }
                }).catch(xlg.error);
            }
            
            var config = require("../config.json");
            await message.channel.send({
                embed: {
                    color: 6969,
                    title: "Queued ⏰",
                    description: `In \` ${getFriendlyUptime(config.queueTime).minutes || 15} \` minutes a confirmation for sending the **mention** will appear for you to accept.`,
                    timestamp: new Date()
                }
            }).catch(xlg.error);
            await new Promise(resolve => setTimeout(resolve, config.queueTime));
            
            let confMsg = await message.channel.send({
                embed: {
                    color: 6969,
                    title: "Confirm",
                    description: `Time is up! Still need help?`,
                    timestamp: new Date()
                }
            }).catch(xlg.error);
            await confMsg.react("✔");

            const filter = (r, u) => r.emoji.name === '✔' && u.id === message.author.id;
            const collected = await confMsg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] });
            if (!collected || !collected.size) {
                confMsg.embeds[0].color = 16711680;
                confMsg.embeds[0].description = "Mention request aborted.";
                await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0])).catch(xlg.error);
                await confMsg.reactions.removeAll().catch(xlg.error);
            } else {
                await confMsg.delete();
                message.channel.send(`${mentionRole} | ${message.member} is asking for help above ^^`).catch(xlg.error);
            }
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