angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $ionicPlatform, $ionicPopup, $ionicLoading, AppSettings, stats, settings, $state) {
    console.log('DashCtrl');
    $ionicPlatform.ready(function() {
        $scope.stats = stats;
        $scope.settings = settings;
    });

    $scope.doRefresh = function() {
        $state.reload();
        $scope.stats = stats;
        $scope.settings = settings;
        $scope.$broadcast('scroll.refreshComplete');
    };

    // An alert dialog
    $scope.showAlert = function(message) {
        var template = message ? message : 'Please, review settings...';
        var alertPopup = $ionicPopup.alert({
            title: 'Ups!',
            template: template
        });

        alertPopup.then(function(res) {
            console.log('Thank you for not eating my delicious ice cream cone');
        });
    };
})

.controller('ChatsCtrl', function($scope, events, $state, $ionicPlatform, $ionicFilterBar, $cordovaSocialSharing) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});


    var filterBarInstance;

    $ionicPlatform.ready(function() {
        $scope.events = events;

    });

    $scope.doRefresh = function() {
        $state.reload();
        //$state.transitionTo($state.current, $state.$current.params, { reload: true, inherit: true, notify: true });//reload
        //$scope.events = events;
        $scope.$broadcast('scroll.refreshComplete');
    };

    // An alert dialog
    $scope.showAlert = function(message) {
        var template = message ? message : 'Please, review settings...';
        var alertPopup = $ionicPopup.alert({
            title: 'Ups!',
            template: template
        });

        alertPopup.then(function(res) {
            console.log('Thank you for not eating my delicious ice cream cone');
        });
    };

    $scope.showFilterBar = function() {
        filterBarInstance = $ionicFilterBar.show({
            items: $scope.events,
            update: function(filteredItems) {
                $scope.events = filteredItems;
            },
            filterProperties: ['curso']
        });
    };

    $scope.editEvent = function(event) {
        console.log('Going to editevent: ' + event._id);
        $state.go('tab.edit-event', {
            eventId: event._id
        });
    };
    $scope.addEvent = function(event) {
        $state.go('tab.add-event');
    };

    $scope.shareEvent = function() {
        $cordovaSocialSharing.share('This is my message', 'Subject string', null, 'http://www.mylink.com');
    };
    //$scope.chats = Chats.all();
    $scope.shouldShowDelete = false;
    $scope.shouldShowReorder = false;
    $scope.listCanSwipe = true;
})

.controller('AddEditEventCtrl', function($scope, event, statuses, instructors, utilizations,
    locations, Events, $ionicHistory) {
    $scope.statuses = statuses;
    $scope.event = event;
    $scope.utilizations = utilizations;
    $scope.instructors = instructors;
    $scope.locations = locations;

    var newEvent = false;
    if (typeof($scope.event._id) === 'undefined') {
        $scope.title = 'Add Event';
        newEvent = true;
    } else {
        $scope.title = 'Edit Event';
        newEvent = false;
    }
    //console.log('Current event: ' + JSON.stringify(event));

    $scope.saveEvent = function(form) {
        console.log('Saving: ' + JSON.stringify(event));
        if (newEvent) {
            $scope.event.fechainicio = $scope.event.instructores[0].start;
            $scope.event.fechafin = $scope.event.instructores[0].end;
            Events.add(event).then(function(result) {
                console.log('Stored event successfully');
                $ionicHistory.goBack();
            });
        } else {
            Events.update(event).then(function(result) {
                console.log('Updated event successfully');
                $ionicHistory.goBack();
            });
        }
    };
})

.controller('ChatDetailCtrl', function($scope, event, $state, $ionicPopup, Events, $ionicHistory) {
    $scope.event = event;

    $scope.editEvent = function() {
        $state.go('tab.edit-event', {
            eventId: event._id
        });
    };

    $scope.deleteEvent = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete Event?',
            template: 'Are you sure you want to delete this event?'
        });
        confirmPopup.then(function(res) {
            if (res) {
                console.log('You are sure');
                Events.delete(event._id).then(function(result) {
                    console.log('Event deleted successfully');
                    $ionicHistory.goBack();
                });
            } else {
                console.log('You are not sure');
            }
        });
    };
})

