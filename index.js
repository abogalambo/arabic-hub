var express = require('express')
var path = require('path')

var app = express()
// console.log('hahaha')
// console.log(path.join(__dirname, 'static'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/assets',  express.static(__dirname + '/build'));

var port = (process && process.env && process.env.PORT) || 3000;
app.listen(port)