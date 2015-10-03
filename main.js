var app = angular.module('codecraft', [
  'ngResource',
  'infinite-scroll',
  'angularSpinner',
  'jcs-autoValidate',
  'angular-ladda',
  'mgcrea.ngStrap'
]);

app.config(['$httpProvider', '$resourceProvider', 'laddaProvider', function($httpProvider, $resourceProvider, laddaProvider) {
  $httpProvider.defaults.headers.common['Authorization'] = 'Token a9825926a7c8cd42127f8e81c3c3b9bab39c9695';
  $resourceProvider.defaults.stripTrailingSlashes = false; // only for this API
  laddaProvider.setOption({
    style: 'expand-right'
  });
}]);

app.factory('Contact', ['$resource', function($resource) {
  return $resource("https://codecraftpro.com/api/samples/v1/contact/:id/", 
                   {id:'@id'}, 
                   {update: {
                      method: 'PUT'
                   }
                   });
}]);

app.controller('PersonDetailController', ['$scope', 'ContactService', function($scope, ContactService) {
  $scope.contacts = ContactService;
  
  $scope.save = function() {
    $scope.contacts.updateContact($scope.contacts.selectedPerson);
  };
  
  $scope.remove = function() {
    $scope.contacts.removeContact($scope.contacts.selectedPerson);
  };
}]);

app.controller('PersonListController', ['$scope', '$modal', 'ContactService', function($scope, $modal, ContactService) {
  
  $scope.search = "";
  $scope.order = "email";
  $scope.contacts = ContactService;

  $scope.showCreateModal = function() {
    $scope.contacts.selectedPerson = {};
    $scope.createModal = $modal({
      scope: $scope,
      template: 'templates/modal.create.tpl.html',
      show: true
    });
  };
  
  $scope.createContact = function() {
    console.log("createContact");
    $scope.contacts.createContact($scope.contacts.selectedPerson);
  };
  
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
    
}]);

app.service('ContactService', function(Contact) {
  
  var self = {
    'addPerson': function(person) {
      this.persons.push(person);
    },
    'page': 1,
    'hasMore': true,
    'isLoading': false,
    'isSaving': false,
    'isDeleting': false,
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
    },
    'updateContact': function(person) {
      console.log('updateContact'); 
      self.isSaving = true;
      person.$update.then(function() {
        self.isSaving = false;
      });
    },
    'removeContact': function(person) {
     console.log('removeContact');
      self.isDeleting = true;
      person.$remove().then(function() {
        self.isDeleting = false;
        var index = self.persons.indexOf(person);
        self.persons.splice(index, 1);
        self.selectedPerson = null;
      });
    },
    'createContact': function(person) {
      console.log('createContact'); 
      self.isSaving = true;
      Contact.save(person).$promise.then(function() {
        self.isSaving = false;
      });      
    }
  };
  
  self.loadContacts();
  
  return self;
  
});