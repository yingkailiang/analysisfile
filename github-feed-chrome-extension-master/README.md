github-feed-chrome-extension
============================
[ ![Codeship Status for quitschibo/github-feed-chrome-extension](https://www.codeship.io/projects/7a8b1a30-2edb-0131-3daa-5a6688a2a07f/status?branch=master)](https://www.codeship.io/projects/9441)
[![Coverage Status](https://coveralls.io/repos/quitschibo/github-feed-chrome-extension/badge.png?branch=%28detached+from+e86bd20%29)](https://coveralls.io/r/quitschibo/github-feed-chrome-extension?branch=%28detached+from+e86bd20%29)
[![Dependency Status](https://www.versioneye.com/user/projects/528097fe632bacf157000034/badge.png)](https://www.versioneye.com/user/projects/528097fe632bacf157000034)

## Setting up
For getting the extension run, you have to provide your github credentials. These credentials are:
* Your github username
* A github token (you have to create one; [look here](https://help.github.com/articles/creating-an-access-token-for-command-line-use) to get it created)

Please DO NOT provide your password (even if it would work)! Please treat your token like your password!

### Security considerations:
This extension is just for testing. The place for storing your token is NOT SAFE (localStorage)!
If you remove this extension from your browser, please DELETE YOUR TOKEN! Thanks.

## Tips for setting up the dev environment
* There is a .editorconfig for configuring the IDE of your choice. [Have a look here](http://editorconfig.org/)
