var constructor = (function(){
  var that = {}
  var mixins = addMixins({});
  var extend = function(module, options){
    if(typeof mixins[module] === 'function'){
      return mixins[module](this, options);
    }
    return this;
  }

  that.create = function(module, options){
    var initial = {};
    initial.extend = function(){
      return extend.apply(this, arguments);
    }
    if(module){
      initial.extend(module, options);
    }
    return initial;
  }
  return that;
})();
// t = App.create().extend('text', {text:'momma'}).extend('audio',{audioURL:""}).extend('image', {imageURL:""})

function addMixins(mixins){
  var assetLoader = require('./asset_loader');
  mixins.text = function(object, options){
    var that = object;
    that.text = options.text;
    that.hasText = true;
    var getText = function(){
      return text;
    }
    return that;
  }
  mixins.image = function(object, options){
    var that = object;
    that.imageURL = options.imageURL;
    that.imageLoaded = false;
    that.hasImage = true;

    var load = function(){
      if(!that.imageLoaded){
        assetLoader.addAsset(that.imageURL, "image")
        .then( function(image) {
          that.image = image;
          that.imageLoaded = true;
        }, console.error );
      }
    }
    that.loadImage = load;

    load();
    return that;
  }

  mixins.audio = function(object, options){
    var that = object;
    var source;
    var audio;
    var loadPromise;
    var playingNow = false;
    var AudioPlayer = require('./audio_player');
    that.audioURL = options.audioURL;
    that.hasAudio = true;

    var load = function(){
      if(!loadPromise){
        loadPromise = assetLoader.addAsset(that.audioURL, "audio").then( function(buffer){
          audio = buffer;
        }, console.error);
      }
      return loadPromise;
    }
    that.loadAudio = load;

    var play = function(){
      playingNow = true;
      return load().then(function(){
        return AudioPlayer.play(audio);
      }).then(function(){
        playingNow = false;
      });
    }
    that.playAudio = play;

    var isPlaying = function(){
      return playingNow;
    }
    that.isPlaying = isPlaying;

    var stop = function(){
      AudioPlayer.stop(audio);
      playingNow = false;
    }
    that.stopAudio = stop;

    load();
    return that;
  }

  return mixins;
}

module.exports = constructor