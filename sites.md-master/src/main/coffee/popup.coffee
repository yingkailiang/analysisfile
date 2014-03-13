'use strict'

angular.module('sites.md', ['ngSanitize','ui.bootstrap'])
  .run ["$rootScope", ($rootScope)->
    $rootScope.i18n = (key, args...)->
      if args.length > 0
        chrome.i18n.getMessage.apply chrome.i18n, [key].concat(args)
      else
        chrome.i18n.getMessage.apply chrome.i18n, [key]
  ]


$toggle = $("#toggle").on "click", ()->
  chrome.tabs.query {active: on, currentWindow: on}, (tabs)->
    chrome.tabs.sendMessage tabs[0].id, cmd: "toggle", (response)->
      console.log response

chrome.tabs.query {active: on, currentWindow: on}, (tabs)->
  chrome.tabs.sendMessage tabs[0].id, cmd: "isMarked", (response)->
    $toggle.prop "checked", response.marked

$("#toOptionPageLink").attr "href", chrome.extension.getURL("options.html")

$("#saveAutoSetting").click ()->
  $this = $(@).find("i")
  $this.removeClass('icon-save').addClass("icon-spinner icon-spin")
  chrome.tabs.query {active: on, currentWindow: on}, (tabs)->
    url = tabs[0].url
    setting = 
      name : "[Auto Marknized]URL contains #{url}"
      type : "url"
      auto : "on"
      expressionType : 'title'
      expressionText : url
    chrome.runtime.sendMessage {cmd : "add" , data : setting}, ()->
      $this.removeClass("icon-spinner icon-spin").addClass('icon-save')
      $("#msgBox")
        .find(".alert")
        .text("Saved auto marknized url")
        .addClass("alert-success")
      .end()
      .show()
      .delay(1000)
      .fadeOut(1000, ()->
        $(@).find(".alert")
        .text("")
        .removeClass("alert-success")
      )



$("#saveIgnoreSetting").click ()->
  $this = $(@).find("i")
  $this.removeClass('icon-save').addClass("icon-spinner icon-spin")
  chrome.tabs.query {active: on, currentWindow: on}, (tabs)->
    url = tabs[0].url
    setting = 
      name : "[Ignore]URL contains #{url}"
      type : "url"
      auto : "off"
      expressionType : 'title'
      expressionText : url
    chrome.runtime.sendMessage {cmd : "add" , data : setting}, ()->
      $this.removeClass("icon-spinner icon-spin").addClass('icon-save')
      $("#msgBox")
        .find(".alert")
        .text("Saved non-auto marknized url")
        .addClass("alert-success")
      .end()
      .show()
      .delay(1000)
      .fadeOut(1000, ()->
        $(@).find(".alert")
        .text("")
        .removeClass("alert-success")
      )

