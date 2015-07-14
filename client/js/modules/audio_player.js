var q = require('q');
var contextPromise = require('./audio_context');
var currentBuffer;
var currentDeferred;
var currentSource;

function resolveStopPromise(){
	if(currentDeferred){
		currentSource.onended = undefined;
		currentBuffer = undefined;
		currentSource = undefined;
		currentDeferred.resolve();
		currentDeferred = undefined;
	}
}

var AudioPlayer = {
	play: function(buffer){
		var deferred = q.defer(); // to be resolved once the audio ends or stops
		var _this = this;
		contextPromise.then(function(context){
			if(currentBuffer){
				_this.stop(currentBuffer);
			}

			var source = context.createBufferSource();     // creates a sound source
	        source.buffer = buffer;                     // tell the source which sound to play
	        source.connect(context.destination);       // connect the source to the context's destination (the speakers)


			currentBuffer = buffer;
			currentSource = source;
			currentDeferred = deferred;
			source.onended = resolveStopPromise;
			source.start(0);

	    }, console.error);
		return deferred.promise;
	},

	stop: function(buffer){
		if(buffer === currentBuffer){
			currentSource.stop(0);
			resolveStopPromise();
		}
	},

	isPlaying: function(buffer){
		return buffer == currentBuffer;
	}
}

module.exports = AudioPlayer;