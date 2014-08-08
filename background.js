var buffer = [];
function addToBuffer(message) {
  buffer.push(message);
}
chrome.runtime.onMessage.addListener(addToBuffer);
chrome.runtime.onConnect.addListener(function(port) {
  chrome.runtime.onMessage.removeListener(addToBuffer);
  buffer.forEach(function(msg) {
    port.postMessage(msg);
  });
  // context script –> background
  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    port.postMessage(msg);
  });
});
