# Batarang Architecture

This document describes the different parts of Batarang and how they interact
with the aim to be useful for anyone that wants to help improve Batarang.


## Parts

### Devtools Elements pane

### Devtools Pane
Dispays stuff


### Instrumentation
Hooks into the app to give you stats and access to the models.

### Background Page
- Lets us communicate between app and devtools pane
- Stores state


## Bootstrap

How does Batarang start? When a tab is opened in Chrome:

1. Chrome reads the `manifest.json` – specifically the `content_scripts` field.
2. content script – `conent-scripts/inject.js`
  * checks for the presense of an `__ngDebug` cookie
  * embeds `<script>` into the app's `<head>`
    - adds a mutation listener
4. proxy elt
5. app context patches angular
6. emits events to content script
7. content script sends messages to the backgroung page
8. backgroung page emits events to the devtools pane

