const mongoose = require('mongoose');

const userData = new mongoose.Schema({
    ID: {
        type: String,
        require: true,
        unique: true
    },
    consoleID: String,
    email: String,
    username: String,
    linkTime: String,
    linkDate: String
})

module.exports = mongoose.model('userData', userData);
