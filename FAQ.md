# Batarang FAQ

### How do I measure a directive's performance?
If your directive uses `$watch`, you should be able to see the watch expression wherever your directive is used.

### My $watch functions show up as just "function ()" in the performance tab
Use named functions for $watch:

```javascript
scope.$watch(function checkIfSomethingChanged() { 
  // ...
}, function whenThatChanges(newValue, oldValue) {
  // ...
});
```
