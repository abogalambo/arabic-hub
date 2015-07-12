var React = require('react')
var quizStore = require('../stores/quiz_store')
var quizActions = require('../actions/quiz_actions')
var router = require('../modules/router')
var ch = componentHandler

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
        ch.upgradeAllRegistered()
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
          <div className="page">
            <div className="vertical-align-center">
              <Progressbar progress={this.state.loadProgress} />
            </div>
          </div>
        )
      }

      return (
        <div className="quiz">
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
        var textContent = '';
        var imageContent = '';
        var audioPlayButton = '';

        if(slide.image){
          var imageStyle = {
            background: 'url(' + slide.image.imageURL+ ') center/cover'
          }
          imageContent = (
            <div className="mdl-card__title" style={imageStyle}>
              <h2 className="mdl-card__title-text">{slide.title}</h2>
            </div>
          );
        }

        if(slide.audio){
          audioPlayButton = (
            <div className="mdl-card__menu">
              <button onClick={slide.audio.playAudio} className="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
                <i className="material-icons">play_arrow</i>
              </button>
            </div>
          );
        }

        if(slide.intro){
          textContent = (
            <div className="mdl-card__supporting-text">
              {slide.intro}
            </div>
          );
        }

        slideContent = (
          <div className="mdl-card mdl-shadow--2dp slide-card-wide vertical-align-center">
            {imageContent}
            {textContent}
            {audioPlayButton}
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
      return slideContent;
    }
  });

  var Progressbar = React.createClass({
    render: function(){
      return (
        <div className="progress">
          <div className="mdl-progress">
            <div className="progressbar bar bar1" style={{width: this.props.progress + '%'}}></div>
            <div className="bufferbar bar bar2" style={{width: '100%'}}></div>
          </div>
          <span>{this.props.progress + '%'}</span>
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
    cellsPerAnswer: function(){
      return [12,12,6,4,6][this.props.question.answers.length] || 4
    },
    render: function() {
      var question = this.props.question;
      var _this = this;
      var cellsPerAnswer = this.cellsPerAnswer();
      var answers = question.answers.map(function(a){
        return(
            <Answer obj={a} 
              callback={_this.answerWith.bind(_this, a)}
              answered={question.isAnswered()}
              chosen={question.getChosenAnswer() == a}
              correct={question.checkAnswer(a)}
              cellsPerAnswer={cellsPerAnswer} />
        );
      });
      return (
        <div className="question mdl-grid vertical-align-center" dir="rtl">
          <div className="question-body mdl-cell mdl-cell--2-col">
            <Element el={question.question} />
          </div>

          <div className="answers-list mdl-grid mdl-cell mdl-cell--10-col">
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
        <div className={"mdl-cell mdl-cell--" + (this.props.cellsPerAnswer || 4) + "-col"} style={style}>
          <Element el={this.props.obj} callback={this.props.callback} />
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

      var imageStyle;
      if(el.hasImage){
        imageStyle = {background: 'no-repeat url(' + el.imageURL + ') center/contain'}
      }else if(this.props.callback && !this.props.hasText){
        imageStyle = {background: 'no-repeat url(/assets/img/icons/choose_answer.png) center/50px'}
      }
      if(imageStyle){
        contents.push(
          <div className="mdl-card__title mdl-card--border" style={imageStyle} onClick={this.props.callback}></div>
        );
      }

      if(el.hasText){
        contents.push(
          <div onClick={this.props.callback} className="mdl-card__supporting-text mdl-card--border">
            <div>{el.text}</div>
          </div>
        );
      }

      if(el.hasAudio){
        contents.push(
          <div onClick={this.play} className="mdl-card__actions mdl-card--border">
            <button className="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-js-ripple-effect mdl-button--colored">
              <i className="material-icons">play_arrow</i>
            </button>
          </div>
        );
      }

      return (
        <div className="object mdl-card mdl-shadow--2dp">
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