.controller('AccountCtrl', function($scope, $localStorage) {

        $scope.settings = $localStorage.getObject('settings');

        $scope.saveSettings = function() {
            console.log('Storing settings: ' + JSON.stringify($scope.settings));
            $localStorage.setObject('settings', $scope.settings);
        };
    })
    .controller('MoreCtrl', function($scope, AppSettings) {

        AppSettings.getSettings(function(err, settings) {
            $scope.settings = settings;
        });

        $scope.saveSettings = function() {
            AppSettings.saveSettings($scope.settings);
        };
    })
    .controller('InstructorsCtrl', function($scope, instructors, $ionicFilterBar, $ionicPopup, $ionicLoading) {

        var sort_by;
        var filterBarInstance;

        (function() {
            // utility functions
            var default_cmp = function(a, b) {
                    if (a === b) return 0;
                    return a < b ? 1 : -1;
                },
                getCmpFunc = function(primer, reverse) {
                    var dfc = default_cmp, // closer in scope
                        cmp = default_cmp;
                    if (primer) {
                        cmp = function(a, b) {
                            return dfc(primer(a), primer(b));
                        };
                    }
                    if (reverse) {
                        return function(a, b) {
                            return -1 * cmp(a, b);
                        };
                    }
                    return cmp;
                };

            // actual implementation
            sort_by = function() {
                var fields = [],
                    n_fields = arguments.length,
                    field, name, reverse, cmp;

                // preprocess sorting options
                for (var i = 0; i < n_fields; i++) {
                    field = arguments[i];
                    if (typeof field === 'string') {
                        name = field;
                        cmp = default_cmp;
                    } else {
                        name = field.name;
                        cmp = getCmpFunc(field.primer, field.reverse);
                    }
                    fields.push({
                        name: name,
                        cmp: cmp
                    });
                }

                // final comparison function
                return function(A, B) {
                    var a, b, name, result;
                    for (var i = 0; i < n_fields; i++) {
                        result = 0;
                        field = fields[i];
                        name = field.name;

                        result = field.cmp(A[name], B[name]);
                        if (result !== 0) break;
                    }
                    return result;
                };
            };
        }());

        console.log('Instructors view');
        $scope.instructors = instructors;
        $scope.instructors.sort(sort_by('interno', {
            name: 'name',
            reverse: true
        }));

        $scope.doInstRefresh = function() {
            $state.reload();
            $scope.instructors = instructors;
            $scope.$broadcast('scroll.refreshComplete');
        };

        $scope.showInstFilterBar = function() {
            filterBarInstance = $ionicFilterBar.show({
                items: $scope.instructors,
                update: function(filteredItems) {
                    $scope.instructors = filteredItems;
                },
                filterProperties: ['name']
            });
        };

        // An alert dialog
        $scope.showAlert = function(message) {
            var template = message ? message : 'Please, review settings...';
            var alertPopup = $ionicPopup.alert({
                title: 'Ups!',
                template: template
            });

            alertPopup.then(function(res) {
                console.log('Thank you for not eating my delicious ice cream cone');
            });
        };


    })
    .controller('InstructorDetailCtrl', function($scope, instructor, $ionicHistory) {
        $scope.instructor = instructor;
        $scope.closeInstView = function() {
            //$ionicHistory.backView();
            //$ionicNavBarDelegate.back();
            $ionicHistory.goBack();
        };
    })
    .controller('ProvidersCtrl', function($scope, providers, $ionicFilterBar) {

        var filterBarInstance;

        $scope.providers = providers;

        $scope.doProvRefresh = function() {
            $state.reload();
            $scope.providers = providers;
            $scope.$broadcast('scroll.refreshComplete');
        };

        $scope.showProvFilterBar = function() {
            filterBarInstance = $ionicFilterBar.show({
                items: $scope.providers,
                update: function(filteredItems) {
                    $scope.providers = filteredItems;
                },
                filterProperties: ['name']
            });
        };

    })
    .controller('ProviderDetailCtrl', function($scope, provider) {
        $scope.provider = provider;
    });
