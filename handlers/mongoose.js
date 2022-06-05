const mongoose = require('mongoose');
const config = require('../config.json');

module.exports = async () => {
    mongoose.connect(config.settings.mongoDB, {
        useNewUrlParser: true,
        keepAlive: true,
        useUnifiedTopology: true
    }).then(()=>{
        console.log(`🏆 Loaded MONGO database`)
    }).catch((err) =>{
        console.log(err)
    });
}
