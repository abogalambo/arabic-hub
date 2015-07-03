var AppDispatcher = require('../dispatcher');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var assetLoader = require('../modules/asset_loader.js')
var factory = require('../modules/factory')

var CHANGE_EVENT = 'Quiz:Change';

var _state = {
  loaded: false,
  slides: [],
  current: 0, // zero-based index of the current slide
  max: 0,
  loadProgress: 0
}

var goToSlide = function(index){
  var slides = _state.slides;
  var current = _state.current;
  if(slides[current]){
    slides[current].blur();
  }
  if(slides[index]){
    slides[index].focus();
  }
  _state.current = index;
}

var checkAnswer = function(question,answer){
  if(question.checkAnswer(answer)){
    alert('correct');
  }else{
    alert('wrong');
  }
}

var init = function(data){
  var slides = factory.createSlides(data);
  assetLoader.load().then(function(){
    _state.slides = slides;
    _state.max = Math.max(slides.length - 1, 0);
    _state.loaded = true;
    QuizStore.emitChange();
  }, console.error);
  // TODO handle error in loading
  assetLoader.listenToLoad(function(loaded, total){
    var progress = (loaded / total) * 100;
    _state.loadProgress = Math.floor(progress);
    QuizStore.emit(CHANGE_EVENT);
  });
}

var QuizStore = assign({}, EventEmitter.prototype, {
  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  getState: function(){
    return _state;
  }
});

// Register callback to handle all updates
AppDispatcher.register(function(action) {

  switch(action.actionType) {
    case 'Quiz:QuestionAnswered':
      checkAnswer(action.question, action.answer);
      QuizStore.emitChange();
      break;

    case 'Quiz:goToSlide':
      goToSlide(action.slideIndex);
      QuizStore.emitChange();
      break;

    case 'Quiz:Init':
      init(action.quizData);
      QuizStore.emitChange();
      break;

    default:
      // no op
  }
});

module.exports = QuizStore;