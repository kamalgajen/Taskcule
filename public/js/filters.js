angular.module('myApp.filters', []).

  // custom status filter to show all/active/completed tasks
	filter('statusFilter', function($filter) {
  		return function(tasks, filterType) {
  			switch (filterType) {
  				case 'all' : 
  					return tasks;
  				case 'active' : 
  					var activeTasks = $filter('filter')(tasks, {completed:"!true"});
    				return activeTasks;
  				case 'completed' : 
					var completedTasks = $filter('filter')(tasks, {completed:"true"});
    				return completedTasks;  		
  				default :
  					return tasks;
  			}
  		};
	});

