var page = require('page')
var quizActions = require('../actions/quiz_actions');

// var assign = require('object-assign');
// var EventEmitter = require('events').EventEmitter;

var showSlide = function(ctx){
	quizActions.goToSlide(parseInt(ctx.params.index) - 1);
}

var index = function(ctx){};

var routes = {
	'index' : '/',
	'show_slide': '/slides/:index'
}

var Router = {
	goTo: function(url){
		page(url);
	},
	routes: routes
};

page(routes.index, index);
page(routes.show_slide, showSlide);
page({hashbang: true});

module.exports = Router;