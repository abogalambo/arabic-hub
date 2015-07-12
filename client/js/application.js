var initReact = require('./components/components.jsx')
var quizActions = require('./actions/quiz_actions')
var data = [
  {
    documentUrl: "/embedded_pages/take_skip_quiz.html",
    audio: 'take_skip_quiz.m4a'
  },{
    intro: 'Are you ready? Hit the space button to start the quiz',
    title: 'Welcome',
    image: 'sunshine.jpg',
    audio: 'intro.m4a'
  },{
    question: {
      audio: "alph/Aa.m4a",
      text: "Choose the word that matches this sound",
      images: [
        "alph/E.png",
        "alph/Ou.png",
        "alph/baa.png",
        "alph/Aa.png"
      ],
      correctAnswer: 3
    }
  },{
    question: {
      audio: "alph/baa.m4a",
      text: "Choose the word that matches this sound",
      images: [
        "alph/baa.png",
        "alph/naa.png",
        "alph/taa.png"
      ],
      correctAnswer: 0
    }
  },{
    question: {
      audio: "alph/saa.m4a",
      text: "Choose the word that matches this sound",
      images: [
        "alph/s_aa.png",
        "alph/saa.png",
        "alph/shaa.png"
      ],
      correctAnswer: 1
    }
  },{
    question: {
      text: "Pick the sound that matches this word",
      image: "alph/ba.png",
      sounds: [
        "alph/ba.m4a",
        "alph/be.m4a",
        "alph/bu.m4a"
      ],
      correctAnswer: 0
    }
  },{
    documentUrl: "http://qutrub.arabeyes.org/",
    audio: 'qutrub_intro.m4a'
  }
];
quizActions.init(data);
initReact();