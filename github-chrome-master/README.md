# Github Chrome

## Development version

To install the development version and hack on this yourself;

```bash
git clone git@github.com:interviewstreet/github-chrome.git
cd github-chrome
npm install coffee-script -g
npm install haml-coffee compass mocha should
cake build
cake watch
```

Then, install the extension

- Open Chrome's extension tab by visiting chrome://extensions
- Check "Developer mode" is ticked
- Click "Load unpacked extension..."
- Select the root of the cloned repository
