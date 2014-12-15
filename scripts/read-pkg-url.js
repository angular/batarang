#!/usr/bin/env node

var fs = require('fs');
var pkg = JSON.parse(fs.readFileSync(process.argv[2]));
var url = pkg.repository.url;
var dirname = url.replace(/^.*\//, '').replace(/\.git$/, '');

console.log(url + ' ' + dirname);
