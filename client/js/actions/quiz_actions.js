var AppDispatcher = require('../dispatcher');

var QuizActions = {
  goToSlide: function(index){
    AppDispatcher.dispatch({
      actionType: 'Quiz:goToSlide',
      slideIndex: index
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