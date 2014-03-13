var credentials = (function($) {
  // 1 = good
  // 0 = bad
  var state = 1;

  var KeepassCredentials = function(db) {
    var self = this;

    self.db = db;
  };

  KeepassCredentials.prototype.getCredentials = function(url, username) {
    var self = this;

    var entries = self.db.findEntriesByURL(url);
    var results = [];
    // Skip backup group
    var backup_group = self.db.findBackupGroup();
    var backup_group_id = 0;
    if (backup_group) {
      backup_group_id = backup_group.groupid;
    }
    for (var i in entries) {
      var entry = entries[i];

      if (entry.groupid != backup_group_id) {
        if (username) {
          if (username == entry.username) {
            results.push({
              'username': entry.username,
              'password': entry.password
            });
          }
        } else {
          results.push({
            'username': entry.username,
            'password': entry.password
          });
        }
      }
    }
    return results;
  };

  function keepass(arrbuf, password) {
    if (!state) {
      return null;
    }
    try {
      var db = new kpdb.databases.Database(arrbuf, password);
      return new KeepassCredentials(db);
    } catch(err) {
      state = 0;
      console.error(err);
    }
  }

  return {
    'keepass': keepass
  };
})(jQuery);
