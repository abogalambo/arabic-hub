var mCquestion = function(options){
  options = options || {};
  var that = {};
  var correctAnswer = options.correctAnswer;
  var chosenAnswer;
  that.isMultipleChoice = true;
  that.question = options.question;
  that.answers = options.answers || [];
  that.focus = function(){
    if(this.question.hasAudio && !this.isAnswered()){
      return this.question.playAudio();
    }
  }
  that.blur = function(){
    if(this.question.hasAudio){
      this.question.stopAudio();
    }
  }
  that.isAnswered = function(){
    return chosenAnswer != undefined;
  }

  that.getChosenAnswer = function(){
    return chosenAnswer;
  }

  that.checkAnswer = function(answer){
    return correctAnswer === answer;
  }

  that.isAnsweredCorrectly = function(){
    return this.checkAnswer(chosenAnswer);
  }

  that.answerWith = function(answer){
    if(!this.isAnswered()){
      chosenAnswer = answer;
    }
  }
  return that;
}

module.exports = {
  multipleChoice: mCquestion
}