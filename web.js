var express = require('express')
  , http    = require('http')
  , path    = require('path')
  , async   = require('async')
  , everyauth = require('everyauth')
  , db      = require('./models')
  , Constants = require('./constants')
  , routes  = require('./routes');

/*
  Initialize the Express app, the E in the MEAN stack (from mean.io).
  setup authentication using everyauth, and currently configured with google, but
  can be extended to other sites supporting oauth2.
  load the routes, and start the server on the designated port
*/
var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('port', Constants.APP_SERVER_PORT);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.favicon(path.join(__dirname, 'public/img/favicon.ico')));
/* 'default', 'short', 'tiny', 'dev' */ 
app.use(express.logger("dev"));
app.use(express.bodyParser());

app.use(express.cookieParser());
app.use(express.session({secret: Constants.SESSION_SECRET}));

var usersById = {};
var usersByGoogleId = {};
var usersByGithubId = {};

// function creates a user object and returns it to the caller, meanwhile also
// keeping track in a global hash
function addUser (source, sourceUser) {
  var user;
  user = usersById[sourceUser.id] = {
    id: sourceUser.id, 
    name: sourceUser.name,
    email: sourceUser.email,
    login: sourceUser.login,
    token: sourceUser.token
  };
  user[source] = sourceUser;
  return user;
}

// required by everyauth natively to retrieve the user object
everyauth.everymodule
  .findUserById( function (userId, callback) {
    console.log("Request for user id ", userId);
    callback(null, usersById[userId]);
  });

// google authentication using everyauth framework
everyauth.google
  .appId(Constants.EVERYAUTH_GOOGLE_APPID)
  .appSecret(Constants.EVERYAUTH_GOOGLE_APPSECRET)
  .scope('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo#email') // What you want access to
  .entryPath('/auth/google')
  .callbackPath('/auth/google/callback')
  .handleAuthCallbackError( function (req, res) {
    res.redirect('/login');
  })
  .findOrCreateUser( function (session, accessToken, accessTokenExtra, googleUserMetadata) {
    console.log("Google authentication successful");
    googleUserMetadata.refreshToken = accessTokenExtra.refresh_token;
    googleUserMetadata.expiresIn = accessTokenExtra.expires_in;
    //console.log(googleUserMetadata.id, googleUserMetadata.email, googleUserMetadata);
    return usersByGoogleId[googleUserMetadata.id] || 
      (usersByGoogleId[googleUserMetadata.id] = addUser('google', googleUserMetadata));
  })
  .redirectPath('/home');

// github authentication
everyauth.github
  .appId(Constants.EVERYAUTH_GITHUB_APPID)
  .appSecret(Constants.EVERYAUTH_GITHUB_APPSECRET)
  .scope('user:email repo:status')
  .entryPath('/auth/github')
  .callbackPath('/auth/github/callback')
  .handleAuthCallbackError( function (req, res) {
    res.redirect('/login');
  })
  .findOrCreateUser( function (session, accessToken, accessTokenExtra, githubUser) {
      console.log("Github authentication successful");
      // console.log(accessToken, accessTokenExtra, githubUser);
      // the git user is null in some/all? cases, even though I am request access
      // to the email address.  So, creating a unique email, since this is the 
      // key in our data store
      githubUser.email = githubUser.login + "_github";
      githubUser.token = accessToken;
      return usersByGithubId[githubUser.id] || (usersByGithubId[githubUser.id] = addUser('github', githubUser));
  })
  .redirectPath('/home');

app.use(everyauth.middleware());

// direct get and post requests - see routes.js for more details
for(var ii in routes.GETROUTES) {
    app.get(routes.GETROUTES[ii].path, routes.GETROUTES[ii].fn);
}
for(var ii in routes.POSTROUTES) {
    app.post(routes.POSTROUTES[ii].path, routes.POSTROUTES[ii].fn);
}
for(var ii in routes.DELETEROUTES) {
    app.delete(routes.DELETEROUTES[ii].path, routes.DELETEROUTES[ii].fn);
}

// Begin listening for HTTP requests to Express app
http.createServer(app).listen(app.get('port'), function() {
    console.log("Listening on " + app.get('port'));
});

