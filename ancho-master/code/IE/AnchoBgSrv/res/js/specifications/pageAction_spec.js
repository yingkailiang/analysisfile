var apiName = 'chrome.pageAction';


//------------------------------------------------------------
//          Types extracted for chrome.pageAction
//------------------------------------------------------------
var types = [
  {
    "id": "ImageDataType",
    "type" : "imagedata"
  }
]

//------------------------------------------------------------
//          Methods extracted for chrome.pageAction
//------------------------------------------------------------
var methods = [
  {
    "id": "show", 
    "items": [
      {
        "id": "tabId", 
        "required": true, 
        "type": "integer"
      }
    ], 
    "type": "functionArguments"
  }, 
  {
    "id": "hide", 
    "items": [
      {
        "id": "tabId", 
        "required": true, 
        "type": "integer"
      }
    ], 
    "type": "functionArguments"
  }, 
  {
    "id": "setTitle", 
    "items": [
      {
        "id": "details", 
        "properties": {
          "tabId": {
            "id": "tabId", 
            "required": true, 
            "type": "integer"
          }, 
          "title": {
            "id": "title", 
            "required": true, 
            "type": "string"
          }
        }, 
        "required": true, 
        "type": "object"
      }
    ], 
    "type": "functionArguments"
  }, 
  {
    "id": "getTitle", 
    "items": [
      {
        "id": "details", 
        "properties": {
          "tabId": {
            "id": "tabId", 
            "required": true, 
            "type": "integer"
          }
        }, 
        "required": true, 
        "type": "object"
      }, 
      {
        "id": "callback", 
        "required": true, 
        "type": "function"
      }
    ], 
    "type": "functionArguments"
  }, 
  {
    "id": "setIcon", 
    "items": [
      {
        "id": "details", 
        "properties": {
          "imageData": {
            "id": "imageData",
            "required": false,
            "type": [
              "ImageDataType",
              "object"
            ]
          },
          "path": {
            "id": "path", 
            "required": false, 
            "type": [
              "string",
              "object"
            ]
          }, 
          "tabId": {
            "id": "tabId", 
            "required": true, 
            "type": "integer"
          }
        }, 
        "required": true, 
        "type": "object"
      }, 
      {
        "id": "callback", 
        "required": false, 
        "type": "function"
      }
    ], 
    "type": "functionArguments"
  }, 
  {
    "id": "setPopup", 
    "items": [
      {
        "id": "details", 
        "properties": {
          "popup": {
            "id": "popup", 
            "required": true, 
            "type": "string"
          }, 
          "tabId": {
            "id": "tabId", 
            "required": true, 
            "type": "integer"
          }
        }, 
        "required": true, 
        "type": "object"
      }
    ], 
    "type": "functionArguments"
  }, 
  {
    "id": "getPopup", 
    "items": [
      {
        "id": "details", 
        "properties": {
          "tabId": {
            "id": "tabId", 
            "required": true, 
            "type": "integer"
          }
        }, 
        "required": true, 
        "type": "object"
      }, 
      {
        "id": "callback", 
        "required": true, 
        "type": "function"
      }
    ], 
    "type": "functionArguments"
  }
]

//------------------------------------------------------------
//          Event object types for chrome.pageAction
//------------------------------------------------------------
var eventTypes = [
  {
    "id": "onClicked.tab", 
    "required": true, 
    "type": "      (                tabs.Tab      )    "
  }
]



var typeChecking = require("typeChecking.js");
var validatorManager = typeChecking.validatorManager;

for (var i = 0; i < types.length; ++i) {
  validatorManager.addSpecValidatorWrapper(apiName + '.' + types[i].id, types[i]);
}

for (var i = 0; i < methods.length; ++i) {
  validatorManager.addSpecValidatorWrapper(apiName + '.' + methods[i].id, methods[i]);
}


