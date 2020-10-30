// This line MUST be first, for discord.js to read the process envs!
const xlg = require('./xlogger')
process.on('uncaughtException', function (e) {
    xlg.log(e)
    process.exit(1)
})
const fs = require('fs')
const Discord = require('discord.js')
const {createDatabase} = require('./utils/database')
const client = new Discord.Client()
const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection()
// ▼▲▼▲▼▲▼▲▼▲▼▲▼▲ for command handler
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
var commNumber = 1
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.name, command)
    let noName = ''
    if (command.name === '' || command.name == null) {
        noName = ' \x1b[33mWARNING: \x1b[32mthis command has no name, it may not be configured properly\x1b[0m'
    }
    console.log(`${commNumber} - %s$${command.name}%s has been loaded%s`, '\x1b[35m', '\x1b[0m', noName)
    commNumber++
}

client.on('ready', async () => { // on start and log in
    xlg.log(`${client.user.tag}(${client.user.id}) has started with ${client.users.cache.size} users.`)
    client.user.setPresence({
        activity: {
            name: `for ${process.env.PREFIX}ping | ${process.env.PREFIX}help`,
            type: 'WATCHING'
        },
        status: 'online'
    }).catch(xlg.error)
    client.database = await createDatabase().catch(err=>xlg.error(err))
    // console.log(client.database)
});

client.on('message', async message => {// on the reception of any message
    if (message.author.bot) return
    if (message.system) return

    var dm = false
    if (!message.guild)
        dm = true
    if (dm) return

    const now = Date.now();

    message.gprefix = process.env.PREFIX
    if (message.content.toLowerCase().indexOf(message.gprefix) !== 0) return; // check for absence of prefix
    const args = message.content.slice(message.gprefix.length).trim().split(/ +/g)

    const commandName = args.shift().toLowerCase()
    const command = client.commands.get(commandName) ||
        client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

    if (!command || !command.name) return // if command doesn't exist, stop
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
        command.execute(client, message, args) // execute command function (execute())
    } catch (error) {
        xlg.error(error)
        message.reply('error while executing! please ask a mod for help.')
    }
});
client.on('error', xlg.error)

client.login(process.env.TOKEN).catch(xlg.error)