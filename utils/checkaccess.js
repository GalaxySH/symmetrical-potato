const xlg = require('../xlogger')
const fs = require('fs')

module.exports = async (message) => {
    var config = require("../config.json");
    if (!config.accessRole || config.accessRole === "" || config.accessRole === null) {
        message.channel.send({
            embed: {
                color: 16750899,
                description: `***WARNING:*** you need to set a new access role! Currently, the bot is completely open to use.`
            }
        }).catch(xlg.error);
        return true;
    }
    if (!message.guild.roles.cache.get(config.accessRole)) {
        message.channel.send({
            embed: {
                color: 16711680,
                description: `The current access role no longer exists in this guild.`
            }
        }).catch(xlg.error);
        
        config.accessRole = "";
        fs.writeFile('./config.json', JSON.stringify(config, null, 2), function (err) {
            if (err) xlg.error(err);
            message.channel.send({
                embed: {
                    color: 16711680,
                    description: `error while reseting access role`
                }
            }).catch(xlg.error);
        });

        return false;
    }
    if (!message.member.roles.cache.get(config.accessRole)) {
        message.channel.send({
            embed: {
                color: 16711680,
                description: `${message.member}, you cannot use this command as you are not a(n) ${message.guild.roles.cache.get(config.accessRole) || "@Manager"}.`
            }
        }).catch(xlg.error);
        return false;
    }
    return true;
}