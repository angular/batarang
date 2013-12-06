# AngularJS Batarang

## Installing from the Web Store

https://chrome.google.com/webstore/detail/ighdmehidhipcmcojjgiloacoafjmpfk

## Installing from Source

1. Clone the repository: `git clone git://github.com/angular/angularjs-batarang`
2. Install the bower dependencies: `bower install`
3. Build the inject script: `node scripts/inline.js`
4. Navigate to `chrome://chrome/extensions/` and enable Developer Mode.
5. Choose "Load unpacked extension"
6. In the dialog, open the directory you just cloned.

## Screencast

Check out [this screencast](http://www.youtube.com/embed/q-7mhcHXSfM) that walks you through the Batarang's features.

## Using the Batarang
First, navigate Chrome Canary to the AngularJS application that you want to debug. [Open the Developer Tools](https://developers.google.com/chrome-developer-tools/docs/overview#access). There should be an AngularJS icon. Click on it to open the AngularJS Batarang.

<!-- HELP TAB -->

In order to begin using the Batarang you need to click the "enable" checkbox. This will cause the application's tab to refresh, and the Batarang to begin collecting perfomance and debug information about the inspected app.

The Batarang has five tabs: Model, Performance, Dependencies, Options, and Help.

### Models
![Batarang screenshot](https://github.com/angular/angularjs-batarang/raw/master/img/models.png)

Starting at the top of this tab, there is the root selection. If the application has only one `ng-app` declaration (as most applications do) then you will not see the option to change roots.

Below that is a tree showing how scopes are nested, and which models are attached to them. Clicking on a scope name will take you to the Elements tab, and show you the DOM element associated with that scope. Models and methods attached to each scope are listed with bullet points on the tree. Just the name of methods attached to a scope are shown. Models with a simple value and complex objects are shown as JSON. You can edit either, and the changes will be reflected in the application being debugged.

### Performance
![Batarang performance tab screenshot](https://github.com/angular/angularjs-batarang/raw/master/img/perf.png)

The performance tab must be enabled separately because it causes code to be injected into AngularJS to track and report performance metrics. There is also an option to output performance metrics to the console.

Below that is a tree of watched expressions, showing which expressions are attached to which scopes. Much like the model tree, you can collapse sections by clicking on "toggle" and you can inspect the element that a scope is attached to by clicking on the scope name.

Underneath that is a graph showing the relative performance of all of the application's expressions. This graph will update as you interact with the application.

### Dependencies
![Batarang dependencies tab screenshot](https://github.com/angular/angularjs-batarang/raw/master/img/deps.png)

The dependencies tab shows a visualization of the application's dependencies. When you hover over a service name, services that depend on the hovered service turn green, and those the hovered service depend on turn red.

### Options
![Batarang options tab screenshot](https://github.com/angular/angularjs-batarang/raw/master/img/options.png)

Last, there is the options tab. The options tab has three checkboxes: one for "show applications," "show scopes," and "show bindings." Each of these options, when enabled, highlights the respective feature of the application being debugged; scopes will have a red outline, and bindings will have a blue outline, and applications a green outline.

### Elements
![Batarang console screenshot](https://github.com/angular/angularjs-batarang/raw/master/img/inspect.png)

The Batarang also hooks into some of the existing features of the Chrome developer tools. For AngularJS applications, there is now a properties pane on in the Elements tab. Much like the model tree in the AngularJS tab, you can use this to inspect the models attached to a given element's scope.

### Console
![Batarang console screenshot](https://github.com/angular/angularjs-batarang/raw/master/img/console.png)

The Batarang exposes some convenient features to the Chrome developer tools console. To access the scope of an element selected in the Elements tab of the developer tools, in console, you can type `$scope`. If you change value of some model on `$scope` and want to have this change reflected in the running application, you need to call `$scope.$apply()` after making the change.
