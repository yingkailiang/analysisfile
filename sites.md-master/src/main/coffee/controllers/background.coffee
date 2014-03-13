angular.module('sites.md')
  .controller 'BackgroundCtrl', ['$scope','storage', ($scope, storage) ->
    chrome.runtime.onMessage.addListener (request, sender , callback)->
      return if request.cmd isnt 'get'
      storage.get(request.name).then (data)-> callback data
      return true

    chrome.runtime.onMessage.addListener (request, sender, callback)->
      return if request.cmd isnt 'add'
      storage.get("settings").then (data)->
        data = data || []
        console.log request.data
        data.push request.data
        storage.set("settings", data).then ()->callback()
      return true;

    chrome.runtime.onInstalled.addListener (details) ->
      console.log 'previousVersion', details.previousVersion

    chrome.tabs.onUpdated.addListener (tabId, changeInfo, tab)->
      return if !tab.url
      chrome.pageAction.show tabId if tab.url.indexOf("sites.google.com") > -1

    chrome.contextMenus.create
      type : "checkbox"
      id : "markdownized"
      title : "Markdownized"
      contexts : ["all"]
      onclick : (info, tab)->
        chrome.tabs.sendMessage tab.id, cmd: "toggle", (response)-> console.log response
      documentUrlPatterns : [
        "http://sites.google.com/*",
        "https://sites.google.com/*"
      ]
    chrome.contextMenus.create
      type : "normal"
      id : "addUrl"
      title : "Set this page's url as auto markdownized"
      contexts : ["all"]
      onclick : (info, tab)->
        url = tab.url
        setting = 
          name : "[Auto Marknized]URL contains #{url}"
          type : "url"
          auto : "on"
          expressionType : 'title'
          expressionText : url
        storage.get("settings").then (data)->
          data = data || []
          data.push setting
          storage.set("settings", data).then ()-> @
      documentUrlPatterns : [
        "http://sites.google.com/*",
        "https://sites.google.com/*"
      ]
    chrome.contextMenus.create
      type : "normal"
      id : "ignoreUrl"
      title : "Set this page's url as non-auto markdownized"
      contexts : ["all"]
      onclick : (info, tab)->
        url = tab.url
        setting = 
          name : "[Ignore]URL contains #{url}"
          type : "url"
          auto : "off"
          expressionType : 'title'
          expressionText : url
        storage.get("settings").then (data)->
          data = data || []
          data.push setting
          storage.set("settings", data).then ()-> @
      documentUrlPatterns : [
        "http://sites.google.com/*",
        "https://sites.google.com/*"
      ]

    chrome.contextMenus.create
      type : "normal"
      id : "addText"
      title : "Set auto markdownized, page contains this text"
      contexts : ["selection"]
      onclick : (info, tab)->
        setting = 
          name : "[Auto Marknized]Page contains #{info.selectionText}"
          type : "contents"
          auto : "on"
          expressionType : 'page_content'
          expressionText : info.selectionText
        storage.get("settings").then (data)->
          data = data || []
          data.push setting
          storage.set("settings", data).then ()-> @
      documentUrlPatterns : [
        "http://sites.google.com/*",
        "https://sites.google.com/*"
      ]

    chrome.contextMenus.create
      type : "normal"
      id : "ignoreText"
      title : "Set non-auto markdownized, page contains this text"
      contexts : ["selection"]
      onclick : (info, tab)->
        setting = 
          name : "[Ignore]Page contains #{info.selectionText}"
          type : "contents"
          auto : "off"
          expressionType : 'page_content'
          expressionText : info.selectionText
        storage.get("settings").then (data)->
          data = data || []
          data.push setting
          storage.set("settings", data).then ()-> @
      documentUrlPatterns : [
        "http://sites.google.com/*",
        "https://sites.google.com/*"
      ]


    chrome.runtime.onMessage.addListener (request, sender , callback)->
      return if request.cmd isnt 'updateValue'
      chrome.contextMenus.update "markdownized",
        checked : request.marked      
  ]

