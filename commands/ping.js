//const { stringToRole } = require('../utils/parsers')
const xlg = require('../xlogger');
const checkAccess = require('../utils/checkaccess')
const { getFriendlyUptime } = require("../utils/time");
const Discord = require("discord.js");

module.exports = {
    name: 'ping',
    aliases: ["mention"],
    description: "add a helper mention to the ping queue",
    usage: "<name or shortcut of role>",
    cooldown: 1,
    async execute(client, message, args) {
        try {
            var config = require("../config.json");
            // check for perms
            if (config.publicLocked && !(await checkAccess(message))) {
                message.channel.send({
                    embed: {
                        color: config.fail_color,
                        description: `Sorry ${message.member}, pings are currently locked. Only ${message.guild.roles.cache.get(config.accessRole) || "@accessrole"} may use this command.`
                    }
                }).catch(xlg.error);
                return false;
            }
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
                            color: config.fail_color,
                            description: `**No Ping:**\nno roles could be found. a proper helper role could not be found or sent.`
                        }
                    }).catch(xlg.error);
                }
                
                let qmsg = await message.channel.send({
                    embed: {
                        color: config.navy_color,
                        title: "Queued ⏰",
                        description: `In \` ${getFriendlyUptime(config.queueTime).minutes || 15} \` minute(s) (required wait time) a confirmation will be sent for pinging ${mentionRole}.`,
                        timestamp: new Date()
                    }
                }).catch(xlg.error);
                await qmsg.react("🚫").catch(xlg.error);
                const qfilter = (r, u) => r.emoji.name === '🚫' && (u.id === message.author.id || message.guild.members.cache.get(u.id).roles.cache.has(config.accessRole));
                const qcollected = await qmsg.awaitReactions(qfilter, { max: 1, time: config.queueTime })
                if (!qcollected || !qcollected.size) {
                    await qmsg.reactions.removeAll().catch(xlg.error);
                    //qmsg.delete().catch(xlg.error);
                } else {
                    qmsg.embeds[0].color = config.warn_color;
                    qmsg.embeds[0].title = "Aborted";
                    qmsg.embeds[0].description = null;
                    qmsg.embeds[0].timestamp = new Date();
                    await qmsg.edit(new Discord.MessageEmbed(qmsg.embeds[0])).catch(xlg.error);
                    //await qmsg.reactions.removeAll().catch(xlg.error);
                    const reactsToRemove = qmsg.reactions.cache.filter(r => r.users.cache.has(client.user.id));
                    try {
                        for (const reaction of reactsToRemove.values()) {
                            await reaction.users.remove(client.user.id);
                        }
                    } catch (error) {
                        xlg.error("could not remove my reactions");
                    }
                    return;
                }

                // now irrelevant because the previous reaction listener IS the timer
                // set a QueueTimer to minus the time the previous abort listener took
                //await new Promise(resolve => setTimeout(resolve, config.queueTime - 60000));

                let confMsg = await message.channel.send({
                    embed: {
                        color: config.navy_color,
                        title: "Confirm",
                        description: `Time is up! Still need help?`,
                        timestamp: new Date()
                    }
                }).catch(xlg.error);
                await confMsg.react("✔").catch(xlg.error);

                const filter = (r, u) => r.emoji.name === '✔' && u.id === message.author.id;
                const collected = await confMsg.awaitReactions(filter, { max: 1, time: 60000 });
                if (!collected || !collected.size) {
                    confMsg.embeds[0].color = config.fail_color;
                    confMsg.embeds[0].timestamp = new Date();
                    confMsg.embeds[0].description = "Mention request aborted.";
                    await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0])).catch(xlg.error);
                    //await confMsg.reactions.removeAll().catch(xlg.error);
                    const reactsToRemove = confMsg.reactions.cache.filter(r => r.users.cache.has(client.user.id));
                    try {
                        for (const reaction of reactsToRemove.values()) {
                            await reaction.users.remove(client.id);
                        }
                    } catch (error) {
                        xlg.error("could not remove my reactions");
                    }
                } else {
                    //message.channel.send(`${mentionRole} | ${message.member} is asking for help above ^^`).catch(xlg.error);
                    confMsg.embeds[0].color = config.info_color;
                    confMsg.embeds[0].title = null;
                    confMsg.embeds[0].timestamp = null;
                    confMsg.embeds[0].description = `${message.author} is requesting help`;
                    //await message.channel.send(mentionRole, new Discord.MessageEmbed(confMsg.embeds[0]));
                    await confMsg.edit(mentionRole, new Discord.MessageEmbed(confMsg.embeds[0]));
                    //await confMsg.reactions.removeAll().catch(xlg.error);
                    const reactsToRemove = confMsg.reactions.cache.filter(r => r.users.cache.has(client.user.id));
                    try {
                        for (const reaction of reactsToRemove.values()) {
                            await reaction.users.remove(client.id);
                        }
                    } catch (error) {
                        xlg.error("could not remove my reactions");
                    }
                }
            } else {
                return message.channel.send({
                    embed: {
                        color: config.fail_color,
                        description: `**Channel Not Pingable:**\nno helper roles exist for this channel`
                    }
                }).catch(xlg.error);
            }

            // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
            // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
            /*const m = await message.channel.send("Ping?");
            m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms.`);
            console.log(`API Latency is ${Math.round(client.ping)}ms.`);*/
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