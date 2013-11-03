// TODO: currently not used and can be remove along with references in the controller
angular.module('myApp.services', []).
  factory('taskService', [function () {

  
  var tasks = [
    {
      "id" : "2",
      "name" : "call mom over the weekend",
      "completed" : "true"
    },
    {
      "id" : "1",
      "name" : "drinks with Jeff on Friday",
      "completed" : "false"
    }
  ];

  return {
    post:function (data) {
      console.log(data);
    },
    get:function () {
      return tasks;
    }
  };

}]);
