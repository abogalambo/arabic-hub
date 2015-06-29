var React = require('react')
var quizStore = require('../stores/quiz_store')
var quizActions = require('../actions/quiz_actions')

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
        // TODO use flux
        if(_this.state.loaded){
          _this.handleKeyDown(e)
        }
      }
    },
    handleKeyDown: function(e){
      if(e.which == 39){
        quizActions.prevSlide();
      }else if(e.which == 37 || e.which == 32){
        quizActions.nextSlide();
      }
    },
    render: function() {
      var _this = this;
      var content = "";
      if(this.state.loaded){
        content = this.state.slides.map(function(slide, index){
          return (
            <div className='page' style={_this.computeStyle(index)}>
              <Slide slide={slide} />
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
        slideContent = (
          <div>
            {slide.intro}
            <Element el={slide.audio} />
          </div>
        )
      }else if(slide.isQuestionSlide){
        slideContent = (
          <Question question={slide.question} />
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
      quizActions.questionAnswered(question, answer);
    },
    render: function() {
      var question = this.props.question
      var _this = this;
      var answers = question.answers.map(function(a){
        return(
          <div>
            <Element el={a} />
            <div onClick={_this.answerWith.bind(_this, a)}> Pick this </div>
          </div>
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

  var Element = React.createClass({
    play: function(){
      this.props.el.playAudio();
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