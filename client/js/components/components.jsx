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
      var content;
      var navigation;
      var quizProgress;
      if(this.state.loaded){
        navigation = (
          <SlidesNav slides={this.state.slides} current={this.state.current} />
        );
        quizProgress = (
          <QuizProgress progress={parseInt(100 * (this.state.current + 1) / this.state.slides.length)} />
        );
        content = this.state.slides.map(function(slide, index){
          return (
            <div className='page' style={_this.computeStyle(index)}>
              <Slide slide={slide} answerCallback={answerCallback} quizAssets={_this.state.quizAssets} />
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
          <SocialIcons />
          {quizProgress}
          {content}
          {navigation}
        </div>
      );
      
    }
  });

  var Slide = React.createClass({
    toggleAudio: function(){
      quizActions.toggleAudio(this.props.slide.audio);
    },
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
              <button onClick={this.toggleAudio} className="mdl-button mdl-button--icon mdl-js-button">
                <i className="material-icons">{slide.audio.isPlaying() ? 'pause' : 'play_arrow'}</i>
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
          <Question question={slide.question} answerCallback={this.props.answerCallback} quizAssets={this.props.quizAssets} />
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

  var QuizProgress = React.createClass({
    render: function(){
      return(
        <div className="bottom-progress mdl-progress">
          <div className="progressbar bar bar1" style={{width: this.props.progress + '%'}}></div>
          <div className="bufferbar bar bar2" style={{width: '100%'}}></div>
        </div>
      )
    }
  });

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
      var character;
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

      if(question.isAnswered()){
        var img;
        if(question.isAnsweredCorrectly()){
          img = this.props.quizAssets.characters.happy;
        }else{
          img = this.props.quizAssets.characters.sad;
        }
        character = (
          <img className="character-image" src={img.imageURL} />
        );
      }
      return (
        <div className="question mdl-grid vertical-align-center" dir="rtl">
          <div className="question-body mdl-cell mdl-cell--2-col">
            <Element el={question.question} />
            {character}
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
      var classes = [];
      classes.push("mdl-cell mdl-cell--" + (this.props.cellsPerAnswer || 4) + "-col");
      if(this.props.answered){
        if(this.props.chosen){
          classes.push('chosen');
        }
        if(this.props.correct){
          classes.push('correct')
        }else if(this.props.chosen){
          classes.push('incorrect')
        }
      }
      return(
        <div className={classes.join(' ')}>
          <Element el={this.props.obj} callback={this.props.callback} />
        </div>
      );
    }
  });

  var Element = React.createClass({
    toggleAudio: function(e){
      quizActions.toggleAudio(this.props.el);
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
          <div onClick={this.toggleAudio} className="mdl-card__actions mdl-card--border">
            <button className="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-js-ripple-effect mdl-button--colored">
              <i className="material-icons">{el.isPlaying() ? 'pause' : 'play_arrow'}</i>
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

  var SlidesNav = React.createClass({
    goTo: function(index){
      router.goTo('/slides/' + index);
    },
    render: function(){
      var _this = this;
      var slides = this.props.slides;
      var current = this.props.current;
      var nodes = slides.map(function(slide, index){
        var classes = ['node'];
        if(index === current){
          classes.push('current');
        }
        if(slide.isDone()){
          classes.push('done');
        }else{
          classes.push('todo');
        }
        return(
          <li onClick={_this.goTo.bind(_this, index + 1)} className={classes.join(' ')}><a>{index + 1}</a></li>
        )
      });
      return (
        <nav className="slides-nav">
          <ol dir="rtl">
            {nodes}
          </ol>
        </nav>
      )
    }
  });

  var SocialIcons = React.createClass({
    render: function(){
      return (
        <div className='social-icons'>
          <div className ='facebook-follow'>
            <a title="Follow us on Facebook" href="https://www.facebook.com/yaser.kamaluddeen" target="_blank">
              <svg className="svg-icon" viewBox="0 0 20 20">
                <path fill="none" d="M11.344,5.71c0-0.73,0.074-1.122,1.199-1.122h1.502V1.871h-2.404c-2.886,0-3.903,1.36-3.903,3.646v1.765h-1.8V10h1.8v8.128h3.601V10h2.403l0.32-2.718h-2.724L11.344,5.71z"></path>
              </svg>
            </a>
          </div>
          <div className ='twitter-follow'>
            <a title="Follow us on Twitter" href="https://twitter.com/thedecimal" target="_blank">
              <svg className="svg-icon" viewBox="0 0 20 20">
                <path fill="none" d="M18.258,3.266c-0.693,0.405-1.46,0.698-2.277,0.857c-0.653-0.686-1.586-1.115-2.618-1.115c-1.98,0-3.586,1.581-3.586,3.53c0,0.276,0.031,0.545,0.092,0.805C6.888,7.195,4.245,5.79,2.476,3.654C2.167,4.176,1.99,4.781,1.99,5.429c0,1.224,0.633,2.305,1.596,2.938C2.999,8.349,2.445,8.19,1.961,7.925C1.96,7.94,1.96,7.954,1.96,7.97c0,1.71,1.237,3.138,2.877,3.462c-0.301,0.08-0.617,0.123-0.945,0.123c-0.23,0-0.456-0.021-0.674-0.062c0.456,1.402,1.781,2.422,3.35,2.451c-1.228,0.947-2.773,1.512-4.454,1.512c-0.291,0-0.575-0.016-0.855-0.049c1.588,1,3.473,1.586,5.498,1.586c6.598,0,10.205-5.379,10.205-10.045c0-0.153-0.003-0.305-0.01-0.456c0.7-0.499,1.308-1.12,1.789-1.827c-0.644,0.28-1.334,0.469-2.06,0.555C17.422,4.782,17.99,4.091,18.258,3.266"></path>
              </svg>
            </a>
          </div>
        </div>
      )
    }
  });

  React.render(
    <Quiz />,
    document.getElementById('root')
  );
};

module.exports = initReact;