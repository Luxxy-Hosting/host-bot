const mongoose = require('mongoose');

const serverDataSchema = new mongoose.Schema({
    ownerID: {
        type: String,
        required: true
    },
    serverID: {
        type: String,
        required: true,
        unique: true
    },
    serverAdminID: {
        type: String,
        required: true
    },
    serverName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['gameserver', 'botserver'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    warned: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('ServerData', serverDataSchema);