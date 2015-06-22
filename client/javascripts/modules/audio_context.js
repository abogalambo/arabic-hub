var q = require('q');
var contextDeferred = q.defer();
if(window.AudioContext || window.webkitAudioContext){
	resolve();
}else{
	window.addEventListener('load', resolve, false);
}

function resolve(){
	var AudioContext = window.AudioContext || window.webkitAudioContext;
	var context = new AudioContext();
	contextDeferred.resolve(context);
}

module.exports = contextDeferred.promise;