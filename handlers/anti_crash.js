const chalk = require('chalk');
const config = require('../config.json')
module.exports = async (process) => {
    if (config.settings.anticrash) {
        console.log(chalk.red('[Anti-Crash]') + ' is active ')
        
        process.on('unhandledRejection', (reason, p) => {
            console.log(chalk.red(`\n\n\n\n\n[Anti-Crash] unhandled Rejection:`));
            console.log(reason.stack ? String(reason.stack) : String(reason));
            console.log('=== unhandled Rejection ===\n\n\n\n\n');
        });
        process.on('uncaughtExceptionMonitor', (err, origin) => {
            console.log(chalk.red('[Anti-Crash] uncaught Exception Monitor'))
        });
        process.on('exit', (code) => {
        console.log(chalk.red('\n\n\n\n\n[Anti-Crash] exit'));
        console.log(code);
        console.log(chalk.red('=== exit ===\n\n\n\n\n'));
    });
    process.on('multipleResolves', (type, promise, reason) => {
        console.log(chalk.red('\n\n\n\n\n[Anti-Crash] multiple Resolves'));
        console.log(type, promise, reason);
        console.log(chalk.red('=== multiple Resolves ===\n\n\n\n\n'));
    });
}
}
