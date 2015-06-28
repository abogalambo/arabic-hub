var express = require('express')
var path = require('path')

var app = express()
app.use(express.static(path.join(__dirname, 'public')))
if(process.env['NODE_ENV'] == 'development'){
	var slow = require('connect-slow')
	app.use(slow())
}
app.use('/assets',  express.static(__dirname + '/build'));

var port = (process && process.env && process.env.PORT) || 3000;
app.listen(port)

process.on("uncaughtException", function (err) {
	process.exit(1);
});