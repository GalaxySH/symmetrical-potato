//const { stringToRole } = require('../utils/parsers')
const xlg = require('../xlogger');
const checkAccess = require('../utils/checkaccess')
const { getFriendlyUptime } = require("../utils/time");
const db = require('../utils/database')
const Discord = require("discord.js");

module.exports = {
    name: 'ping',
    aliases: ["mention"],
    description: "use default channel ping or mention a certain role",
    usage: "<name or shortcut of role>",
    cooldown: 1,
    async execute(client, message, args) {
        try {
            const accessRole = await db.checkGuildAccessRole(message.guild.id, client.database)
            const locked = await db.getLockedState(message.guild.id, client.database)
            const waitTime = await db.getWaitTime(message.guild.id, client.database)
            // check for perms
            if (locked && !(await checkAccess(message))) {
                message.channel.send({
                    embed: {
                        color: parseInt(process.env.FAIL_COLOR),
                        description: `Sorry ${message.member}, pings are currently locked. Only ${message.guild.roles.cache.get(accessRole.accessrole) || "@accessrole"} may use this command.`
                    }
                }).catch(xlg.error);
                return false;
            }
            // check for roles
            // check for channel
            const roles = await db.getRoles(message.guild.id, message.channel.id, client.database)
            if (roles) {
                let mentionRole;
                if ((!args.length) && roles.default) {
                    mentionRole = message.guild.roles.cache.get(roles.default);
                } else if (roles[args.join(" ")]) {
                    mentionRole = message.guild.roles.cache.get(roles[args.join(" ")]);
                } else {
                    return message.channel.send({
                        embed: {
                            color: parseInt(process.env.FAIL_COLOR),
                            description: `**No Ping:**\nno roles could be found. a proper helper role could not be found or sent.`
                        }
                    }).catch(xlg.error);
                }
                
                let qmsg = await message.channel.send({
                    embed: {
                        color: parseInt(process.env.NAVY_COLOR),
                        title: "Queued ⏰",
                        description: `In \` ${getFriendlyUptime(waitTime).minutes || 15} \` minute(s) (required wait time) a confirmation will be sent for pinging ${mentionRole}.`,
                        timestamp: new Date()
                    }
                }).catch(xlg.error);
                await qmsg.react("🚫").catch(xlg.error);
                const qfilter = (r, u) => r.emoji.name === '🚫' && (u.id === message.author.id || message.guild.members.cache.get(u.id).roles.cache.has(accessRole.accessrole));
                const qcollected = await qmsg.awaitReactions(qfilter, { max: 1, time: waitTime })
                if (!qcollected || !qcollected.size) {
                    await qmsg.reactions.removeAll().catch(xlg.error);
                    //qmsg.delete().catch(xlg.error);
                } else {
                    qmsg.embeds[0].color = parseInt(process.env.WARN_COLOR);
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
                    content: message.author,
                    embed: {
                        color: parseInt(process.env.NAVY_COLOR),
                        title: "Confirm",
                        description: `Time is up! Still need help?`,
                        timestamp: new Date()
                    }
                }).catch(xlg.error);
                await confMsg.react("✔").catch(xlg.error);

                const filter = (r, u) => r.emoji.name === '✔' && u.id === message.author.id;
                const collected = await confMsg.awaitReactions(filter, { max: 1, time: 60000 });
                if (!collected || !collected.size) {
                    confMsg.embeds[0].color = parseInt(process.env.FAIL_COLOR);
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
                    confMsg.embeds[0].color = parseInt(process.env.INFO_COLOR)
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
                        color: parseInt(process.env.FAIL_COLOR),
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
                    color: parseInt(process.env.FAIL_COLOR),
                    description: `**I am lacking the required permissions; I require:**\n*manage messages:* edit reactions\n*view messages [history]:* interact with users\n*send messages:* to fulfill purpose\n*manage roles:* interact with roles\n*mention @everyone, @here, so on:* to mention the unmentionables`
                }
            }).catch(xlg.error);
        }
    }
}