var async = require('async');
var util = require('util');
var request = require('request');
var uu = require('underscore');
var db = require('./index');

var HBase = require('../public/js/gen-nodejs/HBase.js');
var HBaseTypes = require('../public/js/gen-nodejs/HBase_types.js');

// rally user management in taskcule
// NOTE: this is not currently used, as the user is stored in the user's 
// browser cookie

// get the rally user for a given userid
var getRallyUser = function(userid, successcb, errcb) {
    var rallyuser = "{}";
    global.hbase.getRow('rally', userid, {}, 
        function(err,data) {
      if (err) {
        console.log('getRow error:', err);
        errcb(err);
      } else {
        if (data.length > 0) {
            rallyuser = data[0].columns["cf:default"].value;
        }
        console.log(rallyuser);
        successcb(rallyuser);
      }
    });

};

// update the hbase data store with rally user for a userid
var postRallyUser = function(userid, data, successcb, errcb) {
    global.hbase.mutateRow('rally', userid, 
        [new Mutation({column: 'cf:default', 
        	value: 
        	data
    	})], 
        null, function(err,data) {
       		if (err) {
            	console.log('post row error:', err);
            	errcb(err);
        	} else {
        		successcb();
        	}
    });

};

// delete a rally user from hbase data store
var deleteRallyUser = function(userid, successcb, errcb) {
    global.hbase.deleteAllRow('rally', userid, {}, 
        function(err,data) {
      if (err) {
        console.log('deleteAllRow error:', err);
        errcb(err);
      } else {
        successcb();
      }
    });
};

module.exports = { 
    'getRallyUser': getRallyUser,
    'postRallyUser': postRallyUser,
    'deleteRallyUser': deleteRallyUser
};
