/* 
  Set up the Angular.js controllers, the A in the MEAN stack (from mean.io).
  TODO: extract different controllers into a separate js file and load dynamically 
  as needed.
*/

////////////////////////////////////////////////////////////////////////////////
// Controller for Task page
// TODO: the taskService is not used here.  should be removed.
////////////////////////////////////////////////////////////////////////////////
angular.module('myApp.controllers',[]).
  controller('TaskCtrl', ['$http', '$scope', '$timeout', '$rootScope', 'taskService', 
    function($http, $scope,  $timeout, $rootScope, taskService) {

  console.log("inside taskctrl");

  // call the server api to fetch tasks from the hbase data store
  // the tasks is stored as a blob with the users email address as the key
  $http.get('/api/tasks').success(function(data, status, headers, config) {
    
    var json = JSON.parse(data);
    //console.debug(json);
    $scope.tasks = eval(json);

    // order by property
    $scope.orderProp = 'id';
    // max task id in the json object
    $scope.maxTaskId = _.max($scope.tasks, function(task){ return task.id; }).id || 0;

  }).error(function(data, status, headers, config) {
    $scope.error = "Error fetching tasks - Status: " + status;
    console.error($scope.error);
  });

  // watch the tasks model and set dirty flag to 1, so the 
  // changes can be persisted in data store
  $scope.dirty = 0;
  $scope.$watch('tasks', function(newValue) { 
    $scope.dirty = 1; 
  }, true);

  // call save every few seconds (if the model is dirty)
  var onTimeout = function() {
    if ($scope.dirty) {
      $scope.saveTasks();
      $scope.dirty = 0;
    }
    timer = $timeout(onTimeout, 5000);
  };
  var timer = $timeout(onTimeout, 5000);   
 
  // on page unload, save the data and cancel the timer
  // TODO: this doesn't work - not sure why yet.  There has to be a mechanism to 
  // update the model if dirty on exit.  For now the timeout cycle is short to capture 
  // the changes, but not a good solution.
  /*
  $scope.$on("$destroy", function() {
      $scope.saveTasks();
      if (timer) {
          $timeout.cancel(timer);
      }
  });
  */

  //////////////////////////////////////////////////////////////////////////////
  // makes a POST request to update the tasks in the hbase data store
  //////////////////////////////////////////////////////////////////////////////
  $scope.saveTasks = function() {
      $http.post('/api/tasks', angular.toJson($scope.tasks)).success(function(data, status, headers, config) {
        console.log("Successful data update - status:", status);
      }).error(function(data, status, headers, config) {
        console.error("Data update failed - status: ", status);
      });
  }

  //////////////////////////////////////////////////////////////////////////////
  // format button based on button clicks
  //////////////////////////////////////////////////////////////////////////////
  $scope.fmtButton = function(btnName) {
    // remove primary from all the buttons
    $('button[name=btnactive]').removeClass('btn-primary');
    $('button[name=btnall]').removeClass('btn-primary');
    $('button[name=btncompleted]').removeClass('btn-primary');

    // add primary to only the select button
    $('button[name=' + btnName + ']').addClass('btn-primary');
  }

  //////////////////////////////////////////////////////////////////////////////
  // make the task element editable on double click
  //////////////////////////////////////////////////////////////////////////////
  $scope.makeeditable = function() {
    $(".editable-todos").removeAttr("readonly");  
  };

  //////////////////////////////////////////////////////////////////////////////
  // make the task element uneditable on double click
  // ng-model mapping takes care of the actual edits by updating the 
  // model directly - so no extra work required!
  //////////////////////////////////////////////////////////////////////////////
  $scope.makeuneditable = function() {
    $(".editable-todos").attr("readonly", "readonly");
  }

  //////////////////////////////////////////////////////////////////////////////
  // add a new task
  //////////////////////////////////////////////////////////////////////////////
  $scope.addtask = function() { 

    if ($.trim($scope.newtask) == "") {
      $scope.newtask = "";
      return;
    }

    $scope.newTask = [
      {
        "id" : ++$scope.maxTaskId,
        "name" : $scope.newtask,
        "completed" : "false"
      }
    ];
    $scope.tasks.unshift($scope.newTask[0]);
    //console.log( $scope.newtask );
    $scope.newtask = "";
    //$scope.$apply();
  };

  //////////////////////////////////////////////////////////////////////////////
  // delete a task
  //////////////////////////////////////////////////////////////////////////////
  $scope.deletetask = function(id) { 
    // using underscore util to filter on id
    $scope.tasks = _.filter($scope.tasks, function(task) {
      return task.id !== id;
    });
  };

}]).

  //////////////////////////////////////////////////////////////////////////////
  // Controller for Rally registration page
  //////////////////////////////////////////////////////////////////////////////
  controller('RallyRegistrationCtrl', ['$http', '$scope', '$route',  
    function($http, $scope, $route) {

    /* 
    // NOT USED - the code below performs fetch/save/delete of rally user ids.  
    // decided to fetch the user ids from session via rally web service instead 
    // and stored in browser session instead.
    $scope.newuser = true;

    // see if a rally user is already registered
    $http.get('/api/rally/user').success(function(data, status, headers, config) {
      var json = JSON.parse(data);
      console.log(json);
      $scope.rally = eval("(" + json + ")");
      console.log($scope.rally.user);
      console.log(angular.toJson($scope.rally));

      if ($scope.rally.user) {
        $scope.newuser = false;
      }
    }).error(function(data, status, headers, config) {
      $scope.error = "Error fetching rally login";
    });

    $scope.saveRallyUser = function() {
      $http.post('/api/rally/user', angular.toJson($scope.rally)).success(function(data, status, headers, config) {
        $scope.newuser = false;
        console.log("Successful data update - status:", status);
      }).error(function(data, status, headers, config) {
        console.log("Data update failed - status: ", status);
      });
    }

    $scope.deleteRallyUser = function() {
      $http.delete('/api/rally/user').success(function(data, status, headers, config) {
        $scope.newuser = true;
        console.log("Successful rally user delete - status:", status);
      }).error(function(data, status, headers, config) {
        console.log("Rally user delete failed - status: ", status);
      });
    }
    */

    $scope.validaccount = true;
    // if there is a rallyuser entry in the browser cookie, it means that the 
    // user has successfully logged onto Rally before, and set this beloe flag 
    // to false
    $scope.requestRallyLogin = 
      (document.cookie.replace(/(?:(?:^|.*;\s*)rallyuser\s*\=\s*([^;]*).*$)|^.*$/, "$1") == "") ? true : false;
    console.info("Rally user found in cookie? " + !$scope.requestRallyLogin);

    ///////////////////////////////////////////////////////////////////
    // save Rally login details as a cookie (password is AES encrypted)
    ///////////////////////////////////////////////////////////////////
    $scope.saveRallyLogin = function(rallyuser, rallypwd) {

      // set cookie expiration to 1 year from creation date
      var expiresDate = new Date(); 
      expiresDate.setFullYear( expiresDate.getFullYear() + 1 ); 

      // validate account
      var rallytoken = rallyuser + ":" + rallypwd;
      //console.info(rallyuser);
      //console.info(rallytoken);

      // method to set the cookies
      var setCookies = function(user, token) {
        // use user name as a phase phrase (the second paramter)
        // the first parameter is the string to be encrypted
        var encrypted = CryptoJS.AES.encrypt(token, user);
        //console.info(encrypted);

        // accessing cookie directly instead of angularjs api, to set expiry
        // more than a session.  User having to log onto Rally every time 
        // will be frustrating and doesn't make good usabiliy
        document.cookie = "rallyuser=" + user + 
          ";expires=" + expiresDate.toUTCString();
        document.cookie = "rallytoken=" + encrypted.toString() + 
          ";expires=" + expiresDate.toUTCString();
        console.log("rally account details stored in cookie");
      }

      // call the validate method with setCookies as the 
      // callback functions
      validateAccount(rallyuser, rallytoken, setCookies);
    };

    ///////////////////////////////////////////////////////////////////
    // validate rally account
    ///////////////////////////////////////////////////////////////////
    function validateAccount (user, token, setCookies) {

      //console.log("inside validate method " + token);
      //console.log("inside validate method " + 
      //  window.btoa(unescape(encodeURIComponent( token ))));
      //console.log("inside validate method " + 
      //  token.toString(CryptoJS.enc.Base64));

      var cfg = {
        headers: {
          Authorization: 'Basic ' + window.btoa(unescape(encodeURIComponent( token )))
        },
        withCredentials: true
      }

      $http.get('https://rally1.rallydev.com/slm/webservice/v2.0/user', cfg)
        .success(function(data, status, headers, config) {
        $scope.rallyuser = data.User;
        //console.log($scope.rallyuser.UserName);
        if (user == $scope.rallyuser.UserName) {
          // if validation succeeds, set the details in cookies for 
          // future use, and refresh the screen
          setCookies(user, token);
          window.location.reload();
        }
      }).error(function(data, status, headers, config) {
        $scope.validaccount = false;
      });

    };

}]).

  //////////////////////////////////////////////////////////////////////////////
  // Controller for Rally tasks page
  //////////////////////////////////////////////////////////////////////////////
  controller('RallyCtrl', ['$http', '$scope', '$filter',  
    function($http, $scope, $filter) {

    //enumeration for status updates
    $scope.states = [
      {value: 'Completed', text: 'Completed'},
      {value: 'In-Progress', text: 'In-Progress'},
      {value: 'Defined', text: 'Defined'}
    ]; 

    $scope.showState = function(task) {
      var selected = [];
      if(task.State) {
        selected = $filter('filter')($scope.states, {value: task.State});
      }
      return selected.length ? selected[0].text : 'Not set';
    };

    $scope.requestRallyLogin = 
      (document.cookie.replace(/(?:(?:^|.*;\s*)rallyuser\s*\=\s*([^;]*).*$)|^.*$/, "$1") == "") ? true : false;

    if ((! $scope.requestRallyLogin)) {
      getRallyTasks();

      // now the get the token for updates to rally
      var rallyCredentials = getRallyCredentials();
      var user = rallyCredentials[0];
      var token = rallyCredentials[1];

      var cfg = {
        headers: {
          Authorization: 'Basic ' + token
        },
        withCredentials: true
      }

      var securityToken = "";
      var authurl = "https://rally1.rallydev.com/slm/webservice/v2.0/security/authorize";
      $http.get(authurl, cfg).success(function(data, status, headers, config) {
        securityToken = (data.OperationResult.SecurityToken) ?
          data.OperationResult.SecurityToken : "";
        //console.log(securityToken);
      }).error(function(data, status, headers, config) {
        $scope.error = "Error getting authorization token from Rally (status:" + status + ")";
      });

    }


    ////////////////////////////////////////////////////////////////////////////
    // get rally credentials
    ////////////////////////////////////////////////////////////////////////////
    function getRallyCredentials() {

      var rallyuser = document.cookie.replace(/(?:(?:^|.*;\s*)rallyuser\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      var rallytokencrypt = document.cookie.replace(/(?:(?:^|.*;\s*)rallytoken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      var rallytoken = CryptoJS.AES.decrypt(rallytokencrypt.toString(), rallyuser);
      //console.debug(rallytokencrypt);
      //console.debug(rallytoken.toString(CryptoJS.enc.Utf8));
      //console.debug(rallytoken.toString(CryptoJS.enc.Base64));

      return [rallyuser, rallytoken.toString(CryptoJS.enc.Base64)];
    }

    ////////////////////////////////////////////////////////////////////////////
    // get rally tasks
    ////////////////////////////////////////////////////////////////////////////
    function getRallyTasks () {

      var rallyCredentials = getRallyCredentials();
      var user = rallyCredentials[0];
      var token = rallyCredentials[1];

      var cfg = {
        headers: {
          Authorization: 'Basic ' + token
        },
        withCredentials: true
      }

      var url = "https://rally1.rallydev.com/slm/webservice/v2.0/task?query=((Owner.Name = " + 
        user + ")%20and%20(State%20!=%20Completed))&order=Rank&fetch=TaskIndex,Name,State,ToDo,Estimate,Actuals,Iteration,WorkProduct";

      $http.get(url, cfg).success(function(data, status, headers, config) {
        $scope.rallytasks = eval(data.QueryResult.Results);
      }).error(function(data, status, headers, config) {
        $scope.error = "Error fetching tasks from Rally (status:" + status + ")";
      });

    };

    ////////////////////////////////////////////////////////////////////////////
    // update rally tasks
    ////////////////////////////////////////////////////////////////////////////
    $scope.updateRallyTasks = function(url, key, value) {

      var rallyCredentials = getRallyCredentials();
      var user = rallyCredentials[0];
      var token = rallyCredentials[1];

      var cfg = {
        headers: {
          Authorization: 'Basic ' + token
        },
        withCredentials: true
      }

      // add the security token to the url
      url = url + "?key=" + securityToken;
      
      console.log(url + "%" + key + "%" +  value);
      
      // to reduce the payload, send the json for just the changes instead of 
      // of the full task object everytime to the rally server via post
      var data;
      switch(key) {
        case "Name":
          data = {"Task": {"Name": value}};
          break;
        case "State":
          data = {"Task": {"State": value}};
          break;
        case "Estimate":
          data = {"Task": {"Estimate": value}};
          break;
        case "ToDo":
          data = {"Task": {"ToDo": value}};
          break;
        case "Actuals":
          data = {"Task": {"Actuals": value}};
          break;
      }
      console.log(data);

      $http.post(url, data, cfg).success(function(data, status, headers, config) {
        console.log(data);
      }).error(function(data, status, headers, config) {
        $scope.error = "Error updating rally tasks (status:" + status + ")";
      });

    }

}]).

  //////////////////////////////////////////////////////////////////////////////
  // Controller for GitHub activity page
  //////////////////////////////////////////////////////////////////////////////
  controller('GithubCtrl', ['$http', '$scope', '$filter',  
    function($http, $scope, $filter) {

    ////////////////////////////////////////////////////////////////////////////
    // get github activities (public and private)
    ////////////////////////////////////////////////////////////////////////////
    $scope.getGithubActivities = function(user, token) {

      var cfg = {
        headers: {
          Authorization: 'token ' + token
        }
      }

      var url = "https://api.github.com/users/" + user + "/events";

      $http.get(url, cfg).success(function(data, status, headers, config) {
        $scope.activities = data;
      }).error(function(data, status, headers, config) {
        $scope.error = "Error fetching GitHub activities (status:" + status + ")";
      });

    }


}]);

