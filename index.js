
var crypto = require('crypto');
var request = require('request');
var path = require("path");
var fs     = require('fs');
var mkdirp = require('mkdirp');

var cache = {};

cache.createCacheDir = function(dir) {
  try {
    fs.statSync(dir);
  } catch (e) {
    mkdirp.sync(dir);
  }
};

cache.sync = function(url, cacheDir, cacheUri){
  cache.createCacheDir(cacheDir);

  var md5 = crypto.createHash('md5');
  var ext = path.extname(url);
  var hash = md5.update(url).digest('hex');
  var cachePath = path.join(cacheDir, hash + ext);
  var uri = path.join(cacheUri || cacheDir, hash + ext);

  var stat;

  try {
    stat = fs.statSync(cachePath);
  } catch (e) {
    stat = false;
  }

  if(!stat) {
    var done = false;
    request(url, {encoding: 'binary'}, function(err, response, body){
      fs.writeFileSync(cachePath, body, 'binary');
      done = true;
    });
    while(!done) {
      require('deasync').sleep(3);
    }
  }

  return uri;
};

module.exports = cache;
