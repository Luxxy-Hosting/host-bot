const mongoose = require('mongoose');

const userData = new mongoose.Schema({
    ID: {
        type: String,
        require: true,
        unique: true
    },
    consoleID: {
        type: String,
        require: true,
        unique: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    username: {
        type: String,
        require: true,
        unique: true
    },
    linkTime: {
        type: String,
        require: true,
        unique: false
    },
    linkDate: {
        type: String,
        require: true,
        unique: false
    }
})

module.exports = mongoose.model('userData', userData);
