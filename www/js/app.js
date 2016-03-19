// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova',
'jett.ionic.filter.bar',
'ion-datetime-picker', 'ngMessages'])

.run(function ($ionicPlatform, $ionicLoading, $rootScope) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
    $rootScope.$on('loading:show', function () {
        $ionicLoading.show({template: 'Loading...'});
    });

    $rootScope.$on('loading:hide', function () {
        $ionicLoading.hide();
    });
})

.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {

    $httpProvider.interceptors.push(function ($rootScope) {
        return {
            request: function (config) {
                $rootScope.$broadcast('loading:show');
                return config;
            },
            response: function (response) {
                $rootScope.$broadcast('loading:hide');
                return response;
            },
            requestError: function (rejectReason) {
                $rootScope.$broadcast('loading:hide');
                return rejectReason;
            }
        };
    });

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
        url: '/dash',
        resolve: {
            stats: function (Events) {
                return Events.getStats();
            },
            settings: function (AppSettings) {
                return AppSettings.getSettings();
            }
        },
        views: {
            'tab-dash': {
                templateUrl: 'templates/tab-dash.html',
                controller: 'DashCtrl'
            }
        }
    })

    .state('tab.chats', {
        url: '/chats',
        cache: true,
        resolve: {
            events: function (Events) {
                return Events.getEvents();
            }
        },
        views: {
            'tab-chats': {
                templateUrl: 'templates/tab-chats.html',
                controller: 'ChatsCtrl'
            }
        }
    })
    .state('tab.chat-detail', {
        url: '/chats/:eventId',
        resolve: {
            event: function (Events, $stateParams) {
                return Events.get($stateParams.eventId);
            }
        },
        views: {
            'tab-chats': {
                templateUrl: 'templates/chat-detail.html',
                controller: 'ChatDetailCtrl'
            }
        }
    })

    .state('tab.account', {
        url: '/account',
        views: {
            'tab-account': {
                templateUrl: 'templates/tab-account.html',
                controller: 'AccountCtrl'
            }
        }
    })
    .state('tab.more', {
        url: '/more',
        views: {
            'tab-more': {
                templateUrl: 'templates/tab-more.html',
                controller: 'MoreCtrl'
            }
        }
    })
    .state('tab.instructors', {
        url: '/instructors',
        resolve: {
            instructors: function (Instructors) {
                return Instructors.getInstructors();
            }
        },
        views: {
            'tab-more': {
                templateUrl: 'templates/instructors.html',
                controller: 'InstructorsCtrl'
            }
        }
    })
    .state('tab.instructor-detail', {
        url: '/instructors/:instructorId',
        resolve: {
            instructor: function (Instructors, $stateParams) {
                return Instructors.get($stateParams.instructorId);
            }
        },
        views: {
            'tab-more': {
                templateUrl: 'templates/instructor-detail.html',
                controller: 'InstructorDetailCtrl'
            }
        }
    })
    .state('tab.providers', {
        url: '/providers',
        resolve: {
            providers: function (Providers) {
                return Providers.getProviders();
            }
        },
        views: {
            'tab-more': {
                templateUrl: 'templates/providers.html',
                controller: 'ProvidersCtrl'
            }
        }
    })
    .state('tab.providers-detail', {
        url: '/providers/:providerId',
        resolve: {
            provider: function (Providers, $stateParams) {
                return Providers.get($stateParams.providerId);
            }
        },
        views: {
            'tab-more': {
                templateUrl: 'templates/provider-detail.html',
                controller: 'ProviderDetailCtrl'
            }
        }
    })
    .state('tab.edit-event', {
        url: '/editevent/:eventId',
        resolve: {
            statuses: function (Statuses) {
                return Statuses.getStatuses();
            },
            instructors: function (Instructors) {
                return Instructors.getInstructors();
            },
            utilizations: function (Utilizations) {
                return Utilizations.getUtilizations();
            },
            locations: function (Locations) {
                return Locations.getLocations();
            },
            event: function (Events, $stateParams) {
                return Events.get($stateParams.eventId);
            }
        },
        views: {
            'tab-chats': {
                templateUrl: 'templates/change-event.html',
                controller: 'AddEditEventCtrl'
            }
        }
    })
    .state('tab.add-event', {
        url: '/addevent',
        resolve: {
            statuses: function (Statuses) {
                return Statuses.getStatuses();
            },
            instructors: function (Instructors) {
                return Instructors.getInstructors();
            },
            utilizations: function (Utilizations) {
                return Utilizations.getUtilizations();
            },
            locations: function (Locations) {
                return Locations.getLocations();
            },
            event: function () {
                return {instructores: [{name: ''}]};
            }
        },
        views: {
            'tab-chats': {
                templateUrl: 'templates/change-event.html',
                controller: 'AddEditEventCtrl'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');

})

.config(function ($provide, $httpProvider) {
    $httpProvider.interceptors.push('RequestsErrorHandler');
    // --- Decorate $http to add a special header by default ---
    function addHeaderToConfig(config) {
        config = config || {};
        config.headers = config.headers || {};
        // Add the header unless user asked to handle errors himself
        if (!specificallyHandleInProgress) {
            config.headers[HEADER_NAME] = true;
        }
        return config;
    }

    // The rest here is mostly boilerplate needed to decorate $http safely
    $provide.decorator('$http', ['$delegate', function ($delegate) {
        function decorateRegularCall(method) {
            return function (url, config) {
                return $delegate[method](url, addHeaderToConfig(config));
            };
        }

        function decorateDataCall(method) {
            return function (url, data, config) {
                return $delegate[method](url, data, addHeaderToConfig(config));
            };
        }

        function delegateReturn(attr) {
            return $delegate[attr].apply($delegate, arguments);
        }
        function copyNotOverriddenAttributes(newHttp) {
            for (var attr in $delegate) {
                if (!newHttp.hasOwnProperty(attr)) {
                    if (typeof($delegate[attr]) === 'function') {
                        newHttp[attr] = delegateReturn(attr);
                    } else {
                        newHttp[attr] = $delegate[attr];
                    }
                }
            }
        }

        var newHttp = function (config) {
            return $delegate(addHeaderToConfig(config));
        };
        newHttp.get    = decorateRegularCall('get');
        newHttp.delete = decorateRegularCall('delete');
        newHttp.head   = decorateRegularCall('head');
        newHttp.jsonp  = decorateRegularCall('jsonp');
        newHttp.post   = decorateDataCall('post');
        newHttp.put    = decorateDataCall('put');
        copyNotOverriddenAttributes(newHttp);
        return newHttp;
    }]);
});
