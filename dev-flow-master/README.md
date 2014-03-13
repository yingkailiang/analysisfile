Dev Flow
========

Do you need to run a command line script before you can see your new changes on your server? This Chrome extension will help you out. It adds a button to Chrome that will request a URL which will in turn execute your build script.

The Server*
--
Included is an optional Node.js server script which will shell out and execute your script when you request [http://localhost:12000/build](http://localhost:12000/build). To get that running:

Change app.js variable _execCommand_ to your build script command.

    cd server
    npm install
    node app

Visit [http://localhost:12000/build](http://localhost:12000/build) to check output of your script.

*You could, of course, easily write and use a similar script in PHP/Ruby.

The Extension
--
In Chrome:

* Visit [chrome://extensions/](chrome://extensions/)
* Ensure Developer mode is checked
* Click "Load unpacked extension..."
 * Choose the chrome-extension folder.
* Click the grey button in the toolbar