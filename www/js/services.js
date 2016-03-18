var HEADER_NAME = 'MyApp-Handle-Errors-Generically';
var specificallyHandleInProgress = false;

angular.module('starter.services', [])

.factory('RequestsErrorHandler', function ($q, $injector) {
    return {
        // --- The user's API for claiming responsiblity for requests ---
        specificallyHandled: function (specificallyHandledBlock) {
            specificallyHandleInProgress = true;
            try {
                return specificallyHandledBlock();
            } finally {
                specificallyHandleInProgress = false;
            }
        },
        // --- Response interceptor for handling errors generically ---
        responseError: function (rejection) {
            var shouldHandle = (rejection && rejection.config && rejection.config.headers &&
                rejection.config.headers[HEADER_NAME]);
                if (shouldHandle) {
                    // --- Your generic error handling goes here ---
                    console.log('Error handling: ' + JSON.stringify(rejection));
                    var ionicPopup = $injector.get('$ionicPopup');
                    var alertPopup = ionicPopup.alert({
                        title: 'Ups!',
                        template: rejection.statusText
                    });

                    alertPopup.then(function (res) {
                        console.log('Thank you for not eating my delicious ice cream cone');
                    });
                }
                return $q.reject(rejection);
            }
        };
    })

    .factory('Chats', function () {
        var chats = [];
        return {
            all: function () {
                return chats;
            },
            remove: function (chat) {
                chats.splice(chats.indexOf(chat), 1);
            },
            get: function (chatId) {
                for (var i = 0; i < chats.length; i++) {
                    if (chats[i].id === parseInt(chatId)) {
                        return chats[i];
                    }
                }
                return null;
            }
        };
    })

    .factory('AppSettings', function ($q, $http, $localStorage) {

        var loadSettings = function () {
            var settings = $localStorage.getObject('settings');
            settings.serverUrl = typeof (settings.serverUrl) !== 'undefined' ? settings.serverUrl : '';
            settings.apiKey = typeof (settings.apiKey) !== 'undefined' ? settings.apiKey : '';
            settings.user = typeof (settings.user) !== 'undefined' ? settings.user : '';
            if (settings.apiKey && settings.serverUrl) {
                return $http.post(settings.serverUrl + '/auth/localapikey', {
                    apikey: settings.apiKey
                }).then(function (response) {
                    //Success
                    //console.log('Response: ' + JSON.stringify(response));
                    settings.token = response.data.token;
                    settings.role = response.data.role;
                    settings.userName = response.data.user;
                    settings.email = response.data.email;
                    $localStorage.setObject('settings', settings);
                    response.data.serverUrl = settings.serverUrl;
                    response.data.apiKey = settings.apiKey;
                    response.data.user = settings.user;
                    response.data.userName = settings.userName;
                    return response.data;
                }, function (err) {
                    console.log('Error loading settings: ' + JSON.stringify(err));
                    return err;
                });
            }

        };

        var saveSettings = function (settings) {
            $localStorage.setObject('settings', settings);
        };

        var getCurrentSettings = function () {
            return loadSettings().then(function (data) {
                //console.log('Data: ' + JSON.stringify(data));
                //return callback(null, data);
                return data;
            });
            /*
            loadSettings(function(error, result) {
            if (error) {return (error);}
            return callback(null, result);
        });
        */
    };

    return {
        getSettings: getCurrentSettings,
        saveSettings: saveSettings
    };

})

