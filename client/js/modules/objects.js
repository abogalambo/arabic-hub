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
      load().then(function(){
        return require('./audio_context');
      }).then(function(context){
        source = context.createBufferSource();     // creates a sound source
        source.buffer = audio;                     // tell the source which sound to play
        source.connect(context.destination);       // connect the source to the context's destination (the speakers)
        source.start(0);                           // play the source now
      }, console.error);
    }
    that.playAudio = play;

    var stop = function(){
      if(source){
        source.stop();
      }
    }
    that.stopAudio = stop;

    load();
    return that;
  }

  return mixins;
}

module.exports = constructor