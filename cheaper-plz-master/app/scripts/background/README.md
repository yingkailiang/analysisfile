# What is this?
The background page runs in a separate, but connected sandbox.

When we want to share state between the popup and the tab, it needs to go here.

Also, long running processes, such as checking for updates, must happen in the background script context.

If you add new files to the background page, you'll need to also add them to `app/manifest.json` under the `background` option.
