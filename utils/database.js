const MongoClient = require('mongodb').MongoClient;
//const {Db} = require('mongodb')
//const accessrole = require('../commands/accessrole');
const xlg = require('../xlogger');
/**
 * 
 * @param {string} UID Database login Username
 * @param {string} PASS Database login Password
 * @param {string} DB_NAME Database Name
 * @returns {Promise<Db>} A mongoDB database if login worked
 */
const createDatabase = async (UID=null, PASS=null, DB_NAME=null) => {
    const username = UID || process.env.MONGO_INITDB_ROOT_USERNAME;
    const password = PASS || process.env.MONGO_INITDB_ROOT_PASSWORD;
    const database_name = DB_NAME || process.env.MONGO_INITDB_DATABASE;

    const URL = `mongodb://${username}:${password}@mongo:27017/?authSource=admin`;
    const db = await MongoClient.connect(URL, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });

    xlg.log('Connected to database!');

    return db.db(database_name);
}

/** 
    @param {Db} db mongoDB database
    @param {string} guildID guild to check
*/
const checkGuildAccessRole = async (guildID, db) => {
    const GuildMeta = db.collection("GuildMeta")
    const thing = await GuildMeta.findOne({ "guildID": guildID }) || {accessrole: null}
    return thing;
}
/**
 * @param {Db} db mongoDB database
 * @param {string} guildID id for guild to set accessrole to
 * @param {string} accessroleID accessrole to set as guild accessrole
 */
const setAccessRole = async (guildID, accessroleID, db) => {
    const GuildMeta = db.collection("GuildMeta")
    await GuildMeta.updateOne({
        "guildID": guildID,
    }, { $set: { "accessrole": accessroleID } }, { upsert: true })
}
/**
 * @param {Db} db mongoDB database
 * @param {string} guildID id for guild to lock
 * @returns {Promise<boolean>} whether the guild is currently locked or unlocked
 */
const lockGuildToggle = async (guildID, db) => {
    const GuildMeta = db.collection("GuildMeta")
    const GuildData = await GuildMeta.findOne({
        "guildID": guildID 
    })
    if(!GuildData.locked){
        await GuildMeta.updateOne({
            "guildID": guildID 
            }, {
                $set: { "locked": true }
            }, {
                upsert: true
            })
        return true
    }
    else{
        await GuildMeta.updateOne({
            "guildID": guildID 
            }, {
                $set: { "locked": false }
            }, {
                upsert: true
            })
        return false
    }
}
/**
 * 
 * @param {string} guildID id of guild to set role to
 * @param {string} roleID id of role to set to guild
 * @param {string} alias alias to set role to
 * @param {string} channelID channel to set role to
 * @param {boolean} [updateDefault] Make role default?
 * @param {Db} db Mongo Database
 */
const addRole = async(guildID, roleID, channelID, alias, updateDefault=false, db) => {
    const Guild = db.collection(guildID)
    const aliasRefSet = {
        "channelID": channelID,
    }
    aliasRefSet[alias] = {$exists: true, $nin: ["", null]}
    const aliasRef = await Guild.findOne(aliasRefSet)
    if (aliasRef) return 1

    const currentDefault = await Guild.findOne({
        "channelID": channelID,
        "default": {$exists: true, $nin: ["", null]}
    })
    if (!currentDefault || updateDefault){
        const update = {"default": roleID}
        update[alias] = roleID
        await Guild.updateOne({
            "channelID": channelID
        }, {$set: update}, {upsert: true})
        return 2
    } else {
        const update = {}
        update[alias] = roleID
        await Guild.updateOne({
            "channelID": channelID
        }, {$set: update}, {upsert: true}) 
        return 3
    }
}
/**
 * 
 * @param {string} guildID 
 * @param {Db} db 
 * @param {number} waitTime 
 */
const editWaitTime = async(guildID, db, waitTime) => {
    const GuildMeta = db.collection('GuildMeta')
    await GuildMeta.updateOne({
        "guildID": guildID 
        }, {
            $set: { "delay": waitTime }
        }, {
            upsert: true
        })
}
/**
 * 
 * @param {string} guildID 
 * @param {Db} db 
 * @returns {Promise<number>}
 */
const getWaitTime = async(guildID, db) => {
    const GuildMeta = db.collection('GuildMeta')
    const data = await GuildMeta.findOne({
        "guildID": guildID
    }) || {delay: 15000}
    return data.delay
}
/**
 * 
 * @param {string} guildID 
 * @param {Db} db 
 * @returns {Promise<boolean>}
 */
const getLockedState = async(guildID, db) => {
    const GuildMeta = db.collection('GuildMeta')
    const data = await GuildMeta.findOne({
        "guildID": guildID
    }) || {locked: false}
    return data.locked
}
/**
 * 
 * @param {string} guildID 
 * @param {string} channelID
 * @param {Db} db 
 */
const getRoles = async(guildID, channelID, db) => {
    const Guild = db.collection(guildID)
    const channels = await Guild.findOne({"channelID": channelID}, {projection: {_id: 0, "channelID": 0}})
    if (!channels) return false
    return channels
}

/**
 * 
 * @param {string} guildID 
 * @param {string} channelID 
 * @param {string} roleAlias 
 * @param {Db} db 
 * @returns {Promise<number>} 
 */

const removeRoles = async(guildID, channelID, roleAlias, db) => {
    const Guild = db.collection(guildID)
    const Channel = await Guild.findOne({
        "channelID": channelID
    })
    if (!Channel) return 1
    if (!Channel[roleAlias]) return 1
    if (Channel[roleAlias] === Channel.default){
        const set = {"default": ""}
        set[roleAlias] = ""
        await Guild.updateOne({
            "channelID": channelID
        }, {$unset: set})
        return 2
    }
    else {
        const set = {}
        set[roleAlias] = ""
        await Guild.updateOne({
            "channelID": channelID
        }, {$unset: set})
        return 3
    }
}
exports.createDatabase = createDatabase
exports.checkGuildAccessRole = checkGuildAccessRole
exports.setAccessRole = setAccessRole
exports.lockGuildToggle = lockGuildToggle
exports.addRole = addRole
exports.getWaitTime = getWaitTime
exports.getLockedState = getLockedState
exports.editWaitTime = editWaitTime
exports.getRoles = getRoles
exports.removeRoles = removeRoles