.factory('Events', function ($q, $http, AppSettings) {
    var getEvents = function () {
        var settings = {};
        return AppSettings.getSettings().then(function (settings) {
            return $http({
                method: 'GET',
                url: settings.serverUrl + '/api/courses/calevents/' + settings.user,
                headers: {
                    'Authorization': 'Bearer ' + settings.token
                }
            }).then(function successCallback(response) {
                // this callback will be called asynchronously
                // when the response is available
                //console.log('Response: ' + JSON.stringify(response));

                return response.data;
            }, function errorCallback(error) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log('Error in response: ' + JSON.stringify(error));
                return error;
            });
        });
    };

    var getEvent = function (eventid) {
        var settings = {};
        return AppSettings.getSettings().then(function (settings) {
            return $http({
                method: 'GET',
                url: settings.serverUrl + '/api/courses/' + eventid,
                headers: {
                    'Authorization': 'Bearer ' + settings.token
                }
            }).then(function successCallback(response) {
                // this callback will be called asynchronously
                // when the response is available
                //console.log('Response: ' + JSON.stringify(response));
                return response.data;
            }, function errorCallback(error) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log('Error in response: ' + JSON.stringify(error));
                return error;
            });
        });
    };

    var getStats = function () {
        return AppSettings.getSettings().then(function (settings) {
            return $http.post(settings.serverUrl + '/api/courses/stats', {
                startDate: moment().utc().startOf('year'),
                endDate: moment().utc().endOf('year')
            },
            {
                headers: {
                    'Authorization': 'Bearer ' + settings.token
                }
            }
        ).then(function successCallback(response) {
            //console.log('Response: ' + JSON.stringify(response));
            //return callback(null, response);
            return response.data;
        }, function errorCallback(error) {
            //return callback(error);
            return error;
        });
    });

};

var addEvent = function (event) {
    return AppSettings.getSettings().then(function (settings) {
        return $http.post(settings.serverUrl + '/api/courses', event,
        {
            headers: {
                'Authorization': 'Bearer ' + settings.token
            }
        }
    ).then(function successCallback(response) {
        //console.log('Response: ' + JSON.stringify(response));
        //return callback(null, response);
        return response.data;
    }, function errorCallback(error) {
        //return callback(error);
        return error;
    });
});

};

var updateEvent = function (event) {
    return AppSettings.getSettings().then(function (settings) {
        return $http.put(settings.serverUrl + '/api/courses/' + event._id, event,
        {
            headers: {
                'Authorization': 'Bearer ' + settings.token
            }
        }
    ).then(function successCallback(response) {
        //console.log('Response: ' + JSON.stringify(response));
        //return callback(null, response);
        return response.data;
    }, function errorCallback(error) {
        //return callback(error);
        return error;
    });
});

};

var deleteEvent = function (eventid) {
    return AppSettings.getSettings().then(function (settings) {
        return $http.delete(settings.serverUrl + '/api/courses/' + eventid,
        {
            headers: {
                'Authorization': 'Bearer ' + settings.token
            }
        }
    ).then(function successCallback(response) {
        //console.log('Response: ' + JSON.stringify(response));
        //return callback(null, response);
        return response.data;
    }, function errorCallback(error) {
        //return callback(error);
        return error;
    });
});

};

