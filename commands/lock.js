const fs = require('fs');
const xlg = require('../xlogger');
const checkAccess = require('../utils/checkaccess');

module.exports = {
    name: "lock",
    description: "lock the ping command from public access",
    async execute(client, message) {
        try {
            // check for perms
            if (!(await checkAccess(message, true))) return;
            // show info if no args
            var config = require("../config.json");

            if (config.publicLocked) {
                config.publicLocked = false;
            } else {
                config.publicLocked = true;
            }

            fs.writeFile('./config.json', JSON.stringify(config, null, 2), function (err) {
                if (err) {
                    xlg.error(err)
                    message.channel.send({
                        embed: {
                            color: config.fail_color,
                            description: `error while entering locked mode`
                        }
                    });
                    return false;
                }
                
                message.channel.send({
                    embed: {
                        color: config.success_color,
                        description: `\`${config.prefix}ping\` successfully ${config.publicLocked ? "locked" : "unlocked"}`
                    }
                });
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