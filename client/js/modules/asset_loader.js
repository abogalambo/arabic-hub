var q = require('q');
var pubsub = require('./events')
var promises = [];
var loaded = 0;

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
var assetLoader = {
  addAsset: function(url, type){
    var promise;
    if(type == 'audio'){
      promise = loadAudio(url);
    }else if(type == "image"){
      promise = loadImage(url);
    }
    promise.then(function(){
      loaded ++;
      pubsub.trigger('asset_loader:resource_loaded', loaded, promises.length);
    });
    promises.push(promise);
    return promise;
  },

  load: function(){
    return q.allSettled(promises)
  }
};

module.exports = assetLoader;