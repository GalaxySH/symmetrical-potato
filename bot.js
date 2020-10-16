// This line MUST be first, for discord.js to read the process envs!
require('dotenv').config()
const xlg = require('./xlogger')
process.on('uncaughtException', function (e) {
    xlg.log(e)
    process.exit(1)
})
const fs = require('fs')
const Discord = require('discord.js')
const config = require('./config.json')
const client = new Discord.Client()
const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection()
// ▼▲▼▲▼▲▼▲▼▲▼▲▼▲ for command handler, got this from https://discordjs.guide/command-handling/
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
var commNumber = 1
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command)
    let noName = ''
    if (command.name === '' || command.name == null) {
        noName = ' \x1b[33mWARNING: \x1b[32mthis command has no name, it may not be configured properly\x1b[0m'
    }
    console.log(`${commNumber} - %s$${command.name}%s has been loaded%s`, '\x1b[35m', '\x1b[0m', noName)
    commNumber++
}

client.on('ready', async () => { // This event will run if the bot starts, and logs in, successfully.
    xlg.log(`${client.user.tag}(${client.user.id}) has started with ${client.users.cache.size} users.`)

    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    // client.user.setActivity(`no site yet | $help | Serving ${client.guilds.size} servers`);
    client.user.setPresence({
        activity: {
            name: `for ${config.prefix}ping | ${config.prefix}help`,
            type: 'WATCHING'
        },
        status: 'online'
    }).catch(xlg.error)
})

client.on('message', async message => {
    if (message.author.bot) return
    if (message.system) return

    var dm = false // checks if it's from a dm
    if (!message.guild)
        dm = true
    if (dm) return

    const now = Date.now();
    
    message.gprefix = config.prefix

    // Also good practice to ignore any message that does not start with our prefix,
    // which is set in the configuration file.
    if (message.content.toLowerCase().indexOf(message.gprefix) !== 0) return
    // ▼▼▼▼▼ deprecated with the guild only command handler filter
    // if (message.channel.type === "dm") return;

    const args = message.content.slice(message.gprefix.length).trim().split(/ +/g)
    const commandName = args.shift().toLowerCase()

    const command = client.commands.get(commandName) ||
        client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

    if (!command || !command.name) return // Stops processing if command doesn't exist, this isn't earlier because there are exceptions

    if (command.args && !args.length) {
        let reply = `I need arguments to make that work, ${message.author}!`

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${message.gprefix}${command.name} ${command.usage}\``
        }

        return message.channel.send({
            embed: {
                description: reply,
                footer: {
                    text: 'tip: separate arguments with spaces'
                }
            }
        })
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 2) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
        }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.execute(client, message, args)
    } catch (error) {
        xlg.error(error)
        message.reply('error while executing! please ask a mod for help.')
    }
})

client.on('error', console.error)

client.login(process.env.TOKEN).catch(console.error)