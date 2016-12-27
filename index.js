
var crypto = require('crypto');
var request = require('request');
var path = require("path");
var fs     = require('fs');
var mkdirp = require('mkdirp');

var exists = function(path, callback) {
  try {
    fs.stat(path, function(err) {
      if(err && err.code == 'ENOENT')
        return callback(null, false);
      if(err)
        return callback(err);
      callback(null, true);
    });
  } catch (err) {
    callback(err);
  }
};

var createCache = function(url, cacheDir, cacheUri, callback){
  cache.ensureCacheDir(cacheDir, function(err) {
    if(err) return callback(null, '');

    var md5 = crypto.createHash('md5');
    var ext = path.extname(url);
    var hash = md5.update(url).digest('hex');
    var cachePath = path.join(cacheDir, hash + ext);
    var uri = path.join(cacheUri || '', hash + ext);

    exists(cachePath, function(err, e) {
      if(err) return callback(null, '');
      if(e) return callback(null, uri);

      request(url, {encoding: 'binary'}, function(err, response, body){
        fs.writeFile(cachePath, body, 'binary', function(err){
          if(err) return callback(null, '');
          callback(null, uri);
        });
      });
    });

  });
}

var cache = {};

cache.createCacheDir = function(dir, callback) {
  mkdirp(dir, callback);
};

cache.ensureCacheDir = function(dir, callback) {
  exists(dir, function(err, e) {
    if(err) return callback(err);
    if(e) return callback(null);
    cache.createCacheDir(dir, callback);
  });
};

cache.async = function(url, cacheDir, cacheUri, callback){
  createCache(url, cacheDir, cacheUri, callback);
};

cache.sync = function(url, cacheDir, cacheUri){
  var returnUri = null;
  cache.async(url, cacheDir, cacheUri, function(err, uri) {
    if(err)
      returnUri = '';
    else
      returnUri = uri;
  });
  while(returnUri === null) {
    require('deasync').sleep(100);
  }
  return returnUri;
};

module.exports = cache;
