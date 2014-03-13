(function(window, document) {

  var container = document.getElementById('site-container') || document.body;
  console.log('github_notifications loading', container);

  var getIssueData = function(url) {
    var match = getIssueData.re.exec(url);
    if (!match)
      throw new Error('Invalid issue URL: ' + url);

    return {
      owner: match[1],
      repo: match[2],
      number: match[3],
      issuecomment: match[4]
    };
  };
  getIssueData.re = /^(?:(?:https?:)?\/\/github.com)?\/([^\/]+)\/([^\/]+)\/issues\/(\d+)\/?(?:#issuecomment-(\d+))?$/;

  var view = document.createElement('div');
  view.className = 'ght-notification-helper';

  var decorateIssueNotification = function(notif) {
    var link = notif.querySelector('a');
    var data = getIssueData(link.href);

    var enter = function() {
      var query = ['/repos', data.owner, data.repo, 'issues', data.number];
      //if (data.issuecomment)
      console.log('enter', data);
      window.GitHubApi(
        query.join('/'),
        function(err, data) {
          if (err) {
            view.innerText = 'GitHub Tools Extension for Google Chrome error:' + err;
          } else {
            view.innerHTML = '<div class="comment-content">' + data.body_html + '</div>';
          }
          notif.appendChild(view);
          console.log('fetched', data, err);
        }
      );
    };

    var leave = function() {
      console.log('leave', data);
      if (view.parentElement === notif) {
        notif.removeChild(view);
      }
    };

    window.registerHoverHandler(notif, enter, leave);
    //console.log('issue', data);
  };

  var update = function(container) {
    var notif, notifs = container.querySelectorAll('.issue-notification');
    var i, l;
    for (i = 0, l = notifs.length; i < l; i++) {
      notif = notifs[i];
      decorateIssueNotification(notif);
    }
  };
  
  update(container);

  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        if (mutation.target && mutation.target.id === 'site-container')
          update(container = mutation.target);
      }
    });
  });

  observer.observe(container, {
    childList: true,
    subtree: true
  });

})(window, window.document);
