sites.md
========


# What is "sites.md"?

"sites.md" is a chrome extension.  
This can replace a content of the Google Sites page more beautiful , if the content is written in markdown format.

# Install

Please install from [Chrome Webstore](https://chrome.google.com/webstore/detail/sitesmd/hopangdnbhpbohllciddbokpacgolbli).

# How to use

1. Visit a Google Sites page. (Please try this page).
2. Accept warning, if a warning is shown in the address bar.
3. You can see an icon of  "sites.md" in the address bar, if "sites.md" extension is working successfully.
4. You can replace a page content by three ways below. If you've already installed, please try it here. :)
    * Click "sites.md" icon , that's in the address bar, and click "Markdownized".
    * Show a context menu, then choose the "sites.md" menu, click the "Markdownized" menu.
    * Using a shortcut of "Ctrl (Command) + Shift + P"
       * Of course, You can undo the page by ways above.

# Feature

Basically, sites.md markdown parser is based on [Github Flavored Markdown](https://help.github.com/articles/github-flavored-markdown) and [Markdown](http://daringfireball.net/projects/markdown/syntax).

So you can use `Code Syntax Highlight` like below.

``` javascript
function hoge(fuga) {
  var hogehoge = fuga.replase(/aaaa/, "bbbb");
  return hogehoge;
}
```

And supporting below syntax.

## Table of contents , TOC

If page contains below , sites.md create Table of contents like below, Please try it here :)

[TOC]

# Roadmap

* v1.0.0
  * Add all pages auto parsing by a URL that setting by the user.
  * Add auto parsing by some symbol that setting by the user.
  * More useful TOC

# Do you find an issue?

Please report [here](https://github.com/soundTricker/sites.md/issues).

# License

sites.md is [Open Source Software](https://github.com/soundTricker/sites.md) under the MIT License.