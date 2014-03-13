UserThoughts
============
UserThoughts is a chrome extension and node server for recording a screencast of your browser.

Features
---------
1. Single click user interaction recording.
2. Instant feedback [in the form of a screencast] after recording.

Requirements
-------------
* node.js
* ffmpeg
* imageMagick

Installing
----------
1. Clone the application.
2. Change the `HOST:PORT` to the server's IP address and port number in `config/development.js`
3. Start the node server: `node server.js`
4. Select “Load unpack extension” under Settings -> Tools -> Extensions.
5. Select “ChromeExtensions” folder under “userthoughts”. UserThoughts will be installed as a developer extension.
6. Clicking the icon will start the recording. The elapse time is shown under the icon.
7. Clicking it again will stop the recording. Wait for all the frames to get uploaded to the node server.
8. After all the frames are uploaded, it opens a new tab and plays the screencast.

License
-------
UserThoughts is released under [MIT License](http://en.wikipedia.org/wiki/MIT_License). Feel free to use it in personal and commercial projects.
