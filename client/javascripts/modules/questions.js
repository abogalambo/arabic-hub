var mCquestion = function(options){
  options = options || {};
  var that = {};
  var correctAnswer = options.correctAnswer;
  that.isMultipleChoice = true;
  that.question = options.question;
  that.answers = options.answers || [];
  that.focus = function(){
    if(this.question.hasAudio){
      this.question.playAudio();
    }
  }
  that.blur = function(){
    if(this.question.hasAudio){
      this.question.stopAudio();
    }
  }

  var checkAnswer = function(answer){
    return correctAnswer === answer;
  }
  that.checkAnswer = checkAnswer;
  return that;
}

module.exports = {
  multipleChoice: mCquestion
}