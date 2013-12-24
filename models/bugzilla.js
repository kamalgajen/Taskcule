var Express = require('express');
var Cheerio = require('cheerio');
var Request = require('request');

var login = function(loginUserName, loginPassword, successcb, errcb){
    var LOGIN_URL = 'http://dt-bugs.svl.ibm.com/index.cgi';
  
    Request.post(
        LOGIN_URL,
        {form:{Bugzilla_login:loginUserName, Bugzilla_password:loginPassword}},
        function(err, resp, body){
            if (err){
                errcb({isError:true});
                return;
            }
            
            if(resp['headers']['set-cookie'] == undefined){
                errcb({isError:true});
                return;
            }
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

var getBugList = function(username, cookieString, url, successcb, errcb){
    // If the url has a trailing '/' remove it before appending
    if(url.charAt( url.length-1 ) == "/") {
        url = url.slice(0, -1)
    }
    var bugListUrl = url + '/buglist.cgi?query_format=advanced&short_desc_type=allwordssubstr&short_desc=&component=MKD+-+Softlines&long_desc_type=allwordssubstr&long_desc=&bug_file_loc_type=allwordssubstr&bug_file_loc=&status_whiteboard_type=allwordssubstr&status_whiteboard=&keywords_type=allwords&keywords=&bug_status=NEW&bug_status=ASSIGNED&bug_status=REOPENED&bug_status=RESOLVED&bug_status=VERIFIED&bug_status=CLOSED&emailassigned_to1=1&emailtype1=exact&email1=' + username + '&emailassigned_to2=1&emailreporter2=1&emailqa_contact2=1&emailcc2=1&emailtype2=substring&email2=&bugidtype=include&bug_id=&votes=&chfieldfrom=&chfieldto=Now&chfieldvalue=&cmdtype=doit&order=Reuse+same+sort+as+last+time&field0-0-0=noop&type0-0-0=noop&value0-0-0=';

    // Constants
    var BUG_NUM_INDEX = 0;
    var BUG_SEVERITY_INDEX = 1;
    var BUG_PRIORITY_INDEX = 2;
    var BUG_OS_INDEX = 3;
    var BUG_ASSIGNEE_INDEX = 4;
    var BUG_STATUS_INDEX = 5;
    var BUG_RESOLUTION_INDEX = 6;
    var BUG_SUMMARY_INDEX = 7;
    
    var BUG_NUM_KEY= 'BUG_NUM';
    var BUG_SEVERITY_KEY = 'BUG_SEVERITY';
    var BUG_PRIORITY_KEY = 'BUG_PRIORITY';
    var BUG_OS_KEY = 'BUG_OS';
    var BUG_ASSIGNEE_KEY = 'BUG_ASSIGNEE';
    var BUG_STATUS_KEY = 'BUG_STATUS';
    var BUG_RESOLUTION_KEY = 'BUG_RESOLUTION';
    var BUG_SUMMARY_KEY = 'BUG_SUMMARY';
    
    var allBugs = [];
   
    var bugListOptions = {
        url : bugListUrl,
        headers : {
            'Cookie' : cookieString
        }
    };
    
    Request(bugListOptions, function(err, resp, body){
        $ = Cheerio.load(body);
        $('.bz_buglist .bz_bugitem').each(function() {
            var row = {};
            var iteratorIndex = 0;
            
            $(this).children().each(function(){
                // Get rid of the new lines in the text
                var value = $(this).text().replace(/\n/g, '');
                
                switch(iteratorIndex){
                    case BUG_NUM_INDEX:
                        row[BUG_NUM_KEY] = value;
                        break;
                    case BUG_SEVERITY_INDEX:
                        row[BUG_SEVERITY_KEY] = value;
                        break;
                    case BUG_PRIORITY_INDEX:
                        row[BUG_PRIORITY_KEY] = value;
                        break;
                    case BUG_OS_INDEX:
                        row[BUG_OS_KEY] = value;
                        break;
                    case BUG_ASSIGNEE_INDEX:
                        row[BUG_ASSIGNEE_KEY] = value;
                        break;
                    case BUG_STATUS_INDEX:
                        row[BUG_STATUS_KEY] = value;
                        break;
                    case BUG_RESOLUTION_INDEX:
                        row[BUG_RESOLUTION_KEY] = value;
                        break;
                    case BUG_SUMMARY_INDEX:
                        row[BUG_SUMMARY_KEY] = value;
                        break;
                }
                iteratorIndex += 1;
            })
            allBugs.push(row);
        });
        
        successcb(allBugs);
    });
}

module.exports = {
    'login' : login,
    'getBugList' : getBugList
}

