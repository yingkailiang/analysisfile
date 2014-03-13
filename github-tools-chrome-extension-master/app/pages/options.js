function OptionsController($scope, $http) {
  var syncedStoregeKeys = ['ghLogin'];
  var localStoregeKeys = ['ghOAuthToken'];

  $scope.localBytesInUse = 0;
  $scope.syncedBytesInUse = 0;

  $scope.updateBytesInUse = function() {
    chrome.storage.local.getBytesInUse(null, function(bytesInUse) {
      $scope.$apply(function() {
        $scope.localBytesInUse = bytesInUse;
      });
    });

    chrome.storage.sync.getBytesInUse(null, function(bytesInUse) {
      $scope.$apply(function() {
        $scope.syncedBytesInUse = bytesInUse;
      });
    });
  };
  $scope.updateBytesInUse();

  $scope.storage = {};
  $scope.pending = 0;

  var storageChangeListener = function(changes, areaName) {
    $scope.$apply(function() {
      var i, l, name;
      if (areaName === 'sync') {
        // synced via Google Account
        for (i = 0, l = syncedStoregeKeys.length; i < l; i++) {
          name = syncedStoregeKeys[i];
          if(changes[name])
            $scope.storage[name] = changes[name].newValue;
        }
      } else {
        // local
        for (i = 0, l = localStoregeKeys.length; i < l; i++) {
          name = localStoregeKeys[i];
          if(changes[name])
            $scope.storage[name] = changes[name].newValue;
        }
      }
      $scope.updateBytesInUse();
    });
  };
  chrome.storage.onChanged.addListener(storageChangeListener);

  var getFromStorage = function(storage, keys) {
    $scope.pending++;
    storage.get(keys, function(items) {
      $scope.$apply(function() {
        var i, l, name;
        for (i = 0, l = keys.length; i < l; i++) {
          name = keys[i];
          $scope.storage[name] = items[name];
        }

        $scope.pending--;
      });
    });
  }

  getFromStorage(chrome.storage.sync, syncedStoregeKeys);
  getFromStorage(chrome.storage.local, localStoregeKeys);

  $scope.saveStorageKeys = function(/* ... */) {
    var i, l, idx, name;
    var synced = {};
    var local = {};
    for (i = 0, l = arguments.length; i < l; i++) {
      name = arguments[i];
      idx = syncedStoregeKeys.indexOf(name);
      if (idx >= 0) {
        synced[name] = $scope.storage[name];
      } else {
        idx = localStoregeKeys.indexOf(name);
        if (idx >= 0) {
          local[name] = $scope.storage[name];
        } else {
          console.error('Key \'' + name + '\' is not in synced or local storage!');
        }
      }
    }

    var decPending = function() {
      $scope.$apply(function() {
        $scope.pending--;
      });
    }

    $scope.pending += 2;

    chrome.storage.sync.set(synced, decPending);
    chrome.storage.local.set(local, decPending);
  };

  $scope.acquireToken = function() {
    var login = $scope.storage.ghLogin;
    var password = $scope.password;
    $scope.pending++;

    $http({
      method: 'POST',
      url: 'https://api.github.com/authorizations',
      headers: {
        'Authorization': 'Basic ' + btoa(login + ':' + password)
      },
      data: {
        scopes: ['user', 'repo', 'notifications'],
        note: 'GitHub Tools for Google Chrome',
        note_url: 'https://github.com/langpavel/github-tools-chrome-extension'
      }
    }).success(function(data, status, headers, config) {
      $scope.pending--;
      $scope.storage.ghOAuthToken = data.token;
      $scope.saveStorageKeys('ghLogin', 'ghOAuthToken');
      window.xhr = arguments;
    }).error(function(data, status, headers, config) {
      $scope.pending--;
      window.xhrerr = arguments;
    });

  };
}
