const { stringToDuration, getFriendlyUptime } = require("../utils/time");
const xlg = require('../xlogger');
const checkAccess = require('../utils/checkaccess');
const { getWaitTime } = require("../utils/database");
const { editWaitTime } = require("../utils/database")

module.exports = {
    name: "adjwait",
    description: "adjust the timeout until the mention confirmation",
    async execute(client, message, args) {
        try {
            // check for perms
            if (!(await checkAccess(message, true))) return;
            // show info if no args
            const time = await getWaitTime(message.guild.id, client.database)
            if (args.length < 1) {
                return message.channel.send({
                    embed: {
                        color: parseInt(process.env.INFO_COLOR),
                        description: `**Current Wait Setting:**\n${getFriendlyUptime(time).minutes || 15} minutes`
                    }
                }).catch(xlg.error);
            }

            var newTime = stringToDuration(args.join(""));
            if (!newTime) {
                message.channel.send({
                    embed: {
                        color: parseInt(process.env.FAIL_COLOR),
                        description: `new queue time provided was invalid\n\`NdNhNmNs\``
                    }
                }).catch(xlg.error);
                return;
            }
            if (newTime < 60000) {
                message.channel.send({
                    embed: {
                        color: parseInt(process.env.FAIL_COLOR),
                        description: `new queue time must be >= 60 seconds`
                    }
                }).catch(xlg.error);
                return;
            }

            await editWaitTime(message.guild.id, client.database, newTime).catch(err=>{
                xlg.error(err)
                return message.channel.send({
                    embed: {
                        color: parseInt(process.env.FAIL_COLOR),
                        description: `error while applying new queue time`
                    }
                }).catch(xlg.error)
            })

            message.channel.send({
                embed: {
                    color: parseInt(process.env.INFO_COLOR),
                    description: `wait time set to ${getFriendlyUptime(newTime).minutes || 15} minutes`
                }
            }).catch(xlg.error)
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