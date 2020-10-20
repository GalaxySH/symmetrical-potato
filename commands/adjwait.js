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
            if (!(await checkAccess(message))) return;
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
                return message.channel.send({
                    embed: {
                        color: config.fail_color,
                        description: `new time provided was invalid\n\`NdNhNmNs\``
                    }
                }).catch(xlg.error);
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
            message.channel.send({
                embed: {
                    color: config.fail_color,
                    description: `This bot is lacking the required permissions.`
                }
            }).catch(xlg.error);
        }
    }
}