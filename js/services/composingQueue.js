// Executes actions in background, by small portions (now 50 actions each 50 ms)
// Could be used to build big views without freezing UI
angular.module('panelApp').factory('composingQueue', function($timeout) {
  var treeComposingQueue = [], queueTo = null;
  function processQueue() {
    if (treeComposingQueue.length == 0) {
      queueTo = null;
    }
    else {
      var toProcess = treeComposingQueue.splice(0, 50);
      toProcess.forEach(function(action) {action()});
      queueTo = $timeout(processQueue, 50);
      api.queueLength = treeComposingQueue.length;
    }
  }
  function addToQueue(action) {
    treeComposingQueue.push(action);
    api.queueLength++;
    if (queueTo == null) {
      processQueue();
    }
  }

  var api = {
    //adds action to the queue and executes it after all other actions. Could be executed right now or after approximately
    // queueLength ms
    addToQueue: addToQueue,

    //current length of queue
    queueLength: 0
  };
  return api;
});