(function() {

  var Cc = Components.classes;
  var Ci = Components.interfaces;
  var Cu = Components.utils;
  var Cr = Components.results;

  Cu.import('resource://gre/modules/Services.jsm');
  var Event = require('./events').Event;
  var SynchronousEvent = require('./events').SynchronousEvent;
  var Utils = require('./utils');
  var Global = require('./state').Global;
  var DebugData = require('./debuggerData');

  var HTTP_ON_MODIFY_REQUEST = 'http-on-modify-request';
  var HTTP_ON_EXAMINE_RESPONSE = 'http-on-examine-response';
  var HTTP_ON_EXAMINE_CACHED_RESPONSE = 'http-on-examine-cached-response';

  var HTTP_STATUS_NOT_MODIFIED = 304;

  var BinaryInputStream = Components.Constructor('@mozilla.org/binaryinputstream;1', 'nsIBinaryInputStream');
  var StorageStream = Components.Constructor('@mozilla.org/storagestream;1', 'nsIStorageStream');
  var BinaryOutputStream = Components.Constructor('@mozilla.org/binaryoutputstream;1', 'nsIBinaryOutputStream');


  /* Exported: instance of HttpRequestObserver */

  function HttpRequestObserver() {
    // request map
    // tabId --> URI --> { request info }
    this._requests = {};

    this._httpActivityDistributor =
        Cc['@mozilla.org/network/http-activity-distributor;1']
        .getService(Ci.nsIHttpActivityDistributor);
  }

  HttpRequestObserver.prototype.register = function() {
    // webRequest API
    this.onCompleted = new Event(Global, 'webRequest.completed');
    this.onHeadersReceived = new SynchronousEvent(Global, 'webRequest.headersReceived');
    this.onBeforeRedirect = new Event(Global, 'webRequest.beforeRedirect');
    this.onAuthRequired = new SynchronousEvent(Global, 'webRequest.authRequired');
    this.onBeforeSendHeaders = new SynchronousEvent(Global, 'webRequest.beforeSendHeaders');
    this.onErrorOccurred = new Event(Global, 'webRequest.errorOccurred');
    this.onResponseStarted = new Event(Global, 'webRequest.responseStarted');
    this.onSendHeaders = new Event(Global, 'webRequest.sendHeaders');
    this.onBeforeRequest = new SynchronousEvent(Global, 'webRequest.beforeRequest');

    // debugger API
    this.onEvent  = new Event(Global, 'debugger.event');
    this.onDetach = new Event(Global, 'debugger.detach');

    // observer (i.e. instance of this class) registration
    Services.obs.addObserver(this, HTTP_ON_MODIFY_REQUEST, false);
    Services.obs.addObserver(this, HTTP_ON_EXAMINE_RESPONSE, false);
    Services.obs.addObserver(this, HTTP_ON_EXAMINE_CACHED_RESPONSE, false);
    this._httpActivityDistributor.addObserver(this);
  };

  HttpRequestObserver.prototype.unregister = function() {
    Services.obs.removeObserver(this, HTTP_ON_MODIFY_REQUEST);
    Services.obs.removeObserver(this, HTTP_ON_EXAMINE_RESPONSE);
    Services.obs.removeObserver(this, HTTP_ON_EXAMINE_CACHED_RESPONSE);
    this._httpActivityDistributor.removeObserver(this);
  };

  /* nsIObserver::observe() */
  HttpRequestObserver.prototype.observe = function(aSubject, aTopic, aData) {

    var httpChannel = aSubject.QueryInterface(Ci.nsIHttpChannel);

    var uri = httpChannel.URI;
    if (!uri) {
      return;
    }

    var loadContext = Utils.getLoadContext(httpChannel);
    if (!loadContext) {
      return;
    }

    var win;
    try {
      win = loadContext.associatedWindow;
    } catch (e) {
      dump('Warning: ' + JSON.stringify(e) + '\n');
      return;
    }

    if (aTopic === HTTP_ON_MODIFY_REQUEST) {
      this.handleOnModifyRequest(aTopic, httpChannel, win);
    } else if ( (aTopic === HTTP_ON_EXAMINE_RESPONSE) ||
                (aTopic === HTTP_ON_EXAMINE_CACHED_RESPONSE) ) {
      this.handleOnExamineResponse(aTopic, httpChannel, win);
    }
  };

  /* nsIHttpActivityObserver::observeActivity() */
  HttpRequestObserver.prototype.observeActivity = function(aHttpChannel,
      aActivityType, aActivitySubtype, aTimestampMicrosecs, aExtraSizeData,
      aExtraStringData) {
    if (!aHttpChannel.URI) {
      return;
    }
    var url = aHttpChannel.URI.spec;
    var requestData = this._getRequestByUri(Utils.removeFragment(url));
    if (!requestData) {
      return;
    }

    var nsIHttpActivityObserver = Ci.nsIHttpActivityObserver;
    var nsISocketTransport = Ci.nsISocketTransport;

    // we want milliseconds, not microseconds
    var aTimestamp = Math.round(aTimestampMicrosecs / 1000);

    switch (aActivitySubtype) {
      case nsISocketTransport.STATUS_RESOLVING:
        requestData.timing.resolving = aTimestamp;
        break;

      case nsISocketTransport.STATUS_CONNECTING_TO:
        requestData.timing.connecting = aTimestamp;
        break;

      case nsISocketTransport.STATUS_CONNECTED_TO:
        requestData.timing.connected = aTimestamp;
        break;

      case nsISocketTransport.STATUS_SENDING_TO:
        if (!requestData.timing.sending) {
          requestData.timing.sending = aTimestamp;
        }
        break;

      case nsISocketTransport.STATUS_WAITING_FOR:
        requestData.timing.waiting = aTimestamp;
        break;

      case nsISocketTransport.STATUS_RECEIVING_FROM:
        if (!requestData.timing.receiving) {
          requestData.timing.receiving = aTimestamp;
        }
        break;

      case nsIHttpActivityObserver.ACTIVITY_SUBTYPE_TRANSACTION_CLOSE:
        requestData.timing.end = aTimestamp;
        break;

      case nsIHttpActivityObserver.ACTIVITY_SUBTYPE_REQUEST_HEADER:
        requestData.timing.started = aTimestamp;
        var pos = aExtraStringData.indexOf('\n');
        if (pos !== -1) {
          requestData.requestLine = aExtraStringData.substr(0, pos-1);
        } else {
          requestData.requestLine = aExtraStringData;
        }
        break;

      case nsIHttpActivityObserver.ACTIVITY_SUBTYPE_RESPONSE_HEADER:
        var pos = aExtraStringData.indexOf('\n');
        if (pos !== -1) {
          requestData.responseLine = aExtraStringData.substr(0, pos-1);
        } else {
          requestData.responseLine = aExtraStringData;
        }
        break;

      /*
      case nsIHttpActivityObserver.ACTIVITY_SUBTYPE_RESPONSE_COMPLETE:
        awlog.debug('ACTIVITY_SUBTYPE_RESPONSE_COMPLETE (' + request.URISpec
            + '): ' + aTimestamp);
        // Received a complete HTTP response.
        request.bytesReceived += aExtraSizeData;
        request.data.top.bytesReceived += aExtraSizeData;
        awlog.debug('EXTRA STRING DATA (resp complete): ' + aExtraStringData);
        break;


      case nsIHttpActivityObserver.ACTIVITY_SUBTYPE_REQUEST_BODY_SENT:
        awlog.debug('ACTIVITY_SUBTYPE_REQUEST_BODY_SENT (' + request.URISpec
            + '): ' + aTimestamp);
        break;
      */
      default:
        break;
    }
  };

  HttpRequestObserver.prototype._getFrameIds = function(win) {
    var self = this;
    // helper functions
    // for inner window
    function getElementId(win) {
      if (!win.frameElement.__apicaWID) {
        try {
          win.frameElement.__apicaWID = Global.getGlobalId('webRequest.frameId');
        } catch (e) {
          dump('Warning: ' + JSON.stringify(e) + '\n');
        }
      }
      return win.frameElement.__apicaWID;
    }
    // for any window
    function getFrameId(win) {
      if (win === win.parent) {
        return 0;
      } else {
        return getElementId(win);
      }
    }

    var res = {};
    res.me = getFrameId(win);
    if (0 === res.me) {
      res.parent = -1;
    } else {
      res.parent = getFrameId(win.parent);
    }

    return res;
  };

  HttpRequestObserver.prototype.handleOnModifyRequest = function(topic, httpChannel, win) {
    var url = httpChannel.URI.spec;
    var referrer  = httpChannel.referrer ? httpChannel.referrer.spec : '';
    var tabId = win.top ? Utils.getWindowId(win.top) : -1;
    var frameIds = this._getFrameIds(win);
    var loadFlags = httpChannel.loadFlags;

    var requestData = this._getRequest(tabId, Utils.removeFragment(url));
    var requestId = requestData
                    ? requestData.requestId
                    : Global.getGlobalId('webRequest.requestId');

    var type = 'other';

    // set extra headers (debugger API)
    var extraHeaders = DebugData.getProperty(tabId, 'extraHttpHeaders');
    if (extraHeaders) {
      for (var key in extraHeaders) {
        httpChannel.setRequestHeader(key, extraHeaders[key], false);
      }
    }

    // is it main request of the tab?
    if (loadFlags & Ci.nsIChannel.LOAD_DOCUMENT_URI) {
      if (0 === frameIds.me) {
        type = 'main_frame';
        this._flagTab(tabId, {
          requestId: requestId,
          watching: false
        });
      } else {
        type = 'sub_frame';
      }
    }

    var tabFlag = this._flagTab(tabId);

    if (('' !== referrer) && !tabFlag) {
      type = 'xmlhttprequest';
    }

    // is it request for an image? there is no direct way, from debugging
    // experience image requests usually have loadFlags === 0 or contain
    // LOAD_INITIAL_DOCUMENT_URI flag. But sometimes it also contains other flags.
    // Therefore there is also check for Accept header, which should ensure
    // that browser wants an image.
    // Ci.nsIRequest.LOAD_FROM_CACHE => after refresh button is clicked
    if (   loadFlags === 0
        || loadFlags & Ci.nsIChannel.LOAD_INITIAL_DOCUMENT_URI
        || loadFlags === Ci.nsIRequest.LOAD_FROM_CACHE) {
      var accept = httpChannel.getRequestHeader('Accept');
      if (accept && 0 === accept.indexOf('image/')) {
        type = 'image';
      }
    }

    // TODO: recognize other types: stylesheet, script, object

    // http://code.google.com/chrome/extensions/webRequest.html#event-onBeforeRequest
    var params = {
      tabId : tabId,
      url : url,
      timeStamp: (new Date()).getTime(),
      requestId: requestId,
      frameId: frameIds.me,
      parentFrameId: frameIds.parent,
      type : type,
      method: httpChannel.requestMethod,
      timing: {}
    };

    params.timing.started = params.timeStamp;

    // store the request
    this._setRequest(tabId, Utils.removeFragment(url), params);

    // helper function: test if the request should be cancelled,
    // if so: cancel and remove the request from the request list
    function resultCancelledRequest(results, context) {
      for (var i = 0; i < results.length; i++) {
        if (results[i] && results[i].cancel) {
          httpChannel.cancel(Cr.NS_BINDING_ABORTED);
          context._setRequest(tabId, Utils.removeFragment(url), null);
          params.error = 'REQUEST_CANCELLED_BY_EXTENSION';
          context.onErrorOccurred.fire([ params ]);
          if (DebugData.getProperty(tabId, 'networkMonitor')) {
            var data = {
              timestamp: params.timeStamp / 1000,
              requestId: params.requestId
            };
            context.onEvent.fire([ { tabId: tabId }, 'Network.loadingFailed', data ]);
          }
          return true;
        }
      }
      return false;
    }

    // fire 'Network.requestWillBeSent'
    if (DebugData.getProperty(tabId, 'networkMonitor')) {
      var data = {
        timestamp: params.timeStamp / 1000,
        requestId: params.requestId,
        request: {
          url: url,
          method: params.method
        },
        // NON-STANDARD NOTIFICATION PROPERTIES BORROWED FROM onBeforeRequest
        type: params.type,
        parentFrameId: params.parentFrameId,
        frameId: params.frameId
      };
      this.onEvent.fire([ { tabId: tabId }, 'Network.requestWillBeSent', data ]);
    }

    // fire onBeforeRequest; TODO: implement redirection
    var results = this.onBeforeRequest.synchronousFire([ params ]);
    if (resultCancelledRequest(results, this)) {
      return;
    }

    var visitor = new HttpHeaderVisitor();
    httpChannel.visitRequestHeaders(visitor);

    // fire onBeforeSendHeaders; TODO: implement changing the request headers
    params.timeStamp = (new Date()).getTime();
    params.requestHeaders = visitor.headers;
    results = this.onBeforeSendHeaders.synchronousFire([ params ]);
    if (resultCancelledRequest(results, this)) {
      return;
    }

    // fire onSendHeaders;
    // TODO: possibly include request body,
    // legacy code: firefox/components/apicawatch.js:535
    params.timeStamp = (new Date()).getTime();
    this.onSendHeaders.fire([ params ]);

    // watch the document being loaded. when complete, reset the tab flags, so
    // subsequent HTTP requests are recognized as xmlhttprequests
    if (win.document && ('complete' !== win.document.readyState) &&
        tabFlag && !tabFlag.watching) {
      var self = this;
      self._flagTab(tabId, {
        requestId: tabFlag.requestId,
        watching: true
      });
      win.document.addEventListener('readystatechange', function() {
        if ('complete' === win.document.readyState) {
          win.document.removeEventListener('readystatechange', arguments.callee, false);
          self._flagTab(tabId, null);
        }
      });
    }

    // dispatching dedicated listening thread for onStopRequest and onDataAvailable events
    //
    // the new thread is needed (i.e. we cannot simply set new stream listener
    // on the HTTP channel directly) because of this Firefox bug:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=646370
    var mainThread = Cc['@mozilla.org/thread-manager;1'].getService().mainThread;
    mainThread.dispatch(new ListenerThread({
        id: tabId,
        uri: Utils.removeFragment(url),
        monitor: this
      }, httpChannel),
      Ci.nsIThread.DISPATCH_NORMAL
    );
  };

  HttpRequestObserver.prototype._transformHeaders = function(headers) {
    var result = {};
    for (var i = 0; i < headers.length; i++) {
      var item = headers[i];
      result[item.name] = item.value;
    }
    return result;
  };

  HttpRequestObserver.prototype._headers2line = function(firstLine, headers) {
    var line = firstLine + '\r\n';
    for (var i = 0; i < headers.length; i++) {
      var item = headers[i];
      line = line + item.name + ': ' + item.value + '\r\n';
    }
    return line + '\r\n';
  };

  HttpRequestObserver.prototype.handleOnExamineResponse = function(topic, httpChannel, win) {
    var url = httpChannel.URI.spec;
    var tabId = win.top ? Utils.getWindowId(win.top) : -1;

    var params = this._getRequest(tabId, Utils.removeFragment(url));
    if (!params) {
      // we are not monitoring this request
      return;
    }

    var responseVisitor = new HttpHeaderVisitor();
    httpChannel.visitResponseHeaders(responseVisitor);

    var requestVisitor = new HttpHeaderVisitor();
    httpChannel.visitRequestHeaders(requestVisitor);

    var statusCode = httpChannel.responseStatus;
    var statusText = httpChannel.responseStatusText;

    params.url = url;
    params.timeStamp = (new Date()).getTime();
    params.responseHeaders = responseVisitor.headers;
    params.statusLine = '' + statusCode + ' ' + statusText;

    // fire onHeadersReceived
    var results = this.onHeadersReceived.synchronousFire([ params ]);

    params.statusCode = statusCode;
    params.fromCache = (HTTP_ON_EXAMINE_CACHED_RESPONSE === topic);

    if (DebugData.getProperty(tabId, 'networkMonitor')) {
      var data = {
        timestamp: params.timeStamp / 1000,
        requestId: params.requestId
      };
      if (params.fromCache) {
        this.onEvent.fire([ { tabId: tabId }, 'Network.requestServedFromCache', data ]);
      }
      data.type = params.type;
      if ('xmlhttprequest' === data.type) {
        data.type = 'XHR';
      }
      data.response = {
        requestHeaders: this._transformHeaders(requestVisitor.headers),
        headers: this._transformHeaders(responseVisitor.headers),
        mimeType: 'n/a',
        status: statusCode,
        statusText: statusText,
        timing: {
          requestTime: params.timing.started / 1000,
          dnsStart: -1,
          dnsEnd: -1,
          connectStart: -1,
          connectEnd: -1,
          sendStart: -1,
          sendEnd: -1,
          receiveHeadersEnd: -1,
          // we don't use / set:
          proxyStart: -1,
          proxyEnd: -1,
          sslStart: -1,
          sslEnd: -1
        },
        connectionReused: true
      };

      // NON-STANDARD NOTIFICATION PROPERTIES:
      data.request = {
        url: params.url
      };
      // ---

      try {
        data.response.mimeType = httpChannel.getResponseHeader('Content-Type');
      } catch (e) {
        // pass, the Content-Type header not set, using default value 'n/a'
      }

      if (params.timing.resolving || params.timing.connecting) {
        data.response.connectionReused = false;
      }

      if (params.timing.resolving) {
        data.response.timing.dnsStart = params.timing.resolving - params.timing.started;
      }

      if (params.timing.connecting) {
        data.response.timing.dnsEnd = data.response.timing.connectStart =
          params.timing.connecting - params.timing.started;
      }

      if (params.timing.connected) {
        data.response.timing.connectEnd = params.timing.connected - params.timing.started;
      }

      if (params.timing.sending) {
        data.response.timing.sendStart = params.timing.sending - params.timing.started;
      }

      if (params.timing.waiting) {
        data.response.timing.sendEnd = params.timing.waiting - params.timing.started;
      }

      if (params.timing.receiving) {
        data.response.timing.receiveHeadersEnd = params.timing.receiving - params.timing.started;
      }

      data.response.headersText = this._headers2line(
        params.responseLine,
        responseVisitor.headers
      );
      data.response.requestHeadersText = this._headers2line(
        params.requestLine,
        requestVisitor.headers
      );

      this.onEvent.fire([ { tabId: tabId }, 'Network.responseReceived', data ]);
    }

    // TODO: get IP address of the remote server
    // params.ip = ???

    // fire onBeforeRedirect
    var redirected = (statusCode >= 300 && statusCode < 400) && (statusCode != HTTP_STATUS_NOT_MODIFIED);
    if (redirected) {
      params.timeStamp = (new Date()).getTime();
      params.redirectUrl = httpChannel.getResponseHeader('Location');
      this._setRequest(tabId, Utils.removeFragment(url), null);
      this._setRequest(tabId, Utils.removeFragment(params.redirectUrl), params);
      this.onBeforeRedirect.fire([ params ]);
      return;
    }

    // TODO: fire onAuthRequired

    // terminating leg
    this._setRequest(tabId, Utils.removeFragment(url), params);

    // fire onResponseStarted
    params.timeStamp = (new Date()).getTime();
    this.onResponseStarted.fire([ params ]);
  };

  // get request-related data
  HttpRequestObserver.prototype._getRequest = function(tabId, uri) {
    if (!(tabId in this._requests)) {
      return null;
    }
    return this._requests[tabId][uri];
  };

  // variation of _getRequest, just we don't know tabId here...
  HttpRequestObserver.prototype._getRequestByUri = function(uri) {
    for (var tabId in this._requests) {
      if (uri in this._requests[tabId]) {
        return this._requests[tabId][uri];
      }
    }
    return null;
  };

  // store or delete (request === null) request-related data
  HttpRequestObserver.prototype._setRequest = function(tabId, uri, request) {
    var tab = this._requests[tabId];
    if (!tab) {
      tab = this._requests[tabId] = {};
    }
    if (!request) {
      delete tab[uri];
    } else {
      tab[uri] = request;
    }
    return request;
  };

  // get (`flag` parameter missing) or set tab flag
  HttpRequestObserver.prototype._flagTab = function(tabId, flag) {
    var tab = this._requests[tabId];
    if (!tab) {
      tab = this._requests[tabId] = {};
    }
    if ('undefined' !== typeof(flag)) {
      tab.flag = flag;
    }
    return tab.flag;
  };


  // --------------
  // Helper classes
  // --------------


  /* HttpHeaderVisitor */

  function HttpHeaderVisitor() {
    this.headers = [];
    this.originalHeaders = [];
  };

  HttpHeaderVisitor.prototype.visitHeader = function(aHeader, aValue) {
    this.headers.push({
      name : aHeader,
      value : aValue
    });
    this.originalHeaders.push({
      name : aHeader,
      value : aValue
    });
  };


  /* ListenerThread */

  // Thread listening on a request, created in HttpRequestObserver::handleOnModifyRequest().
  // It attaches an StreamListener (defined below) to provided HTTP `channel`.

  function ListenerThread(requestData, channel) {
    this.requestData = requestData;
    this.channel = channel;
  }

  ListenerThread.prototype.run = function() {
    var listener = new StreamListener(this.requestData);
    var origListener = this.channel
      .QueryInterface(Ci.nsITraceableChannel)
      .setNewListener(listener);
    if (origListener) {
      listener.setOriginalListener(origListener);
    }
  };

  ListenerThread.prototype.QueryInterface = function(iid) {
    if (iid.equals(Ci.nsIRunnable) || iid.equals(Ci.nsISupports)) {
      return this;
    }
    throw Cr.NS_ERROR_NO_INTERFACE;
  };


  /* StreamListener */

  // Class listening for events on a http request.

  function StreamListener(requestData) {
    this.requestData = requestData;
    this.originalListener = null;
    this.receivedData = [];
  }

  StreamListener.prototype.setOriginalListener = function(listener) {
    this.originalListener = listener;
  };

  // nsIRequestObserver::onStartRequest
  StreamListener.prototype.onStartRequest = function(request, context) {
    // dump('+++ StreamListener.onStartRequest()\n');
    return this.originalListener.onStartRequest(request, context);
  };

  //  nsIRequestObserver::onStopRequest
  StreamListener.prototype.onStopRequest = function(request, context, statusCode) {

    var data = this.requestData.monitor._getRequest(
        this.requestData.id,
        this.requestData.uri
      );
    if (data) {
      data.timeStamp = (new Date()).getTime();
      this.requestData.monitor._setRequest(this.requestData.id, this.requestData.uri, null);
      switch (statusCode) {
        case Cr.NS_OK:
          // fire onCompleted
          this.requestData.monitor.onCompleted.fire([ data ]);
          if (DebugData.getProperty(data.tabId, 'networkMonitor')) {
            var debuggerData = {
              timestamp: data.timeStamp / 1000,
              requestId: data.requestId
            };
            this.requestData.monitor.onEvent.fire([
              { tabId: data.tabId },
              'Network.loadingFinished',
              debuggerData
            ]);
          }
          break;

        case Cr.NS_BINDING_REDIRECTED:
          // handleOnExamineResponse() already took care about onBeforeRedirect event
          break;

        default:
          // TODO:
          // this code is not invoked in some cases, e.g. for <script> tags
          // with invalid 'src'.  so need to investigate:
          // (a) what errors are covered here, and
          // (b) how to cover the remaining ones we need.
          data.error = Utils.mapHttpError(statusCode);
          this.requestData.monitor.onErrorOccurred.fire([ data ]);
          if (DebugData.getProperty(data.tabId, 'networkMonitor')) {
            var debuggerData = {
              timestamp: data.timeStamp / 1000,
              requestId: data.requestId
            };
            this.requestData.monitor.onEvent.fire([
              { tabId: data.tabId },
              'Network.loadingFailed',
              debuggerData
            ]);
          }
          break;
      }
    }

    return this.originalListener.onStopRequest(request, context, statusCode);
  };

  // nsIStreamListener::onDataAvailable
  StreamListener.prototype.onDataAvailable = function(request,
        context, stream, offset, count) {

    var binaryInputStream = new BinaryInputStream();
    var storageStream = new StorageStream();
    var binaryOutputStream = BinaryOutputStream();

    binaryInputStream.setInputStream(stream);
    storageStream.init(8192, count, null);
    binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));

    var data = binaryInputStream.readBytes(count);
    binaryOutputStream.writeBytes(data, count);

    this.receivedData.push(data);

    // report count
    var data = this.requestData.monitor._getRequest(
        this.requestData.id,
        this.requestData.uri
      );
    if (data) {
      data.timeStamp = (new Date()).getTime();
      if (DebugData.getProperty(data.tabId, 'networkMonitor')) {
        var debuggerData = {
          timestamp: data.timeStamp / 1000,
          requestId: data.requestId,
          dataLength: count
        };
        this.requestData.monitor.onEvent.fire([
          { tabId: data.tabId },
          'Network.dataReceived',
          debuggerData
        ]);
      }
    }

    // let other listeners use the stream
    var stream = storageStream.newInputStream(0);

    return this.originalListener.onDataAvailable(request, context, stream, offset, count);
  }



  //-------------
  // EXPORT PART
  //-------------

  var singleton = new HttpRequestObserver();
  module.exports = singleton;

}).call(this);
