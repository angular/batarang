# content-scripts/inject.js

What does this do?

This adds a script to the page that watches DOM mutation events until it sees that `window.angular` is available.
Immediately after, before any applications have the opportunity to bootstrap, this decorates core Angular
components to expose debugging information.

## Building debug.js

Why does this need a build step?

Because this script does `fn.toString()` to construct the script tags, it's impossible to use any sort of
code loading. The code needs to be inlined before being run.

From the root of this repository, run:

```shell
node ./scripts/inline.js
```
