var React = require('react')
var quizStore = require('../stores/quiz_store')
var quizActions = require('../actions/quiz_actions')
var router = require('../modules/router')

var initReact = function(){
  var Quiz = React.createClass({
    getInitialState: function() {
      return quizStore.getState();
    },
    computeStyle: function(index){
      var multiplier = 1;
      // if(this.currentDir == 'ltr') multiplier = -1;
      return {left: 100 * multiplier * (this.state.current - index) + "%"}
    },
    componentDidMount: function() {
      var _this = this;

      quizStore.addChangeListener(function(){
        _this.setState(quizStore.getState());
      });

      document.onkeydown = function(e){
        if(_this.state.loaded){
          _this.handleKeyDown(e)
        }
      }
    },
    componentDidUpdate: function(prevProps, prevState){
      if(this.state.loaded && !prevState.loaded){
        router.goTo(window.location.hash.slice(2) || '/slides/1');
      }
    },
    handleKeyDown: function(e){
      if(e.which == 39){
        if(this.state.current != 0){
          router.goTo('/slides/' + (this.state.current));
        }
      }else if(e.which == 37 || e.which == 32){
        if(this.state.current != this.state.max){
          router.goTo('/slides/' + (this.state.current + 2));
        }
      }
    },
    render: function() {
      var _this = this;
      var answerCallback = function(){
        setTimeout(function(){
          if(_this.state.current != _this.state.max){
            router.goTo('/slides/' + (_this.state.current + 2));
          }
        }, 700);
      }
      var content = "";
      if(this.state.loaded){
        content = this.state.slides.map(function(slide, index){
          return (
            <div className='page' style={_this.computeStyle(index)}>
              <Slide slide={slide} answerCallback={answerCallback}/>
            </div>
          );
        });
      }else{
        content = (
          <Progressbar progress={this.state.loadProgress} />
        )
      }

      return (
        <div className="quiz container-fluid text-center">
          {content}
        </div>
      );
      
    }
  });

  var Slide = React.createClass({
    render: function() {
      var slide = this.props.slide;
      var slideContent;
      if(slide.isIntroSlide){
        var imageTag;
        if(slide.image){
          imageTag = (
            <img width="500px;" src={slide.image.imageURL} />
          )
        }
        slideContent = (
          <div>
            <Element el={slide.audio} />
            {imageTag}<br/>
            {slide.intro}
          </div>
        )
      }else if(slide.isQuestionSlide){
        slideContent = (
          <Question question={slide.question} answerCallback={this.props.answerCallback} />
        )
      }else if(slide.isHtmlSlide){
        var style = {
          width: '100%',
          height: '100%'
        }
        slideContent = (
          <iframe style={style} src={slide.documentUrl} seamless="seamless" frameBorder="0" width="100%"></iframe>
        )
      }
      return (
        <div className="slide">
          {slideContent}
          <hr />
        </div>
      );
    }
  });

  var Progressbar = React.createClass({
    render: function(){
      var barStyle = {minWidth: '2em', width: this.props.progress + '%'};
      return (
        <div className="progress">
          <div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow={this.props.progress} aria-valuemin="0" aria-valuemax="100" style={barStyle}>
            {this.props.progress + '%'}
          </div>
        </div>
      )
    }
  })

  var Question = React.createClass({
    answerWith: function(answer){
      var question = this.props.question
      if(!question.isAnswered()){
        quizActions.questionAnswered(question, answer);
        if(this.props.answerCallback){
          this.props.answerCallback();
        }
      }
    },
    render: function() {
      var question = this.props.question;
      var _this = this;
      var answers = question.answers.map(function(a){
        return(
            <Answer obj={a} 
              callback={_this.answerWith.bind(_this, a)}
              answered={question.isAnswered()}
              chosen={question.getChosenAnswer() == a}
              correct={question.checkAnswer(a)} />
        );
      });
      return (
        <div className="question">
          <div className="question-body">
            <Element el={question.question} />
          </div>
          <div className="answers-list flex">
            {answers}
          </div>
        </div>
      );
    }
  });

  var Answer = React.createClass({
    render: function(){
      var style = {};
      var discloseText = '';
      if(this.props.answered){
        if(this.props.chosen){
          style.border = '5px solid blue'
        }
        var discloseContent = ''
        if(this.props.correct){
          discloseText = (
            <div>✓</div>
          )
        }else{
          discloseText = (
            <div>✖</div>
          )
        }
      }
      return(
        <div onClick={this.props.callback} style={style}>
          <Element el={this.props.obj} />
          {discloseText}
        </div>
      );
    }
  });

  var Element = React.createClass({
    play: function(e){
      this.props.el.playAudio();
      e.stopPropagation();
    },
    render: function() {
      var contents = [];
      var el = this.props.el;
      if(el.hasText){
        contents.push(
          <div>{el.text}</div>
        );
      }

      if(el.hasImage){
        contents.push(
          <img className='answer-image' src={el.imageURL} />
        );
      }

      if(el.hasAudio){
        contents.push(
          <button onClick={this.play}>Play</button>
        );
      }

      return (
        <div className="element flex">
          {contents}
        </div>
      );
    }
  });

  React.render(
    <Quiz />,
    document.getElementById('root')
  );
};

module.exports = initReact;