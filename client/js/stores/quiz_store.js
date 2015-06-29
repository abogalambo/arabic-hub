var AppDispatcher = require('../dispatcher');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var assetLoader = require('../modules/asset_loader.js')
var factory = require('../modules/factory')

var CHANGE_EVENT = 'Quiz:Change';

var _state = {
  loaded: false,
  slides: [],
  current: 0,
  max: 0,
  loadProgress: 0
}

var nextSlide = function(){
  var slides = _state.slides
  var current = _state.current
  if(current < _state.max || !slides[current].isQuestionSlide){
    if((current + 1) < slides.length){
      slides[current].blur();
      slides[current + 1].focus();
      _state.current = current + 1;
      _state.max = Math.max(_state.max, current + 1);
    }
  }
}

var prevSlide = function(){
  var slides = _state.slides
  var current = _state.current
  if((current - 1) >= 0){
    slides[current].blur();
    slides[current - 1].focus();
    _state.current = current - 1;
  }
}

var checkAnswer = function(question,answer){
  if(question.checkAnswer(answer)){
    alert('correct');
  }else{
    alert('wrong');
  }
  if(_state.current < _state.slides.length){
    _state.max = _state.max + 1;
  }
}

var init = function(data){
  var slides = factory.createSlides(data);
  assetLoader.load().then(function(){
    _state.slides = slides;
    _state.loaded = true;
    QuizStore.emitChange();
    if(slides.length > 0){
      slides[0].focus();
    }
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
    case 'Quiz:NextSlide':
      nextSlide();
      QuizStore.emitChange();
      break;

    case 'Quiz:PrevSlide':
      prevSlide();
      QuizStore.emitChange();
      break;

    case 'Quiz:QuestionAnswered':
      checkAnswer(action.question, action.answer);
      nextSlide();
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