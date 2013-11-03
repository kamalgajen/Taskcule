var Constants = require('../constants');

// initialize hbase connection.  The server name and port can be configured 
// Constants.js
if (!global.hasOwnProperty('hbase')) {

   var thrift = require('thrift'),
    HBase = require('../public/js/gen-nodejs/HBase.js'),
    HBaseTypes = require('../public/js/gen-nodejs/HBase_types.js'),

    connection = thrift.createConnection(Constants.HBASE_THRIFT_SERVER_NAME, 
                                            Constants.HBASE_THRIFT_SERVER_PORT, {
        transport: thrift.TBufferedTransport,
        protocol: thrift.TBinaryProtocol
    });

    global.hbase = thrift.createClient(HBase,connection);

}

module.exports = global.hbase;
