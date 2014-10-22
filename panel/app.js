'use strict';

angular.module('batarang.app', [
  'batarang.app.hint',
  'batarang.app.scopes',

  'batarang.scope-tree',
  'batarang.code',
  'batarang.inspected-app',
  'batarang.json-tree',
  'batarang.scope-tree',
  'batarang.tabs',
  'batarang.vertical-split'
]).
// immediately instantiate this service
run(['inspectedApp', angular.noop]);
