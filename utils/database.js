const MongoClient = require('mongodb').MongoClient
const { Db } = require('mongodb')
const accessrole = require('../commands/accessrole')
const xlg = require('../xlogger')

module.exports = {
    createDatabase: async(UID=null, PASS=null, DB_NAME=null) => {
        try{
            const username = UID || process.env.MONGO_INITDB_ROOT_USERNAME
            const password = PASS || process.env.MONGO_INITDB_ROOT_PASSWORD
            const database_name = DB_NAME || process.env.MONGO_INITDB_DATABASE
    
            const URL = `mongodb://${username}:${password}@mongo:27017/?authSource=admin`
            const db = await MongoClient.connect(URL, {
                useUnifiedTopology: true, 
                useNewUrlParser: true
            })
    
            xlg.log('Connected to database!')
    
            return db.db(database_name)
        }
        catch(err){
            return err 
        }
    },
    /** 
        @param {Db} db 
        @param {string} guildID 
    */
    checkGuildAccessRole: async(guildID, db) => {
        const GuildMeta = db.collection("GuildMeta")
        xlg.log(GuildMeta)
        const thing = await GuildMeta.findOne({guildID: guildID})
        xlg.log(thing)
    },
    /**
     * @param {Db} db
     * @param {string} guildID
     * @param {string} accessroleID
     */
    createAccessRole: async(guildID, accessroleID, db) => {
        const GuildMeta = db.collection("GuildMeta")
        GuildMeta.insertOne({
            guildID: guildID,
            accessroleID: accessroleID,
            waitTime: 
        })
    }
}
