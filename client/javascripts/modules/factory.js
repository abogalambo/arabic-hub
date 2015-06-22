var slides = require('./slides');
var questions = require('./questions');
var constructor = require('./objects');

var factory = {
  createSlides: function(slides){
    var slideObjects = [];
    for(var i=0; i< slides.length; i++){
      var slideObj = this.createSlide(slides[i]);
      slideObjects.push(slideObj);
    }
    return slideObjects;
  },

  createSlide: function(options){
    var slide;
    var slideOptions = {};
    if(options.intro){
      slideOptions = {
        intro: options.intro
      }
      if(options.audio){
        slideOptions.audio = this.createAudio(options.audio);
      }
      slide = slides.intro(slideOptions);
    }else if(options.question){
      var question = this.createQuestion(options.question)
      slide = slides.question(question);
    }
    return slide;
  },

  createQuestion: function(options){
    var questionBody;
    if(options.audio){
      questionBody = this.createAudio(options.audio);
    }else if(options.image){
      questionBody = this.createImage(options.image);
    }else if(options.text){
      questionBody = this.createText(options.text);
    }

    var answers = [];
    var arr = (options.images || options.sounds || options.texts)
    for(var i=0; i< arr.length; i++){
      var obj = constructor.create();
      if(options.images){
        this.createImage(options.images[i], obj);
      }
      if(options.sounds){
        this.createAudio(options.sounds[i], obj);
      }
      if(options.texts){
        this.createText(options.texts[i], obj);
      }
      answers.push(obj);
    }

    return questions.mCquestion({
      question: questionBody,
      answers: answers,
      correctAnswer: answers[options.correctAnswer]
    });
  },

  createAudio: function(file, obj){
    var url= "/sounds/" + file;
    var result = obj || constructor.create();
    return result.extend('audio',{audioURL:url});
  },

  createImage: function(file, obj){
    var url= "/images/" + file;
    var result = obj || constructor.create();
    return result.extend('image', {imageURL:url});
  },

  createText: function(text, obj){
    var result = obj || constructor.create();
    return result.extend('text', {text:text});
  }
};

module.exports = factory