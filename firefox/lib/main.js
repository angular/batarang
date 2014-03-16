var { Cu, Cc, Ci } = require("chrome");

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

// Register DevTools Tab

Cu.import("resource:///modules/devtools/gDevTools.jsm");

let devtoolTabDefinition = require("./devtool-panel").devtoolTabDefinition;

function startup() {
  gDevTools.registerTool(devtoolTabDefinition);
}

function shutdown() {
  gDevTools.unregisterTool(devtoolTabDefinition);
}

startup();

exports.onUnload = function() {
  shutdown();
};
