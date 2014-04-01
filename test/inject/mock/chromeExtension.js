// mocks window.chrome.extension

if (typeof chrome === 'undefined') {
  window.chrome = {};
}

chrome.extension = {
  sendMessage: function (message) {
    console.log(message)
  }
};
