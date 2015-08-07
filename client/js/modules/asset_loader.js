var q = require('q');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var promises = {default:[]};
var loaded = {default: 0};
var LOADED_EVENT = 'AssetLoader:ResourceLoaded';
var nameSpace = 'default'

function loadAudio(url){
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  var deferred = q.defer();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    require('./audio_context').then(function(context){
      context.decodeAudioData(
        request.response,
        function(buffer) {
          if (!buffer) {
            deferred.reject(new Error('error decoding file data: ' + url));
            return;
          }
          deferred.resolve(buffer);
        },
        function(error) {
          deferred.reject(new Error('error decoding file data: ' + url));
        }
      );
    })

  }

  request.onerror = function() {
    deferred.reject(new Error('error decoding file data: ' + url));
  }

  request.send();
  return deferred.promise;
}

function loadImage(url){
  var image = new Image();
  var deferred = q.defer();
  image.onload = function(){
    deferred.resolve(image);
  };
  image.onerror = function(error){
    deferred.reject(error, url);
  };
  image.src = url;
  return deferred.promise;
}

// asset loader public API
var assetLoader = assign({}, EventEmitter.prototype, {
  addAsset: function(url, type, ns){
    var promise;
    ns = ns || nameSpace;
    var _this = this;
    if(type == 'audio'){
      promise = loadAudio(url);
    }else if(type == "image"){
      promise = loadImage(url);
    }
    promise.then(function(){
      loaded[ns] = loaded[ns] || 0;
      loaded[ns] ++;
      _this.emit(LOADED_EVENT, loaded[ns], promises[ns].length);
    });
    promises[ns] = promises[ns] || [];
    promises[ns].push(promise);
    return promise;
  },

  listenToLoad: function(callback){
    this.on(LOADED_EVENT, callback);
  },

  load: function(){
    if(arguments.length == 0)
      return q.allSettled(promises[nameSpace]);

    if(arguments.length == 1)
      return q.allSettled(promises[arguments[0]]);

    var nameSpaces = Array.prototype.slice.call(arguments);
    var toLoad = [];
    for(var i=0; i<arguments.length; i++){
      toLoad = toLoad.concat(promises[arguments[i]])
    }
    return q.allSettled(toLoad);
  },

  setNameSpace: function(ns){
    nameSpace = ns;
  }
});

module.exports = assetLoader;