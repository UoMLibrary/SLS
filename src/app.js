var app = angular.module(
    'mleOnlineResources',
    []
);

app.config(
    function($locationProvider) {
        $locationProvider.html5Mode({enabled: true, requireBase: false});
    }
);

app.controller(
    'mainController',
    function($http, $scope, $window, $location, $sce) {

        var updateQuery = function() {
            $location.search({
                level2Links: $scope.categoryFilters.join(",")
            });
        };

        var getCurrentWidth = function() {
            return $window.innerWidth;
        };

        $scope.width =  getCurrentWidth();
        angular.element($window).bind('resize', function(){
            $scope.width = getCurrentWidth();
            $scope.$digest(); // manual $digest required as resize event is outside angular
        });


        $scope.loaded = false;

        const updateResources = function(resources) {

            // extract tags from resources
            var tagsSet = {};
            for(var i = 0; i < resources.length; i++) {
                var resource = resources[i];
                var tags = resource.tags;
                for(var j = 0; j < tags.length; j++) {
                    var tag = tags[j];
                    if(tag.includes(" - ")) {
                        tag = tag.split(" - ")[0];
                    }
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

            // extract format from resources
            var formatSet = {};
            for(var i = 0; i < resources.length; i++) {
                var resource = resources[i];
                var format = resource.format;
                if(!formatSet[format]) {
                    formatSet[format] = true;
                }
            }
            var formats = [];
            for(var format in formatSet) {
                formats.push(format);
            }
            formats.sort();

            // sort features (make featured resources at beginning of array)
            resources.sort(
                function(a, b) {
                    const aWeight = a.featured ? 0 : 1;
                    const bWeight = b.featured ? 0 : 1;
                    return aWeight - bWeight;
                }
            );

            $scope.resources = resources;
            $scope.tags = tags;
            $scope.formats = formats;

            $scope.loaded = true;

        };

        // Interpret query parameters
        var query = $location.search();
        if(query.level2Links) {
            var categoryFilters = query.level2Links.replace(/,$/, '').split(',');
            if(categoryFilters && categoryFilters.length > 0 && categoryFilters[0] !== '')
            {
                for(var i = 0; i < categoryFilters.length; i++) {
                    if(categoryFilters[i].includes(" - ")) {
                        categoryFilters[i] = categoryFilters[i].split(" - ")[0];
                    }
                }
                $scope.categoryFilters = categoryFilters;
            }
            // $scope.categoryFilters = query.level2Links.replace(/,$/, '').split(',');
        } else {
            $scope.categoryFilters = [];
        }

        // Handle resource input
        const dynamicResourcesUrl = query.resourcesSource;
        if(defaultResources) {
            updateResources(JSON.parse(unescape(defaultResources)));
        }
        else if(dynamicResourcesUrl) {
            console.log(dynamicResourcesUrl);
        }
        else if(config.resourcesJsonUrl) {
            $http
                .get(config.resourcesJsonUrl)
                .then(
                    function(response) {
                        updateResources(response.data)
                    }
                );
        }

        // Start of SoundCloud related code
        var extractApiTrackId = function (link) {
            if(link.startsWith("https://w.soundcloud.com/player/")) {
                trackIdMatches = link.match(/url\=(https%3A%2F%2Fapi\.soundcloud\.com%2Ftracks%2F=?)([\d]*)/)
                if(trackIdMatches.length > 1) { // found track ID
                    return trackIdMatches[2];
                } else {
                    return -1;
                }
            }
            else {
                return -1;
            }
        };
        $scope.isSoundCloudLink = function(link) {
            return extractApiTrackId(link) > 0;
        };

        $scope.generateSoundCloudIframeUrl = function(link) {
            return $sce.trustAsResourceUrl('https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + extractApiTrackId(link) + '&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true');
        };
        // End of SoundCloud related code


        $scope.launchResource = function(link) { //
            $window.open(link);
        };



        $scope.clearFilters = function() {
            $scope.formatFilters = [];
            $scope.categoryFilters = [];
            updateQuery();
        };

        $scope.formatFilters = [];
        var removeFormatFilter = function(format) {
            var found = $scope.formatFilters.indexOf(format);

            while (found !== -1) {
                $scope.formatFilters.splice(found, 1);
                found = $scope.formatFilters.indexOf(format);
            }
        };
        $scope.formatToggle = function(format) {
            if($scope.formatFilters.includes(format)) {
                removeFormatFilter(format);
            } else {
                $scope.formatFilters.push(format);
            }
        };

        if(!$scope.categoryFilters) $scope.categoryFilters = [];
        var removeCategoryFilter = function(category) {
            var found = $scope.categoryFilters.indexOf(category);

            while (found !== -1) {
                $scope.categoryFilters.splice(found, 1);
                found = $scope.categoryFilters.indexOf(category);
            }
            updateQuery();
        };

        $scope.categoryToggle = function(tag) {
            if($scope.categoryFilters.includes(tag)) {
                removeCategoryFilter(tag);
            } else {
                $scope.categoryFilters.push(tag);
            }
            updateQuery();
        };

        $scope.shouldResourceBeDisplayed = function(resource) {

            var category = false;
            if($scope.categoryFilters.length > 0) {
                for(var tag in resource.tags) {
                    if($scope.categoryFilters.includes(resource.tags[tag])) {
                        category = true;
                    }
                }
            } else {
                category = true;
            }

            var format = false;
            if($scope.formatFilters.length > 0) {
                if($scope.formatFilters.includes(resource.format)) {
                    format = true;
                }
            } else {
                format = true;
            }

            return category && format;

        }

    }
);

