var Express = require('express');
var Cheerio = require('cheerio');
var Request = require('request');

var login = function(loginUserName, loginPassword, successcb, errcb){
    var LOGIN_URL = 'http://dt-bugs.svl.ibm.com/index.cgi';
  
    Request.post(
        LOGIN_URL,
        {form:{Bugzilla_login:loginUserName, Bugzilla_password:loginPassword}},
        function(err, resp, body){
            if (err)
                errcb('Error with the login form');
            
            var cookieString = getCookieString(resp['headers']['set-cookie']);

            successcb({'cookieString': cookieString});
        }
    );
    
    function getCookieString(cookieArray){
        var cookieString = '';
        var regex1 = /Bugzilla_login=([^;]+); /;
        var regex2 = /Bugzilla_logincookie=([^;]+); /;
        
        for (var i=0; i<cookieArray.length; i++){
            var match = regex1.exec(cookieArray[i]);
            if (match){
                cookieString += match[0];
            }
            else {
                match = regex2.exec(cookieArray[i]);
                if (match)
                    cookieString += match[0]
            } 
        }
        
        return cookieString;
    }
}

module.exports = {
    'login' : login
}

