var myApp = angular.module('myApp', ['ui.directives', 
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'xeditable']);

// configuration for xeditable to use bootstrap3 theme.  Can be set to 'bs2' or 'default'
myApp.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; 
});

// enable CORS (cross origin resource sharing)
myApp.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

///////////////////////////////////////////////////////////////////
// Is this required?
///////////////////////////////////////////////////////////////////
/*myApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/tasks', {
      templateUrl: 'views/tasks', 
      controller: 'TaskCtrl'
    });
    $routeProvider.otherwise({redirectTo: '/'});
}]);
*/
