var uu      = require('underscore')
  , db      = require('./models')
  , taskmodel = require('./models/task')
  , rallymodel = require('./models/rally')
  , Constants = require('./constants');

/*
   Define the routes for the app, i.e. the functions which are executed once 
   specific URLs are encountered.
   Look at the bottom of the file for the route mappings
*/

///////////////////////////////////////////////////////////////////////////////
// ensure that the user is logged in.  If not, redirect to the login page
///////////////////////////////////////////////////////////////////////////////
var authenticate = function(request, response) {
    // if request.loggedIn is not initialized, the user has't logged in, so 
    // redirect to the login page
    if (!request.loggedIn) {
      response.redirect("/login");
    } 
}

///////////////////////////////////////////////////////////////////////////////
// home page
///////////////////////////////////////////////////////////////////////////////
var indexfn = function(request, response) {

    authenticate(request, response);

    response.render("homepage", {
      title: Constants.PRODUCT_NAME,
      product_name: Constants.PRODUCT_NAME,
      product_desc: Constants.PRODUCT_DESCRIPTION,
      product_short_desc: Constants.PRODUCT_SHORT_DESCRIPTION,
      addthis_url: Constants.SOCIAL_ADDTHIS_URL,
      ga_domain: Constants.GOOGLE_ANALYTICS_DOMAIN,
      ga_tracking_id: Constants.GOOGLE_ANALYTICS_TRACKING_ID
    });
};

///////////////////////////////////////////////////////////////////////////////
// login page
///////////////////////////////////////////////////////////////////////////////
var loginfn = function(request, response) {
    response.render("loginpage", {
      title: Constants.PRODUCT_NAME,
      product_name: Constants.PRODUCT_NAME,
      product_desc: Constants.PRODUCT_DESCRIPTION,
      product_short_desc: Constants.PRODUCT_SHORT_DESCRIPTION
    });
};

///////////////////////////////////////////////////////////////////////////////
// fetches the tasks for a user.  Interacts with the task model
///////////////////////////////////////////////////////////////////////////////
var api_get_tasksfn = function(request, response) {
    authenticate(request, response);

    var userid = request.user.email || 'test';
    var successcb = function(data) {
      response.json(data);
    };
    var errcb = errfn('error retrieving tasks', response);

    taskmodel.getTasks(userid, successcb, errcb);
};

///////////////////////////////////////////////////////////////////////////////
// posts data to the hbase data store via task model
///////////////////////////////////////////////////////////////////////////////
var api_post_tasksfn = function(request, response) {
    authenticate(request, response);

    var userid = request.user.email || 'test';
    var data = JSON.stringify(request.body);

    console.log(data);

    var successcb = function() {
      response.send();
    };
    var errcb = errfn('error retrieving tasks', response);

    taskmodel.postTasks(userid, data, successcb, errcb);
};

///////////////////////////////////////////////////////////////////////////////
// generate a angular generated task page.  Html source is in views/taskpage.ejs
// and TaskCtrl handles various requests.  models/task is the model that interacts
// with hbase backend
///////////////////////////////////////////////////////////////////////////////
var tasksfn = function(request, response) {
    authenticate(request, response);

    response.render("taskpage", {
      product_name: Constants.PRODUCT_NAME
    });
};

///////////////////////////////////////////////////////////////////////////////
// rally
///////////////////////////////////////////////////////////////////////////////
var rallyfn = function(request, response) {

    authenticate(request, response);

    response.render("rallypage", {
      product_name: Constants.PRODUCT_NAME
    });
};

///////////////////////////////////////////////////////////////////////////////
// DEPRECATED: fetch rally user from hbase data store
///////////////////////////////////////////////////////////////////////////////
var api_get_rallyuserfn = function(request, response) {
    authenticate(request, response);

    var userid = request.user.email || 'test';
    var successcb = function(data) {
      response.json(data);
    };
    var errcb = errfn('error retrieving tasks', response);

    rallymodel.getRallyUser(userid, successcb, errcb);
};

///////////////////////////////////////////////////////////////////////////////
// DEPRECATED: write rally user to hbase data store
///////////////////////////////////////////////////////////////////////////////
var api_post_rallyuserfn = function(request, response) {
    authenticate(request, response);

    var userid = request.user.email;
    var data = JSON.stringify(request.body);

    console.log(data);

    var successcb = function() {
      response.send();
    };
    var errcb = errfn('error retrieving tasks', response);

    rallymodel.postRallyUser(userid, data, successcb, errcb);
};

///////////////////////////////////////////////////////////////////////////////
// DEPRECATED: delete rally user from hbase data store
///////////////////////////////////////////////////////////////////////////////
var api_delete_rallyuserfn = function(request, response) {
    authenticate(request, response);

    var userid = request.user.email;
    var successcb = function(data) {
      response.send();
    };
    var errcb = errfn('error deleting rally user', response);

    rallymodel.deleteRallyUser(userid, successcb, errcb);
};

///////////////////////////////////////////////////////////////////////////////
// display on console and send the error message via response
///////////////////////////////////////////////////////////////////////////////
var errfn = function(errmsg, response) {
    return function errfn(err) {
  console.log(err);
  response.send(errmsg);
    };
};

///////////////////////////////////////////////////////////////////////////////
// helper functions which create a ROUTES array for export and use by web.js
///////////////////////////////////////////////////////////////////////////////
var define_routes = function(dict) {
    var toroute = function(item) {
      return uu.object(uu.zip(['path', 'fn'], [item[0], item[1]]));
    };
    return uu.map(uu.pairs(dict), toroute);
};

///////////////////////////////////////////////////////////////////////////////
// get and post routes
///////////////////////////////////////////////////////////////////////////////
var GETROUTES = define_routes({
    '/': indexfn,
    '/home': indexfn,
    '/login': loginfn,
    '/tasks': tasksfn,
    '/rally': rallyfn,
    '/api/tasks': api_get_tasksfn,
    '/api/rally/user' : api_get_rallyuserfn   
});

var POSTROUTES = define_routes({
    '/api/tasks' : api_post_tasksfn,
    '/api/rally/user' : api_post_rallyuserfn
});

var DELETEROUTES = define_routes({
    '/api/rally/user' : api_delete_rallyuserfn
});

module.exports = {
  'GETROUTES' : GETROUTES,
  'POSTROUTES': POSTROUTES,
  'DELETEROUTES': DELETEROUTES};

