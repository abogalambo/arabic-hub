var page = require('page')
var quizActions = require('../actions/quiz_actions');

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

window.onhashchange = function(){
	page(window.location.hash.slice(2));
}

module.exports = Router;