const { Class } = require("sdk/core/heritage");
const self = require("sdk/self");
var Promise = require("sdk/core/promise");

const Tab = require("sdk/tabs/tab-firefox").Tab;

const {
  registerInspectorSidebar,
  unregisterInspectorSidebar
} = require("register-sidebar-addons");

const { Cu } = require("chrome");

let { get: getPref } = require("sdk/preferences/service")

let prefs = require("sdk/preferences/event-target").PrefsTarget({
});

prefs.on("devtools.angular-batarang.enabled", function (name) {
  let enabled = getPref(name);
  console.log("DEVTOOLS ANGULAR TOGGLED", enabled);

  if (enabled) {
    activateSidebar();
  } else {
    deactivateSidebar();
  }
});

function deactivateSidebar() {
  unregisterInspectorSidebar("angular-batarang");
}

function activateSidebar() {
  registerInspectorSidebar({
    id: "angular-batarang",
    label: "AngularJS",
    evaluatedJavascriptFun: function getAngularPanelContents() {
      if (window.angular && $0) {
        // TODO: can we move this scope export into
        // updateElementProperties
        var scope = window.angular.element($0).scope();
        // Export $scope to the console
        window.$scope = scope;
        return (function (scope) {
          var panelContents = {
            __private__: {}
          };

          for (prop in scope) {
            if (scope.hasOwnProperty(prop)) {
              if (prop.substr(0, 2) === '$$') {
                panelContents.__private__[prop] = scope[prop];
              } else {
                panelContents[prop] = scope[prop];
              }
            }
          }
          return panelContents;
        }(scope));
      } else {
        return {};
      }
    }
  });
}

exports.devtoolTabDefinition = {
  id: "angular-batarang",
  ordinal: 7,
  icon: self.data.url("img/webstore-icon.png"),
  url: self.data.url("devtool-panel.html"),
  label: "AngularJS",
  tooltip: "AngularJS Batarang",

  isTargetSupported: function(target) {
    return target.isLocalTab;
  },

  build: function(iframeWindow, toolbox) {
    // init devtool tab
    let panelInstance = new AngularBatarang(iframeWindow,
                                            toolbox);
    return Promise.resolve(panelInstance);
  }
};

var pageMod = require("sdk/page-mod");

var angularPageMod = pageMod.PageMod({
  include: "*",
  contentScriptFile: self.data.url("js/inject/debug.js"),
  contentScriptWhen: 'start',
  attachTo: ["existing", "top"],
  onAttach: function(worker) {
    console.log("attached to: " + worker.tab.url);
  }
});

let AngularBatarang = Class({
  initialize: function(frame, toolbox) {
    this.outerFrame = frame;
    this.innerFrame = frame.document.querySelector("iframe");
    this.toolbox = toolbox;

    this.tab = Tab({
      tab: toolbox._target.tab,
    });

    this.tab.on('ready', () => {
      console.log("TAB IS READY");
      this.innerFrame.contentWindow.postMessage({
        type: 'refresh'
      }, "*");
    });

    this.outerFrame.addEventListener("message", this._onDevtoolPanelMessage.bind(this),
                                     false);
  },
  destroy: function() {
    this.outerFrame.removeEventListener("message", this._onDevtoolPanelMessage, false);
  },

  _onDevtoolPanelMessage: function(evt) {
    //console.log("DEVTOOL REQUEST", evt);

    switch (evt.data.requestName) {
    case "target-eval":
      consoleFor(this.toolbox._target).then( ({webconsoleClient}) => {
        evaluateJavascript(webconsoleClient,
                           evt.data.data.code,
                           self.data.url("panel.html")).
          then( (result) => {
            try {
              if (typeof result == "string") {
                result = JSON.parse(result);
              } else {
                if (result && result.type == "undefined") {
                  result = null;
                }
              }
            } catch(e) {
              console.log("ERROR PARSING", result, e);
              result = null;
            }

            this.innerFrame.contentWindow.postMessage({
              id: evt.data.id,
              reply: result
            }, "*");
          })
      }).then(null, (err) => console.log("FAILED1", err.toString()) );
      break;
    default:
      console.log("UNKNOWN REQUEST", evt.data.requestName);
    }
  }
});

function evaluateJavascript(webconsoleClient, javascriptCode, javascriptURL) {
  let deferred = Promise.defer();

  webconsoleClient.evaluateJS(javascriptCode, (res) => {
    // TODO: handle errors and exceptions
    deferred.resolve(res.result);
  }, { url: javascriptURL });

  return deferred.promise;
}

function consoleFor(target) {
  let consoleActor = target.form.consoleActor;
  let client = target.client;

  let deferred = Promise.defer();

  client.attachConsole(consoleActor, [], (res, webconsoleClient) => {
    if (res.error) {
      console.log("attachConsole error", res.error);
      deferred.reject(res.error);
    } else {
      deferred.resolve({
        webconsoleClient: webconsoleClient,
        debuggerClient: client
      });
    }
  });

  return deferred.promise;
}
