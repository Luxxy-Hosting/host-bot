const fs = require ('fs');
module.exports = async (client) =>{
    const load_dir = (dirs) =>{
        const command_files = fs.readdirSync(`./commands/${dirs}`).filter(file => file.endsWith('.js'));
        for(const file of command_files){
            const command = require (`../commands/${dirs}/${file}`)
            if(command.name){
                client.commands.set(command.name, command);
            } else {
                continue;
            }
        }
    }
    // Load all command directories
    ['info', 'admin', 'user', 'server', 'staff', 'music'].forEach(e => {
        if(fs.existsSync(`./commands/${e}`)) {
            load_dir(e);
        }
    });
}