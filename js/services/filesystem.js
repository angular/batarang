// Service for exporting as JSON
panelApp.factory('filesystem', function(chromeExtension) {

  // taken from:
  // http://html5-demos.appspot.com/static/html5storage/index.html#slide59

  // TODO: error handlers?

  return {
    exportJSON: function (name, data) {
      //TODO: file size/limits? 1024*1024
       window.webkitRequestFileSystem(window.TEMPORARY, 1024*1024, function (fs) {
        fs.root.getFile(name + '.json', {create: true}, function (fileEntry) {
          fileEntry.createWriter(function(fileWriter) {

            var blob = new Blob([ JSON.stringify(data) ], { type: 'text/plain' });

            fileWriter.onwriteend = function () {
              // navigate to file, will download
              //location.href = fileEntry.toURL();
              window.open(fileEntry.toURL());
            };

            fileWriter.write(blob);
          }, function() {});
        }, function() {});
      }, function() {});
    }
  };
});
