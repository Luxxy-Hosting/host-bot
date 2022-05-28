const mongoose = require('mongoose');

const InvitedByInfo = new mongoose.Schema({
    ID: String,
    tag: String,
    id: String
})

module.exports = mongoose.model('InvitedByInfo', InvitedByInfo);
