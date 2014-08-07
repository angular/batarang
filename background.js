
chrome.runtime.onConnect.addListener(function(port) {

  // context script –> background
  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    port.postMessage(msg);
  });
});
