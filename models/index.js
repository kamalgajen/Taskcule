var Constants = require('../constants');

// initialize hbase connection.  The server name and port can be configured 
// Constants.js
if (!global.hasOwnProperty('hbase')) {

global.hbase = "";
}

module.exports = global.hbase;