return {
    getEvents: getEvents,
    get: getEvent,
    add: addEvent,
    delete: deleteEvent,
    update: updateEvent,
    getStats: getStats
};

})
.factory('Instructors', function ($q, $http, AppSettings) {

    var getInstructors = function () {
        return AppSettings.getSettings().then(function (settings) {
            return $http({
                method: 'GET',
                url: settings.serverUrl + '/api/users/instructors',
                headers: {
                    'Authorization': 'Bearer ' + settings.token
                }
            }).then(function successCallback(response) {
                return response.data;
            }, function errorCallback(error) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log('Error in response: ' + JSON.stringify(error));
                return error;
            });

        });

    };

    var getInstructor = function (userid) {
        return AppSettings.getSettings().then(function (settings) {
            return $http({
                method: 'GET',
                url: settings.serverUrl + '/api/users/' + userid,
                headers: {
                    'Authorization': 'Bearer ' + settings.token
                }
            }).then(function successCallback(response) {
                return response.data;
            }, function errorCallback(error) {
                return error;
            });
        });
    };

    return {
        getInstructors: getInstructors,
        get: getInstructor
    };

})
.factory('Providers', function ($q, $http, AppSettings) {

    var getProviders = function () {
        return AppSettings.getSettings().then(function (settings) {
            return $http({
                method: 'GET',
                url: settings.serverUrl + '/api/providers',
                headers: {
                    'Authorization': 'Bearer ' + settings.token
                }
            }).then(function successCallback(response) {
                return response.data;
            }, function errorCallback(error) {
                console.log('Error in response: ' + JSON.stringify(error));
                return error;
            });

        });

    };

    var getProvider = function (providerid) {
        return AppSettings.getSettings().then(function (settings) {
            return $http({
                method: 'GET',
                url: settings.serverUrl + '/api/providers/' + providerid,
                headers: {
                    'Authorization': 'Bearer ' + settings.token
                }
            }).then(function successCallback(response) {
                return response.data;
            }, function errorCallback(error) {
                return error;
            });
        });
    };

    return {
        getProviders: getProviders,
        get: getProvider
    };

})
.factory('Statuses', function ($q, $http, AppSettings) {

    var getStatuses = function () {
        return AppSettings.getSettings().then(function (settings) {
            return $http({
                method: 'GET',
                url: settings.serverUrl + '/api/cstates',
                headers: {
                    'Authorization': 'Bearer ' + settings.token
                }
            }).then(function successCallback(response) {
                return response.data;
            }, function errorCallback(error) {
                console.log('Error in response: ' + JSON.stringify(error));
                return error;
            });

        });

    };

    var getStatus = function (statusid) {
        return AppSettings.getSettings().then(function (settings) {
            return $http({
                method: 'GET',
                url: settings.serverUrl + '/api/cstates/' + statusid,
                headers: {
                    'Authorization': 'Bearer ' + settings.token
                }
            }).then(function successCallback(response) {
                return response.data;
            }, function errorCallback(error) {
                return error;
            });
        });
    };

    return {
        getStatuses: getStatuses,
        get: getStatus
    };

})
.factory('Utilizations', function ($q, $http, AppSettings) {
    var getUtilizations = function () {
        return AppSettings.getSettings().then(function (settings) {
            return $http({
                method: 'GET',
                url: settings.serverUrl + '/api/utilizations',
                headers: {
                    'Authorization': 'Bearer ' + settings.token
                }
            }).then(function successCallback(response) {
                return response.data;
            }, function errorCallback(error) {
                console.log('Error in response: ' + JSON.stringify(error));
                return error;
            });
        });
    };

    var getUtilization = function (utilizationid) {
        return AppSettings.getSettings().then(function (settings) {
            return $http({
                method: 'GET',
                url: settings.serverUrl + '/api/utilizations/' + utilizationid,
                headers: {
                    'Authorization': 'Bearer ' + settings.token
                }
            }).then(function successCallback(response) {
                return response.data;
            }, function errorCallback(error) {
                return error;
            });
        });
    };

    return {
        getUtilizations: getUtilizations,
        get: getUtilization
    };
})
.factory('Locations', function ($q, $http, AppSettings) {
    var getLocations = function () {
        return AppSettings.getSettings().then(function (settings) {
            return $http({
                method: 'GET',
                url: settings.serverUrl + '/api/locations',
                headers: {
                    'Authorization': 'Bearer ' + settings.token
                }
            }).then(function successCallback(response) {
                return response.data;
            }, function errorCallback(error) {
                console.log('Error in response: ' + JSON.stringify(error));
                return error;
            });
        });
    };

    var getLocation = function (locationid) {
        return AppSettings.getSettings().then(function (settings) {
            return $http({
                method: 'GET',
                url: settings.serverUrl + '/api/locations/' + locationid,
                headers: {
                    'Authorization': 'Bearer ' + settings.token
                }
            }).then(function successCallback(response) {
                return response.data;
            }, function errorCallback(error) {
                return error;
            });
        });
    };

    return {
        getLocations: getLocations,
        get: getLocation
    };
})
.factory('$localStorage', ['$window', function ($window) {
    return {
        set: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }
    };
}]);
