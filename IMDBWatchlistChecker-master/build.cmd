C:\kango\kango.py build ./
copy .\utils\manifest.json .\output\chrome\ /Y
7z a .\output\imdbwatchlistchecker_0.2_chrome_webstore.zip .\utils\manifest.json
C:\JSDoc3\jsdoc .\src\common\main.js .\src\common\content.js -d .\documentation
