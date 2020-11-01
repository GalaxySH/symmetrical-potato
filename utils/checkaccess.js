const xlg = require('../xlogger');
const fs = require('fs');
const database = require('./database');
const { Message } = require('discord.js');

/**
 * 
 * @param {Message} message 
 * @param {boolean} strict 
 */

module.exports = async (message, strict) => {
    const accessrole = await database.checkGuildAccessRole(message.guild.id, message.client.database) || {accessrole: null}
    if ((!accessrole.accessrole || accessrole.accessrole === "" || accessrole.accessrole === null)) {
        message.channel.send({
            embed: {
                color:  parseInt(process.env.WARN_COLOR),
                description: `***WARNING:*** you need to set a new access role! Currently, the bot is completely open to use. Set with \`${process.env.PREFIX}accessrole\`.`
            }
        }).catch(xlg.error);
        if (!strict) return true;
    } else if (!message.guild.roles.cache.get(accessrole.accessrole)) {
        message.channel.send({
            embed: {
                color:  parseInt(process.env.FAIL_COLOR),
                description: `The current access role no longer exists in this guild.`
            }
        }).catch(xlg.error);

        return false;
    }
    if (!message.member.roles.cache.get(accessrole.accessrole) && message.author.id !== process.env.OWNER_ID && !message.member.permissions.has("ADMINISTRATOR")) {
        message.channel.send({
            embed: {
                color:  parseInt(process.env.fail_color),
                description: `${message.member}, you cannot use this command without ${message.guild.roles.cache.get(accessrole.accessrole) || "@accessrole"} or admin permissions.`
            }
        }).catch(xlg.error);
        return false;
    }
    return true;
}