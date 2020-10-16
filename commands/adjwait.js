const { stringToDuration, getFriendlyUptime } = require("../utils/time");
const fs = require('fs');
const xlg = require('../xlogger');
const checkAccess = require('../utils/checkaccess');

module.exports = {
    name: "adjwait",
    description: "adjust the queue time for mention requests",
    async execute(client, message, args) {
        // check for perms
        if (!(await checkAccess(message))) return;
        // show info if no args
        var config = require("../config.json");
        if (args.length < 1) {
            return message.channel.send({
                embed: {
                    color: 37809,
                    description: `**current wait time:**\n${getFriendlyUptime(config.queueTime).minutes || 15} minutes`
                }
            }).catch(xlg.error);
        }

        var newTime = stringToDuration(args.join(""));
        if (!newTime) {
            return message.channel.send({
                embed: {
                    color: 16711680,
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
                        color: 16711680,
                        description: `error while applying new queue time`
                    }
                }).catch(xlg.error);
            }
            
            message.channel.send({
                embed: {
                    color: 37809,
                    description: `wait time set to ${getFriendlyUptime(config.queueTime).minutes || 15} minutes`
                }
            }).catch(xlg.error);
        });
    }
}