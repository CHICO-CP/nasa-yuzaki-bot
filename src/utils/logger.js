const chalk = require('chalk');

class Logger {
    static log(message) {
        console.log(`[${new Date().toLocaleTimeString()}] ${chalk.blue('INFO')} ${message}`);
    }

    static success(message) {
        console.log(`[${new Date().toLocaleTimeString()}] ${chalk.green('SUCCESS')} ${message}`);
    }

    static warning(message) {
        console.log(`[${new Date().toLocaleTimeString()}] ${chalk.yellow('WARNING')} ${message}`);
    }

    static error(message) {
        console.log(`[${new Date().toLocaleTimeString()}] ${chalk.red('ERROR')} ${message}`);
    }

    static command(user, command, guild) {
        console.log(`[${new Date().toLocaleTimeString()}] ${chalk.cyan('COMMAND')} ${user} used /${command} in ${guild}`);
    }

    static event(event) {
        console.log(`[${new Date().toLocaleTimeString()}] ${chalk.magenta('EVENT')} ${event} triggered`);
    }
}

module.exports = Logger;