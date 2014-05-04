/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { Cu } = require("chrome");

Cu.import("resource:///modules/devtools/gDevTools.jsm");

const self = require("sdk/self");

const VARIABLES_VIEW_URL = "chrome://browser/content/devtools/widgets/VariablesView.xul";

Cu.import("resource:///modules/devtools/VariablesView.jsm");
Cu.import("resource:///modules/devtools/VariablesViewController.jsm");

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "EnvironmentClient",
   "resource://gre/modules/devtools/dbg-client.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "ObjectClient",
   "resource://gre/modules/devtools/dbg-client.jsm");

var Promise = require("sdk/core/promise");

const addonSidebarsDefs = new Map();

exports.unregisterInspectorSidebar = function (sidebarId) {
  addonSidebarsDefs.delete(sidebarId);

  for (let toolbox of gDevTools._toolboxes.values()) {
    let inspector = toolbox.getPanel("inspector");
    if (inspector) {
      let tab = inspector.sidebar.getTab(sidebarId);

      if (inspector.sidebar.getCurrentTabID() === sidebarId) {
        inspector.sidebar.select(inspector.sidebar._tabs.keys().next().value);
      }

      let tab_header = inspector.sidebar._tabs.get(sidebarId);
      let tab_panel = inspector.sidebar.getTab(sidebarId);
      tab_header.parentNode.removeChild(tab_header);
      tab_panel.parentNode.removeChild(tab_panel);
    }
  }
};

exports.registerInspectorSidebar = function(sidebarDefinition) {
  addonSidebarsDefs.set(sidebarDefinition.id, sidebarDefinition);
};

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

gDevTools.on("inspector-ready", (evtType, toolbox, inspectorPanel) => {
  console.log(evtType, arguments);

  addonSidebarsDefs.forEach(function(sidebarDef) {
    buildInspectorSidebar(inspectorPanel, sidebarDef);
  });
});

function buildInspectorSidebar(panel, { id, label, evaluatedJavascriptFun }) {
  let target = panel._target;
  console.log("BUILDING SIDEBAR", id);
  panel.sidebar.addTab(id, VARIABLES_VIEW_URL, false);
  panel.sidebar.on(id + "-ready", function initAddonSidebar() {
    let tab = panel.sidebar._tabs.get(id);
    let window = panel.sidebar.getWindowForTab(id);
    let container = window.document.querySelector("#variables");

    console.log("SIDEBAR TAB", tab);

    tab.setAttribute("label", label);

    let variablesView = new VariablesView(container, {
      searchEnabled: true,
      searchPlaceholder: "Search..."
    });

    consoleFor(target).then( ({webconsoleClient, debuggerClient}) => {
      VariablesViewController.attach(variablesView, {
        getEnvironmentClient: aGrip => {
          return new EnvironmentClient(debuggerClient, aGrip);
        },
        getObjectClient: aGrip => {
          return new ObjectClient(debuggerClient, aGrip);
        },
        getLongStringClient: aActor => {
          return webConsoleClient.longString(aActor);
        },
        releaseActor: aActor => {
          debuggerClient.release(aActor);
        }
      });

      patchVariablesViewController(variablesView.controller);

      panel.selection.on("new-node", onNewNode);
      panel.sidebar.on(id + "-selected", onNewNode);

      window.addEventListener("unload", function unloadSidebar() {
        console.log("UNLOADING SIDEBAR ADDON....");
        if (panel) {
          panel.selection.off("new-node", onNewNode);
          panel.sidebar.off(id + "-selected", onNewNode);
          panel.sidebar.off(id + "-ready", initAddonSidebar);
        }
        console.log("UNLOADED SIDEBAR ADDON.");
      }, false);

      function onNewNode() {
        webconsoleClient.evaluateJS(
          "(" + evaluatedJavascriptFun.toString() + ")();",
          (res) => {
            // refresh variables view
            console.log("evaluateJS result", res);
            let options = { objectActor: res.result };
            let view = variablesView;
            view.empty();
            view.controller.setSingleVariable(options).expanded;
          });
      }
    });

  });

  return panel;
}

// NOTE: needed to support firefox XX
function patchVariablesViewController(controller) {
  if (controller.setSingleVariable) {
    return;
  }

  controller.setSingleVariable = function(aOptions) {
    this.view.empty();
    let scope = this.view.addScope(aOptions.label);
    scope.expanded = true;
    scope.locked = true;

    let variable = scope.addItem();
    let expanded;
    if (aOptions.objectActor) {
      expanded = this.expand(variable, aOptions.objectActor);
    } else if (aOptions.rawObject) {
      variable.populate(aOptions.rawObject, { expanded: true });
      expanded = promise.resolve();
    }

    return { variable: variable, expanded: expanded };
  };
}
