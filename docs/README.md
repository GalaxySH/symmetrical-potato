# bot docs

These docs are meant to support the Discord bot comprised of the files in this repo. Not all files are included, please note.

The bot is currently designed to only be added the CB & Co Discord. Once added, the owner (Rooskie) needs to be contacted, and he will shut down the public invite.

### concept

The bot is quite easy to use once you understand it. To start, this bot has a very specific purpose: managing mention requests for helper-roles. The way the helper-roles were set up in CB & Co previously turned out to not be great, and the server experienced an increasing frequency in raids and mention misuse (as well as people straight-up not reading the rules). This bot is meant to address that by acting as a proxy for people to request help through.

The configuration of the bot is key, and can be the tricky part. Here is a bad diagram of the mapping:

```yim
the bot holds a large object of channels that it is configured to use (in CBCo).
↓
channel (id) → [set of role shortcuts*] → role mapped to shortcut
```

*"Role shortcuts" are a feature of the bot. When requesting help (`??ping` or `??ping <shortcut>`) the user can supply a shortened name mapped to a certain role that was configured by moderators.

### usage

The two commands normal users would utilize to use the bot are `??ping` and `??list`.

`??ping` - it does not require args, but it will only work if the channel it is called in has roles configured.

`??list` - to find out whether roles are configured, send this. if the channel has roles, it will list them, the first item in each line being what needs to be called with `??ping`. **IMPORTANT:** Using `??ping` without args in a configured channel will default to the first role in that list.

<hr>

All other commands at this time are mod only. The mod access role that the bot recognizes can be set using ` ??accessrole <role> `. Using help to find them, send any moderator command for more information or use.

<hr>

Pretty much all of the commands can be viewed using ` ??help `. All commands will give the necessary information for use if you send them without args, unless they are special use, like ??lock.
