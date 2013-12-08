var async = require('async');
var util = require('util');
var request = require('request');
var uu = require('underscore');
var db = require('./index');

// using thrift to connect to hbase from nodejs.  This has tested to be 
// much more efficient than using hbase native REST API
var HBase = require('../public/js/gen-nodejs/Hbase.js');
var HBaseTypes = require('../public/js/gen-nodejs/Hbase_types.js');


// get tasks from hbase 'todo' table.  An entire task list is stored 
// as a blob (b64 serialized) with email address as the jey
// see readme document for the document structure

//get the tasks for a userid (email)
var getTasks = function(userid, successcb, errcb) {
	var tasks = "[]";
    global.hbase.getRow('todo', userid, {}, 
    	function(err,data) {
      if (err) {
        console.log('getRow error:', err);
        errcb(err);
      } else {
        if (data.length > 0) {
            tasks = data[0].columns["cf:default"].value;
        }
        console.log(tasks);
        successcb(tasks);
      }
    });
};

// update the tasks for a userid
var postTasks = function(userid, data, successcb, errcb) {
    global.hbase.mutateRow('todo', userid, 
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

module.exports = { 'getTasks': getTasks,
					'postTasks': postTasks};
