const { stringToDuration, getFriendlyUptime } = require("../utils/time");
const fs = require('fs');
const xlg = require('../xlogger');
const checkAccess = require('../utils/checkaccess');

module.exports = {
    name: "adjwait",
    description: "adjust the queue time for mention requests",
    async execute(client, message, args) {
        try {
            // check for perms
            if (!(await checkAccess(message, true))) return;
            // show info if no args
            var config = require("../config.json");
            if (args.length < 1) {
                return message.channel.send({
                    embed: {
                        color: config.info_color,
                        description: `**Current Wait Setting:**\n${getFriendlyUptime(config.queueTime).minutes || 15} minutes`
                    }
                }).catch(xlg.error);
            }

            var newTime = stringToDuration(args.join(""));
            if (!newTime) {
                message.channel.send({
                    embed: {
                        color: config.fail_color,
                        description: `new queue time provided was invalid\n\`NdNhNmNs\``
                    }
                }).catch(xlg.error);
                return;
            }
            if (newTime < 60000) {
                message.channel.send({
                    embed: {
                        color: config.fail_color,
                        description: `new queue time must be >= 60 seconds`
                    }
                }).catch(xlg.error);
                return;
            }

            config.queueTime = newTime;

            fs.writeFile('./config.json', JSON.stringify(config, null, 2), function (err) {
                if (err) {
                    xlg.error(err)
                    return message.channel.send({
                        embed: {
                            color: config.fail_color,
                            description: `error while applying new queue time`
                        }
                    }).catch(xlg.error);
                }
                
                message.channel.send({
                    embed: {
                        color: config.info_color,
                        description: `wait time set to ${getFriendlyUptime(config.queueTime).minutes || 15} minutes`
                    }
                }).catch(xlg.error);
            });
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