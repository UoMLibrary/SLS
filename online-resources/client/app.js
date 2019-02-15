var app = angular.module(
    'mleOnlineResources',
    []
);

app.controller(
    'mainController',
    function($http, $scope, $window) {

        // Load resources
        $http
            .get('resources.json')
            .then(
                function(response) {

                    var resources = response.data;

                    // extract tags from resources
                    var tagsSet = {};
                    for(var i = 0; i < resources.length; i++) {
                        var resource = resources[i];
                        var tags = resource.tags;
                        for(var j = 0; j < tags.length; j++) {
                            var tag = tags[j];
                            if(!tagsSet[tag]) {
                                tagsSet[tag] = true;
                            }
                        }
                    }
                    var tags = [];
                    for(var tag in tagsSet) {
                        tags.push(tag);
                    }
                    tags.sort();

                    $scope.resources = resources;
                    $scope.tags = tags;

                }
            );

        $scope.launchResource = function(link) {
            $window.location = link;
        }



        $scope.filterCategories = [];

        var removeFilter = function(category) {
            var found = $scope.filterCategories.indexOf(category);

            while (found !== -1) {
                $scope.filterCategories.splice(found, 1);
                found = $scope.filterCategories.indexOf(category);
            }
        };

        $scope.categoryToggle = function(tag) {
            if($scope.filterCategories.includes(tag)) {
                removeFilter(tag);
            } else {
                $scope.filterCategories.push(tag);
            }
        };

        $scope.shouldResourceBeDisplayed = function(resource) {
            for(var tag in resource.tags) {
                if($scope.filterCategories.includes(resource.tags[tag])) {
                    return true;
                }
            }
            return false;
        }

    }
);

