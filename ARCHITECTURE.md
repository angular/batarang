# Batarang Architecture

This document describes the different parts of Batarang and how they interact.
This is intended for anyone that wants to contribute to or improve Batarang.


## Parts

### Chrome Devtools Pane
Dispays stuff


### Instrumentation
Hooks into the app to give you stats and access to the models

### Background Page
- Lets us communicate between app and devtools pane
- Stores state


## Bootstrap

How does Batarang start?

1. `manifest.json` – ...
2. content script
  - crazy bootstrap
3. embeds `<script>` into the app's `<head>`
4. proxy elt
5. app context patches angular
6. emits events to content script
7. content script sends messages to the backgroung page
8. backgroung page emits events to the devtools pane

