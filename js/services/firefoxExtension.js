// devtools singleton: minimal wrapper to needed devtools addon
// helpers:
//  - devtools.eval(code,cb): eval javascript code in the inspected window
//  - devtools.watchRefresh(cb): set inspected window refresh handler
var devtools = {
  connect: function() {
    // clear old requests weakmap
    // and refresh listeners set
    this._pendingRequests.clear();
    this._refreshListeners.clear();

    // hook receive function to the postMessage handlers
    var self = this;
    window.addEventListener("message", function(evt) {
      self._receive(evt);
    }, false);
  },
  watchRefresh: function (cb) {
    if (cb && typeof cb === "function") {
      this._refreshListeners.add(cb);
    }
  },
  eval: function (code, cb) {
    this._request("target-eval", cb, { code: code });
  },
  _pendingRequests: new Map(),
  _refreshListeners: new Set(),
  _watchRefreshCb: null,
  _genRequestId: function() {
    return Date.now() + Math.random().toString(16).slice(4);
  },
  _request: function (requestName, cb, data) {
    var id = this._genRequestId();
    var req = {
      cb: cb,
      msg: {
        id: id,
        requestName: requestName,
        data: data
      }
    };
    if (cb) {
      this._pendingRequests.set(id, req);
    }
    window.parent.postMessage(req.msg, "*");
  },
  _receive: function (evt) {
    var pendingRequests = this._pendingRequests;

    // handle inspected window refresh events
    if (evt.data.type === "refresh") {
      this._refreshListeners.forEach(function(cb) {
        cb(evt.data);
      });
      return;
    }

    // handle handle request with pending response handlers
    if (evt.data.id) {
      var id = evt.data.id;
      var req = pendingRequests.get(id);
      pendingRequests.delete(id);

      if (req && req.cb) {
        req.cb(evt.data.reply);
        return;
      }
    }
  }
};

devtools.connect();

// abstraction layer for Firefox Extension APIs
angular.module('panelApp').value('chromeExtension', {
  browserType: 'firefox',

  eval: function (fn, args, cb) {
    // with two args
    if (!cb && typeof args === 'function') {
      cb = args;
      args = {};
    } else if (!args) {
      args = {};
    }

    // NOTE: on Firefox we need to stringify the result of the
    // expression to be able to read it as json instead of
    // Mozilla "Remote Debugger Actors" instance
    devtools.eval('JSON.stringify(' +
      fn.toString() +
      '(window, ' +
      JSON.stringify(args) +
      '));', cb);
  },

  watchTargetTab: function (cb) {
    devtools.watchRefresh(cb);
  },

  sendRequest: function (requestName, cb) {
    console.log("sendRequest is deprecated and should not be used");
  }
});
