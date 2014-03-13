# What is this?

Content scripts run on the same page as some tab (with access to that page's DOM), but not in the same JavaScript execution context (so you can't access that page's `window.whatever`).

cheaper plz initially scrapes a price off of the page using a content script so that a user can get immediate feedback on the item that they added.
