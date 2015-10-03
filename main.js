var app = angular.module('codecraft', [
  'ngResource',
  'infinite-scroll',
  'angularSpinner',
  'jcs-autoValidate',
  'angular-ladda'
]);

app.config(function($httpProvider, $resourceProvider, laddaProvider) {
  $httpProvider.defaults.headers.common['Authorization'] = 'Token a9825926a7c8cd42127f8e81c3c3b9bab39c9695';
  $resourceProvider.defaults.stripTrailingSlashes = false; // only for this API
  laddaProvider.setOption({
    style: 'expand-right'
  });
});

app.factory('Contact', function($resource) {
  return $resource("https://codecraftpro.com/api/samples/v1/contact/:id/");
});

app.controller('PersonDetailController', function($scope, ContactService) {
  $scope.contacts = ContactService;
});

app.controller('PersonListController', function($scope, ContactService) {
  
  $scope.search = "";
  $scope.order = "email";
  $scope.contacts = ContactService;

  $scope.$watch('search', function(newVal, oldVal) {
    if (angular.isDefined(newVal)) {
      $scope.contacts.doSearch(newVal); 
    }
  });
  
  $scope.$watch('order', function(newVal, oldVal) {
    if (angular.isDefined(newVal)) {
      $scope.contacts.doOrder(newVal); 
    }
  });
  
  $scope.loadMore = function() {
    console.log("loadMore");
    $scope.contacts.loadMore();
  };
    
});

app.service('ContactService', function(Contact) {
  
  var self = {
    'addPerson': function(person) {
      this.persons.push(person);
    },
    'page': 1,
    'hasMore': true,
    'isLoading': false,
    'selectedPerson': null,
    'persons': [],
    'search': null,
    'order': null,
    'doSearch': function(search) {
      self.hasMore = true;
      self.page = 1;
      self.persons = [];
      self.search = search;
      self.loadContacts();
    },    
    'doOrder': function(order) {
      self.hasMore = true;
      self.page = 1;
      self.persons = [];
      self.order = order;
      self.loadContacts();
    },
    'loadContacts': function() {
      if (self.hasMore && !self.isLoading)
      {
        self.isLoading = true;
        
        var params = { // query parameters to URL
          'page': self.page,
          'search': self.search,
          'ordering': self.order
        };
        
        Contact.get(params, function(data) {
          console.log(data);
          angular.forEach(data.results, function(person) {
            self.persons.push(new Contact(person)); // create Contact resource
          });

          if (!data.next) {
            self.hasMore = false;
          }
          self.isLoading = false;
        });
      } // hasMore
    },
    'loadMore': function() {
      if (self.hasMore && !self.isLoading) {
        self.page += 1;
        self.loadContacts();
      }
    }
  };
  
  self.loadContacts();
  
  return self;
  
});