// mocks window.chrome.extension

if (typeof chrome === 'undefined') {
  window.chrome = {};
}

chrome.extension = {
  sendMessage: dump
};
