
var crypto = require('crypto');
var request = require('request');
var path = require("path");
var fs     = require('fs');
var mkdirp = require('mkdirp');

var createCache = function(url, cacheDir, cacheUri, callback){
  cache.createCacheDir(cacheDir);

  var md5 = crypto.createHash('md5');
  var ext = path.extname(url);
  var hash = md5.update(url).digest('hex');
  var cachePath = path.join(cacheDir, hash + ext);
  var uri = path.join(cacheUri || '', hash + ext);

  var stat;

  try {
    stat = fs.statSync(cachePath);
  } catch (e) {
    stat = false;
  }

  if(!stat) {
    var done = false;
    request(url, {encoding: 'binary'}, function(err, response, body){
      if(callback){
        fs.writeFile(cachePath, body, 'binary', function(){
          callback(uri);
        });
      }else{
        fs.writeFileSync(cachePath, body, 'binary');
        done = true;
      }
    });
    if(!callback){
      while(!done) {
        require('deasync').sleep(3);
      }
    }
  }

  // return the cache uri if sync or cache file exists, otherwise return the original url
  return !callback || stat ? uri : url;
}

var cache = {};

cache.createCacheDir = function(dir) {
  try {
    fs.statSync(dir);
  } catch (e) {
    mkdirp.sync(dir);
  }
};

cache.sync = function(url, cacheDir, cacheUri){
  return createCache(url, cacheDir, cacheUri);
};

cache.async = function(url, cacheDir, cacheUri, callback){
  return createCache(url, cacheDir, cacheUri, callback);
};

module.exports = cache;
