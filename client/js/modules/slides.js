var slide = function(){
  var that = {};
  that.focus = function(){};
  that.blur = function(){};
  return that;
}

var introSlide = function(options){
  var that = slide();
  that.isIntroSlide = true
  that.intro = options.intro;
  that.title = options.title;
  that.audio = options.audio;
  that.image = options.image;
  that.focus = function(){
    if(this.audio){
      return this.audio.playAudio();
    }
  }
  that.blur = function(){
    if(this.audio){
      this.audio.stopAudio();
    }
  }
  return that;
}

var questionSlide = function(q){
  var that = slide();
  that.isQuestionSlide = true
  that.question = q;
  that.focus = function(){
    return this.question.focus();
  }
  that.blur = function(){
    this.question.blur();
  }
  return that;
}

var htmlSlide = function(options){
  var that = slide();
  that.isHtmlSlide = true;
  that.documentUrl = options.documentUrl;
  that.audio = options.audio;
  that.focus = function(){
    if(this.audio)
      this.audio.playAudio();
  }
  that.blur = function(){
    if(this.audio)
      this.audio.stopAudio();
  }
  return that;
}

module.exports = {
  intro: introSlide,
  question: questionSlide,
  html: htmlSlide
}