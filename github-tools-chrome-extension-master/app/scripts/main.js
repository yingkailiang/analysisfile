(function(window) {

  var divUserLinks = window.divUserLinks = document.createElement('div');
  window.document.body.appendChild(divUserLinks);

  var details = window.divDetails = document.createElement('div');
  window.document.body.appendChild(details);

  var setBadge = function(text, color, title, html) {
    chrome.browserAction.setBadgeText({
      text: text
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: color
    });
    details.innerHTML = html;
  };

  var fail = function() {
    setBadge('Err', [255, 0, 0, 128], 'GitHub notification failed', 'Error');
  };

  var fixAnchors = function(element) {
    var a, i, l, href, anchors = element.querySelectorAll('a[href]');
    for (i = 0, l = anchors.length; i < l; i++) {
      a = anchors[i];
      
      href = a.getAttribute('href');
      if (href.indexOf('http') !== 0)
        a.setAttribute('href', 'https://github.com' + href);

      a.target = '_blank';
    }
  };

  var update = function() {
    var xhr = new XMLHttpRequest;
    xhr.open('GET', 'https://github.com/notifications');
    xhr.responseType = 'document';
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status !== 200) {
          return fail();
        }
        var title = xhr.response.head.getElementsByTagName('title')[0];
        if (!title)
          return fail();

        if (title.innerText !== 'Notifications') {
          return fail();
        }

        var userLinks = xhr.response.getElementById('user-links');
        fixAnchors(userLinks);
        divUserLinks.innerHTML = userLinks.innerHTML;

        var sidebar = xhr.response.body.querySelector('#notification-center .sidebar');
        fixAnchors(sidebar);

        var cnt = sidebar.querySelector('.count').innerText;
        setBadge(cnt, [0, 63, 247, 191], 'GitHub notification: ' + cnt + 'unread', sidebar.innerHTML);
      }
    };
    xhr.send();
  };

  update();
  window.setInterval(update, 30000);

  chrome.storage.local.get('ghOAuthToken', function(items) {
    if (!items.ghOAuthToken)
      window.open('pages/options.html');
    else {
      window.GitHubApi('/', function(err, data, headers) {
        if (err) 
          window.open('pages/options.html');
      });
    }
  });

})(window);
