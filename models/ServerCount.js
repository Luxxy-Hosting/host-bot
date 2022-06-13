const mongoose = require('mongoose');

const ServerCount = new mongoose.Schema({
    ID: {
        type: String,
        require: true,
        unique: false
    },
    used: {
        type: String,
        require: true,
        unique: false
    },
    have: {
        type: String,
        require: true,
        unique: false
    }
})

module.exports = mongoose.model('FreeServerCount', ServerCount);