var React = require('react')
var pubsub = require('../modules/events.js')
var assetLoader = require('../modules/asset_loader.js')
var factory = require('../modules/factory')
var initReact = function(data){
  var Quiz = React.createClass({
    getInitialState: function() {
      return {
        loaded: false,
        slides: [],
        current: 0,
        max: 0
      };
    },
    nextSlide: function(){
      var slides = this.state.slides
      var current = this.state.current
      if((current + 1) < slides.length){
        slides[current].blur();      
        slides[current + 1].focus();
        this.setState({current: current + 1, max: Math.max(this.state.max, current + 1)});
      }
    },
    prevSlide: function(){
      var slides = this.state.slides
      var current = this.state.current
      if((current - 1) >= 0){
        slides[current].blur();
        slides[current - 1].focus();
        this.setState({current: current - 1});
      }
    },
    computeStyle: function(index){
      var multiplier = 1;
      // if(this.currentDir == 'ltr') multiplier = -1;
      return {left: 100 * multiplier * (this.state.current - index) + "%"}
    },
    checkAnswer: function(question,answer){
      if(question.checkAnswer(answer)){
        alert('correct');
      }else{
        alert('wrong');
      }
    },
    componentDidMount: function() {
      var _this = this;
      pubsub.subscribe('action:question-answered', function(question, answer){
        _this.checkAnswer(question,answer)
        _this.nextSlide();
      });
      pubsub.subscribe('action:next-slide', function(question, answer){
        if(_this.state.current < _this.state.max || !_this.state.slides[_this.state.current].isQuestionSlide){
          _this.nextSlide();
        }
      });
      pubsub.subscribe('action:prev-slide', function(question, answer){
        _this.prevSlide();
      });

      document.onkeydown = function(e){
        if(_this.state.loaded){
          pubsub.trigger('action:key-down', e);
        }
      }
      pubsub.subscribe('action:key-down', this.handleKeyDown);

      var slides = factory.createSlides(data);
      assetLoader.load().then(function(){
        this.setState({slides: slides, loaded: true})
        if(slides.length > 0){
          slides[0].focus();
        }
      }.bind(this), console.error);
    },
    handleKeyDown: function(e){
      if(e.which == 39){
        pubsub.trigger('action:prev-slide');
      }else if(e.which == 37 || e.which == 32){
        pubsub.trigger('action:next-slide');
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
          <Progressbar />
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
    focus: function(){
      var slide = this.props.slide;
      slide.focus();
    },
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
    getInitialState: function() {
      return {
        progress: 0
      };
    },
    componentDidMount: function(){
      var _this = this;
      pubsub.subscribe('asset_loader:resource_loaded', function(loaded, total){
        var progress = (loaded / total) * 100
        _this.setState({progress: Math.floor(progress)});
      });
    },
    render: function(){
      var barStyle = {minWidth: '2em', width: this.state.progress + '%'};
      return (
        <div className="progress">
          <div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow={this.state.progress} aria-valuemin="0" aria-valuemax="100" style={barStyle}>
            {this.state.progress + '%'}
          </div>
        </div>
      )
    }
  })

  var Question = React.createClass({
    answerWith: function(answer){
      var question = this.props.question
      pubsub.trigger('action:question-answered', question, answer)
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