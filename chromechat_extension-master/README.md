# Chromechat Extension

This is the Chrome Extension that knows how to talk to http://github.com/knewter/chromechat

## Development

Yeoman was used to develop this app.  We took advantage of
generator-chrome-extension and generator-angular.

### Install dependencies:

```bash
npm install
bower install
```

### Run watchers to compile sass, etc...

```bash
grunt watch
```

### Finally, add the 'app' directory as an extension in chrome...

I'll put instructions here if needed, later.

### To run the tests:

```bash
karma start
```

You can also just hit <leader>t in vim to run them, as long as there's a karma
session running in the background.
