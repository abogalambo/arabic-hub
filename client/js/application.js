var initReact = require('./components/components.jsx')
var quizActions = require('./actions/quiz_actions')
var data = [
  {
    intro: 'Are you ready?',
    audio: 'intro.m4a'
  },{
    documentUrl: "/embedded_pages/take_skip_quiz.html"
  },{
    question: {
      audio: "alph/Aa.m4a",
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
      images: [
        "alph/s_aa.png",
        "alph/saa.png",
        "alph/shaa.png"
      ],
      correctAnswer: 1
    }
  },{
    question: {
      text: "بَ",
      sounds: [
        "alph/ba.m4a",
        "alph/be.m4a",
        "alph/bu.m4a"
      ],
      correctAnswer: 0
    }
  }
];
quizActions.init(data);
initReact();