
curDBVersion = '2.0'

function db() { }

db.open = function() {
  this.DB = openDatabase('TabSense', '', 'TabSense', 5*1024*1024);
  if(this.DB.version != curDBVersion) {
    db.update(this.DB);
  }
}

db.update = function(DB) {
  console.debug('Updating '+DB.version+' -> '+curDBVersion);
  if(DB.version == '' && curDBVersion == '2.0') {
    DB.changeVersion('','2.0',db.create_new,
      db.onUpdateError, db.onUpdateSuccess);
  } else if(DB.version == '1.0' && curDBVersion == '2.0') {
    DB.changeVersion('1.0','2.0',db.update_1_to_2,
      db.onUpdateError, db.onUpdateSuccess);
  } else {
    
  }
}

db.create_new = function(tx) {
  tx.executeSql('CREATE TABLE IF NOT EXISTS '+
    'Window(id INTEGER PRIMARY KEY ASC, '+
    'wid INTEGER, title TEXT, saved INTEGER DEFAULT 0)',
    [], db.onSuccess, db.onError);
  tx.executeSql('CREATE TABLE IF NOT EXISTS '+
    'Tab(id INTEGER PRIMARY KEY ASC, tid INTEGER, title TEXT, '+
    'url TEXT, faviconurl TEXT, wid INTEGER, parent INTEGER DEFAULT 0, '+
    'idx INTEGER, depth INTEGER DEFAULT 0, status TEXT, '+
    'saved INTEGER DEFAULT 0, collapsed INTEGER DEFAULT 0, '+
    'hidden INTEGER DEFAULT 0, isparent INTEGER DEFAULT 0)',
    [], db.onSuccess, db.onError);
}

db.update_1_to_2 = function(tx) {
  tx.executeSql(
    'ALTER TABLE Tab ADD COLUMN collapsed INTEGER DEFAULT 0', [],
    db.onSuccess, db.onError
  );
  tx.executeSql(
    'ALTER TABLE Tab ADD COLUMN hidden INTEGER DEFAULT 0', [],
    db.onSuccess, db.onError
  );
  tx.executeSql(
    'ALTER TABLE Tab ADD COLUMN isparent INTEGER DEFAULT 0', [],
    db.onSuccess, db.onError
  );
}

db.clear = function() {
  this.DB.transaction(function(tx) {
    tx.executeSql('DELETE FROM Window WHERE saved = 0', [], db.onSuccess, db.onError);
  });
  this.DB.transaction(function(tx) {
    tx.executeSql('DELETE FROM Tab WHERE saved = 0', [], db.onSuccess, db.onError);
  });
}

db.onUpdateError = function(e) {
  console.error('DB Update failed: '+e.message);
}

db.onUpdateSuccess = function() {
  console.debug('DB Update successful');
}

db.onError = function(tx, e) {
  console.error('TabSense DB Error : '+e.message);
}

db.onSuccess = function(tx, r) {
  //console.debug(r);
}


db.put = function(obj, successCb) {
  var onSuccess = successCb || db.onSuccess;
  if(obj.constructor == db.window) {
    var win = obj;
    this.DB.transaction(function(tx) {
      tx.executeSql(
        'INSERT INTO Window(wid, title, saved) VALUES (?,?,?)',
        [win.wid, win.title, 0],
        onSuccess,
        db.onError);
    });
  } else if(obj.constructor == db.tab) {
    var tab = obj;
    this.DB.transaction(function(tx) {
      tx.executeSql('INSERT INTO Tab(tid, title, url, faviconurl, '+
        'wid, parent, idx, depth) VALUES (?,?,?,?,?,?,?,?)',
        [ tab.tid, tab.title, tab.url, tab.faviconurl, tab.wid, 
          tab.parent, tab.index, tab.depth ],
        onSuccess,
        db.onError);
    });
  } else {
    alert('Invalid object to save');
  }
}

db.window = function(wid, title) {
  this.wid = wid;
  this.title = title;
}

db.window.get = function(condition, onSuccess) {
  db.DB.transaction(function(tx) {
    tx.executeSql('SELECT * FROM Window '+condition, [],
      onSuccess, db.onError);
  });
}

db.window.del = function(condition, onSuccess) {
  db.DB.transaction(function(tx) {
    tx.executeSql('DELETE FROM Window '+condition, [],
      onSuccess, db.onError);
  });
}

db.window.update = function(set, condition, data, onSuccess) {
  db.DB.transaction(function(tx) {
    tx.executeSql('UPDATE Window SET '+set+condition, data,
      onSuccess, db.onError);
  });
}

db.tab = function(tid, title, url, faviconurl, index, wid, parent, depth) {
  this.tid = tid;
  this.title = title;
  this.url = url;
  this.faviconurl = faviconurl;
  this.index = index;
  this.wid = wid;
  this.parent = parent || 0;
  this.depth = depth || 0;
}

db.tab.get = function(condition, onSuccess) {
  db.DB.transaction(function(tx) {
    tx.executeSql('SELECT * FROM Tab '+condition, [],
      onSuccess, db.onError);
  });
}

db.tab.del = function(condition, onSuccess) {
  db.DB.transaction(function(tx) {
    tx.executeSql('DELETE FROM Tab '+condition, [],
      onSuccess, db.onError);
  });
}

db.tab.update = function(set, condition, data, onSuccess) {
  db.DB.transaction(function(tx) {
    tx.executeSql('UPDATE Tab SET '+set+' '+condition, data,
      onSuccess, db.onError);
  });
}
