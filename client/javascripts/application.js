// var $ = require('jquery');
var factory = require('./modules/factory')
var data = [
  {
    intro: 'Are you ready?',
    audio: 'sound3.wav'
  },{
    question: {
      audio: "Aa.wav",
      image: "alph/E.jpeg",
      images: [
        "alph/E.jpeg",
        "alph/A.jpg",
        "alph/O.jpg",
        "alph/Aa.png"
      ],
      correctAnswer: 3
    }
  },{
    question: {
      text: "بَ",
      sounds: [
        "alph/ba.mp3",
        "alph/ta.mp3",
        "alph/tha.mp3",
        "alph/na.mp3"
      ],
      images: [
        "alph/E.jpeg",
        "alph/A.jpg",
        "alph/O.jpg",
        "alph/Aa.png"
      ],
      texts: [
      	"بَ",
      	"بَ",
      	"لاَ",
      	"هاهاهاَ"
      ],
      correctAnswer: 0
    }
  },{
    question: {
      text: "بَ",
      images: [
        "alph/ba.mp3",
        "alph/ta.mp3",
        "alph/tha.mp3",
        "alph/na.mp3"
      ],
      correctAnswer: 0
    }
  }
];

console.log(factory.createSlides(data));