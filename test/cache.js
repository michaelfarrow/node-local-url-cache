
var expect  = require('chai').expect;
var cache   = require('../index.js');
var fs      = require('fs');
var path    = require('path');
var request = require('request');

var cacheDir      = '/tmp/node-url-local-cache';
var cacheUrl      = 'http://www.cl.cam.ac.uk/~mgk25/ucs/examples/TeX.txt';
var cacheFilename = 'fe7f3455eb4d06258955ca5ea5237de3.txt';
var cacheFile     = path.join(cacheDir, cacheFilename);

var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

describe('Cache', function() {

  describe('Directory', function(){
    it('creates the local cache directory', function(){
      deleteFolderRecursive(cacheDir);
      cache.createCacheDir(cacheDir);

      var stat;
      try {
        stat = fs.statSync(cacheDir);
      } catch (e) {
        stat = false;
      }

      expect(stat).to.not.be.false;
    });
  });

  describe('Sync', function() {

    it('creates a local file with the correct filename', function() {
      deleteFolderRecursive(cacheDir);
      cache.sync(cacheUrl, cacheDir);

      var stat;
      try {
        stat = fs.statSync(cacheFile);
      } catch (e) {
        stat = false;
      }

      expect(stat).to.not.be.false;
    });

    it('creates a local file with the correct content', function(done) {
      deleteFolderRecursive(cacheDir);
      cache.sync(cacheUrl, cacheDir);

      request(cacheUrl, function (error, response, body) {
        var fileContents = fs.readFileSync(cacheFile, 'utf8');
        expect(fileContents).to.equal(body);
        done();
      });
    });

    it('returns the correct public uri', function() {
      deleteFolderRecursive(cacheDir);
      var publicUri = cache.sync(cacheUrl, cacheDir, '/cache');

      expect(publicUri).to.equal(path.join('/cache', cacheFilename));
    });

  });
});
