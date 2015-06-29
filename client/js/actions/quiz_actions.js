var AppDispatcher = require('../dispatcher');

var QuizActions = {
  nextSlide: function() {
    AppDispatcher.dispatch({
      actionType: 'Quiz:NextSlide'
    });
  },

  prevSlide: function() {
    AppDispatcher.dispatch({
      actionType: 'Quiz:PrevSlide'
    });
  },

  questionAnswered: function(question, answer) {
    AppDispatcher.dispatch({
      actionType: 'Quiz:QuestionAnswered',
      question: question,
      answer: answer
    });
  },

  init: function(data) {
    AppDispatcher.dispatch({
      actionType: 'Quiz:Init',
      quizData: data
    });
  }
};

module.exports = QuizActions;