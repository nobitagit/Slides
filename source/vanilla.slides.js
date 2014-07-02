(function() {

  (function(window, document) {
    var Slidesjs,
        navigationClass = 'slidesjs-navigation',
        slideStyles = {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 0,
          display: 'none',
          webkitBackfaceVisibility: 'hidden'          
        };

    Slidesjs = function(element, opts){
      this.element = element;
      this.slidesContainer;
      this.nextButton;
      this.prevButton;
      this.playButton;
      this.stopButton;

      // Default options
      this.options = {
          width: 940,
          height: 528,
          start: 1,
          navigation: {
            active: true,
            effect: "slide"
          },
          pagination: {
            active: true,
            effect: "slide"
          },
          play: {
            active: true, // TODO: set to false by def.
            effect: "slide",
            interval: 5000,
            auto: false,
            swap: true,
            pauseOnHover: false,
            restartDelay: 2500
          },
          effect: {
            slide: {
              speed: 5000
            },
            fade: {
              speed: 300,
              crossfade: true
            }
          },
          callback: {
            loaded: function() {},
            start: function() {},
            complete: function() {}
          }
        };
      // Override defaults
      if( opts ){
        for ( var opt in opts ){
          this.options[opt] = opts[opt];
        }
      }
      this.init();
    };

    Slidesjs.prototype.init = function(imgSrc) {
      var newImg = new Image(),
          _this = this;

      this.data = {
        animating : false,
        scrolling: false,
        touch : false,
        current : ( _this.options.start - 1 ),
        vendorPrefix : null,
        slidesCount : 0,
        total : null,
        originalH : null,
        originalW : null,
        direction : null,
        // width & height of the slides, assigned in the 'update' method
        width : null,
        height : null,

        touchTimer : null,
        touchStartX : null,
        touchStartY : null
      };

      // TODO: give the possibility to pass values on instantiation so to skip this part
      // and go straight to setup
      newImg.onload = function() {
        _this.data.originalH =  newImg.height;
        _this.data.originalW = newImg.width; 

        _this.setup();
      }
      // get the src of the given image or default to the starting one so we now that the first
      // image visibile is loaded and then we kick everything off.
      newImg.src = imgSrc || this.element.getElementsByTagName('img')[this.data.current].src; // this must be done AFTER setting onload
    };

    Slidesjs.prototype.setup = function(){

      var element, nextButton, pagination, playButton, prevButton, stopButton,
        _this = this;

      if (typeof TouchEvent !== "undefined") {
        this.data.touch = true;
        this.options.effect.slide.speed = this.options.effect.slide.speed / 2;
      }

      this.element.style.overflow = 'hidden';

      // wrap all slides with a div
      var len = _this.element.children.length;

      this.slidesControl = document.createElement('div');

      // loop over every child of the main element
      while(len--){
        var slide = this.element.children[len];
        // if it's not the navigation then it's a slide so...
        if ( slide.className !== navigationClass ) {
          // count it as a slide
          this.data.slidesCount += 1;
          slide.setAttribute('class', 'slidesjs-slide');
          // set stylings as needed for each img
          for ( prop in slideStyles){
            slide.style[prop] = slideStyles[prop];
          }
          //slide.style.display = 'none';
          //slide.setAttribute('class', 'slidesjs-slide');
          // set the position in a custom attr
          slide.setAttribute('slidesjs-index', len);
          // and insert it as the first child of the new wrapping div
          // (mind that that we're looping in reverse order)
          this.slidesControl.insertBefore(slide, this.slidesControl.firstChild);
        }
      }
      this.slidesControl.style.position = 'relative';
      this.slidesControl.style.overflow = 'hidden';

      this.slidesContainer = document.createElement('div');
      this.slidesContainer.style.position = 'relative';
      this.slidesContainer.style.left = 0;

      this.slidesContainer.insertBefore(this.slidesControl, this.slidesContainer.firstChild);
      this.element.insertBefore(this.slidesContainer, this.element.firstChild);  

      this.slidesContainer.setAttribute('class', 'slidesjs-container');
      this.slidesControl.setAttribute('class', 'slidesjs-control');

      if (this.data.touch) {
        this.slidesControl.addEventListener('touchstart', function(e){
          return _this._touchstart(e);
        });
        this.slidesControl.addEventListener('touchmove', function(e){
          return _this._touchmove(e);          
        });
        this.slidesControl.addEventListener('touchend', function(e){
          return _this._touchend(e);          
        });

      }

      this.element.style.display = 'block';

      console.log(this.data.current, this.options.start )

      this.slides = this.slidesControl.children;
      this.data.total = _this.slides.length;

      this.slides[ this.data.current ].style.display = 'block';
      this.slides[ this.data.current ].style.zIndex = 10;
      
      if (this.options.navigation.active) {
        prevButton = document.createElement('a');
        prevButton.innerHTML = 'Previous';
        this.element.appendChild(prevButton);
        nextButton = document.createElement('a');
        nextButton.innerHTML = 'Next';
        this.element.appendChild(nextButton);

        // TODO: refactor with a custom unified event
        prevButton.href = '#';
        nextButton.href = '#';
        prevButton.setAttribute('title', 'Previous');        
        nextButton.setAttribute('title', 'Next');        
        prevButton.setAttribute('class', 'slidesjs-previous slidesjs-navigation');        
        nextButton.setAttribute('class', 'slidesjs-next slidesjs-navigation');

        // TODO: refactor with evt delegation & unique method for both
        prevButton.addEventListener('click', function(e){
          e.preventDefault();
          alert('hi')
          _this.stop(true);
          _this.previous(_this.options.navigation.effect);
        });
        nextButton.addEventListener('click', function(e){
          e.preventDefault();
          alert('hiss')
          _this.stop(true);
          _this.next(_this.options.navigation.effect);
        });

        this.nextButton = nextButton;
        this.prevButton = prevButton;
      }

      if (this.options.play.active) {
        playButton = document.createElement('a');
        playButton.innerHTML = 'Play';
        this.element.appendChild(playButton);
        stopButton = document.createElement('a');
        stopButton.innerHTML = 'Stop';
        this.element.appendChild(stopButton);

        // TODO: refactor with a custom unified event
        playButton.href = '#';
        stopButton.href = '#';
        playButton.setAttribute('title', 'play');        
        stopButton.setAttribute('title', 'stop');        
        playButton.setAttribute('class', 'slidesjs-play slidesjs-navigation');        
        stopButton.setAttribute('class', 'slidesjs-stop slidesjs-navigation');

        this.playButton = playButton;
        this.stopButton = stopButton;
        console.log(this.playButton)

        playButton.addEventListener('click', function(e){
          e.preventDefault();
          _this.play(true);
        });
        stopButton.addEventListener('click', function(e){
          e.preventDefault();
          _this.stop(true);
        });
        if (this.options.play.swap) {
          stopButton.style.display = 'none';
        }

      }

      if (this.options.pagination.active) {
        pagination = document.createElement('ul');
        this.element.appendChild(pagination);

        console.log(this.data.slidesCount)
        

        for ( var i = 0; i <  this.data.slidesCount ; i++){
          var paginationItem, paginationLink;
          paginationItem = document.createElement('li');
          paginationLink = document.createElement('a');

          paginationItem.className = 'slidesjs-pagination'; 
          paginationLink.setAttribute('data-slidesjs-item', i);
          paginationLink.href = '#';
          paginationLink.innerHTML = i + 1;

          pagination.appendChild(paginationItem);
          paginationItem.appendChild(paginationLink);

          // TODO: refactor with evt delegation on ul rather that each li
          paginationLink.addEventListener('click', function(e){
            e.preventDefault();
            _this.stop(true);

            var selectedSlide = e.currentTarget.getAttribute('data-slidesjs-item');
            _this.goTo( (selectedSlide * 1) + 1);
          });
        }
      }
      window.addEventListener('resize', function(){
        // TODO: consider throttling and deboucing this event to avoid too many firings
        _this.update();
      });

      this._setActive();
      if (this.options.play.auto) {
        this.play();
      }
      // TODO: refactor and put it inside the first if.. with eventlisteners
      // mind that this goes after dimensions of imgs have been calculated
      if (this.data.touch) {
          // TODO: uncomment
          this._setuptouch();
      }


      return this.options.callback.loaded(this.options.start);
    };

    Slidesjs.prototype._setActive = function(number) {
      var current;

      current = number > -1 ? number : this.data.current;
      var active = this.element.getElementsByClassName('active');
              console.log(active)

      if ( active[0] !== undefined ){
        // TODO: possible clash if the user sets his own class
        // rewrite with classList.add & remove logic
        active[0].classList.remove('active');
      }
      this.slides[ current ].className += ' active';
      this.data.current = current;
      this.update();
    };

    Slidesjs.prototype.update = function() {
      var height, width;
      for ( var i = 0; i < this.data.slidesCount; i++ ){
        if ( i !== this.data.current ){
          this.slides[i].style.display = 'none';
          this.slides[i].style.left = '0';
          this.slides[i].style.zIndex = '0';
        }
      }
      this.data.width = this.element.getBoundingClientRect().width;
      // set height in order to keep proportions with original img
      this.data.height = Math.round( this.data.originalH * this.data.width / this.data.originalW );

      this.slidesControl.style.width = this.data.width + 'px';
      this.slidesControl.style.height = this.data.height + 'px';

    };

    Slidesjs.prototype.next = function(effect) {
      /* TODO: check this commented part
      if (effect === void 0) {
        effect = this.options.navigation.effect;
      }
      */
      this.data.direction = 'next';
      if ( effect === 'fade') {
        this._fade();
      } else {
        this._slide();
      }
    };

    Slidesjs.prototype.previous = function(effect) {
      this.data.direction = 'previous';
      if ( effect === 'fade' ) {
        this._fade();
      } else {
        this._slide();
      }
    };

    Slidesjs.prototype.goTo = function(number) {
      var effect = this.options.pagination.effect;

      if ( number > this.data.total ){
        number = this.data.total;
      } else if ( number < 1 ){
        number = 1;
      }

      // TODO: refactor once functions are in place
      if (typeof number === "number") {
        if (effect === "fade") {
          return this._fade(number);
        } else {
          return this._slide(number);
        }
      } else if (typeof number === "string") {
        if (number === "first") {
          if (effect === "fade") {
            return this._fade(0);
          } else {
            return this._slide(0);
          }
        } else if (number === "last") {
          if (effect === "fade") {
            return this._fade(this.data.total);
          } else {
            return this._slide(this.data.total);
          }
        }
      }
    };

    Slidesjs.prototype._setuptouch = function() {
      var next, previous, nextSl, previousSl;
      next = this.data.current + 1;
      previous = this.data.current - 1;
      // TODO: refactor
      if (previous < 0) {
        previous = this.data.total - 1;
      }
      if (next > this.data.total - 1) {
        next = 0;
      }
      // TODO: probably these elements should be better off being stored in the this.data
      // to be reused elsewhere.
      nextSl = this.slidesControl.children[next]; 
      nextSl.style.display = 'block';
      nextSl.style.left = this.data.width;

      previousSl = this.slidesControl.children[previous]; 
      previousSl.style.display = 'block';
      previousSl.style.left = -this.data.width;
    };

    Slidesjs.prototype._touchstart = function(e){
      var touches;

      touches = e.touches[0];
      this._setuptouch();
      console.log(e);
      this.data.touchTimer = Number(new Date());
      this.data.touchStartX = touches.pageX;
      this.data.touchStartY = touches.pageY;

      // TODO: check if stopping prop. is indeed needed
      e.stopPropagation();
    };

    Slidesjs.prototype._touchend = function(e){
      console.log('touchend');

      var duration, prefix, timing, touches, transform,
        _this = this;

      touches = e.touches[0];

      // get the current position of the slideControl div, later turning it to absolute as we're
      // not interested in direction here but only on the amout of 'movement' the image gets
      var slidePos = this.slidesControl.offsetLeft;

      if ( Math.abs(slidePos) > this.data.width * 0.5 || // TODO: check these timers accuracy
           Math.abs(slidePos) > this.data.width * 0.1 && (Number(new Date()) - this.data.touchTimer < 250)){
          this.data.direction = slidePos > 0 ? 'previous' : 'next';

          this._slide();
      } else {
          // Slide has not been dragged far enough, animate back to 0 and reset
          console.log(this.slidesControl);  
          console.log( slidePos, this.data.width * 0.5 );

          transform = prefix + "Transform";
          duration = prefix + "TransitionDuration";
          timing = prefix + "TransitionTimingFunction";

          // TODO: refactor maybe? or leave it there and gradually remove as prefix gets ditched
          // from browsers. IE9 will always need ms prefix but supports no transitions.
          // Refactor as later on the same styles get updaed.
          this.slidesControl.style.webkitTransform = "translateX(0px)";
          this.slidesControl.style.msTransform     = "translateX(0px)";
          this.slidesControl.style.transform       = "translateX(0px)";

          // webkit prefix is needed only for old IOS + blackberry. This line will be removed
          this.slidesControl.style.webkitTransition = this.options.effect.slide.speed * 0.85 + 'ms'; 
          this.slidesControl.style.transition       = this.options.effect.slide.speed * 0.85 + 'ms'; 

      }
      // TODO: #IMPORTANT this listener gets set every time the touch ends. Check where to add it so that it's added only once
      this.slidesControl.addEventListener('transitionEnd', function(){
        _this._touchendCallback.apply(_this);
      });
      this.slidesControl.addEventListener('webkitTransitionEnd', function(){
        _this._touchendCallback.apply(_this);
      });

      e.stopPropagation();
    };

    Slidesjs.prototype._touchendCallback= function(){
        // DONT remove this callback until this method gets attached properly, see above TODO.
        console.log('ended');
        this.slidesControl.style.webkitTransform = "";
        this.slidesControl.style.msTransform     = "";
        this.slidesControl.style.transform       = "";

        // webkit prefix is needed only for old IOS + blackberry. This line will be removed
        this.slidesControl.style.webkitTransition = ''; 
        this.slidesControl.style.transition       = ''; 
    };  

    Slidesjs.prototype._touchmove = function(e) {
      console.log('moving');
      var prefix, touches, transform;

      touches = e.touches[0];
      // Check if user is trying to scroll vertically
      this.data.scrolling = Math.abs(touches.pageX - this.data.touchStartX) < Math.abs(touches.pageY - this.data.touchStartY);

      console.log(this.data.scrolling)
      if( !this.data.animating && !this.data.scrolling ){
        // TODO: check this preventdef
        e.preventDefault();
        this._setuptouch();
        this.slidesControl.style.webkitTransform =  'translateX(' + (touches.pageX - this.data.touchstartx) + 'px';
        this.slidesControl.style.transform       =  'translateX(' + (touches.pageX - this.data.touchstartx) + 'px';
      }
      e.stopPropagation();
    };

    // number = slide number on bottom navigation
    Slidesjs.prototype._slide = function(number){
      var currentSlide, direction, duration, next, timing, transform, value,
            _this = this;

      console.log('current form begin slide is: ' + this.data.current)
        //this.data.current = number + 1;
      // TODO: check if this.data.current is set and updated to make sure the
      // following code runs. HEAVY refactor
      if (!this.data.animating && number !== this.data.current + 1) {
        this.data.animating = true;
        if (number > -1) {
          number = number - 1;
          value = number > this.data.current ? 1 : -1;
          direction = number > this.data.current ? -this.data.width : this.data.width;
          next = number; 

        } else {
          value = this.data.direction === "next" ? 1 : -1;
          direction = this.data.direction === "next" ? -this.data.width : this.data.width;
          next = this.data.current + value;
        }
        if (next === -1) {
          next = this.data.total - 1;
        }
        if (next === this.data.total) {
          next = 0;
        }
        this._setActive(next);
        if (number > -1) {
          Array.prototype.forEach.call(this.slides, function(el, idx){
            if( _this.data.current !== idx){
              el.style.display = 'none';
              el.style.left = 0;
              el.style.zIndex = 0;
            }
          });
        }
        this.slides[ next ].style.display = 'block';
        this.slides[ next ].style.left = value * this.options.width;
        this.slides[ next ].style.zIndex = 10;

        //this.options.callback.start(this.data.current + 1);

        // the below part is modern browsers only, put it in an if statement if
        // alternative for older ones is needed
        this.slidesControl.style.webkitTransform = 'translateX(' + direction + 'px)';
        this.slidesControl.style.webkitTransition = this.options.effect.slide.speed + 'ms';

        // TODO: this event is attached at every slide, move this part out soit's
        // attached only once.
        this.slidesControl.addEventListener('webkitTransitionend', function(){
          _this._slideCallback.call(_this, next);
        });
        this.slidesControl.addEventListener('transitionend', function(){
          _this._slideCallback.call(_this, next);
        });
      } 
      console.log('current form end slide is: ' + this.data.current)
      console.log('current "next" is: ' + this.data.current)

    };    

    Slidesjs.prototype._slideCallback = function(next) {
      var _this = this;
      this.slidesControl.style.webkitTransform = '';
      this.slidesControl.style.webkitTransition = '';
      this.slides[ next ].style.left = 0;
      this.slides[ this.data.current ].display = 'none';
      this.slides[ this.data.current ].left = 0;
      this.slides[ this.data.current ].zIndex = 0;

      this.data.current = next;
      this.data.animating = false;
      // TODO: remember to remove this parte once the event is attached only once
      this.slidesControl.removeEventListener('webkitTransitionend');      
      this.slidesControl.removeEventListener('transitionend');  

      // TODO: this event is identical as above, refactor.
      Array.prototype.forEach.call(this.slides, function(el, idx){
        if( _this.data.current !== idx){
          el.style.display = 'none';
          el.style.left = 0;
          el.style.zIndex = 0;
        }
      });    

      if (_this.data.touch) {
        _this._setuptouch();
      }
      // TODO: this callback does not check for its existence and throws error
      //_this.options.callback.complete(next + 1);
    };

    Slidesjs.prototype.play = function(next) {
      var _this = this;

      if( !this.data.playInterval ){
        if( next ){
          console.log('played');
          this.data.direction = 'next';
          if( this.options.play.effect === 'fade' ){
            this._fade();
          } else {
            this._slide();
          }
        }
        // move this outside
        this.data.playInterval = function(){
          // TODO: rewrite with a recursive setTimeout
          setInterval(function(){
            _this.data.direction = 'next';
            if (_this.options.play.effect === "fade") {
              _this._fade();
            } else {
              _this._slide();
            }
          }, this.options.play.interval);
        };
        if (this.options.play.pauseOnHover) {
          this.slidesContainer.addEventListener('mouseenter', function(){
            _this.stop();
          });
          this.slidesContainer.addEventListener('mouseleave', function(){
              setTimeout((function() {
                _this.play(true);
              }), _this.options.play.restartDelay || 1 );
          });
        }
        this.data.playing = true;
        this.playButton.classList.add('slidesjs-playing');
        if( this.options.play.swap ){
          this.playButton.style.display = 'none';
          this.stopButton.style.display = 'block';
        }
      }
    };

    Slidesjs.prototype.stop = function(clicked) {
      console.log('stopped')
      clearInterval(this.data.playInterval);

      if ( this.options.play.pauseOnHover && clicked ){
        // TODO: WTF?????
        //$(".slidesjs-container", $element).unbind();
        alert('check');
      }
      this.data.playInterval = null;
      this.data.playing = null;
      this.playButton.classList.remove('slidesjs-playing');
      if (this.options.play.swap) {
        this.stopButton.display = 'none';
        this.playButton.display = 'block';
      }
    }
/*
    Plugin.prototype._fade = function(number) {
      var $element, currentSlide, next, slidesControl, value,
        _this = this;
      $element = $(this.element);
      this.data = $.data(this);
      if (!this.data.animating && number !== this.data.current + 1) {
        $.data(this, "animating", true);
        currentSlide = this.data.current;
        if (number) {
          number = number - 1;
          value = number > currentSlide ? 1 : -1;
          next = number;
        } else {
          value = this.data.direction === "next" ? 1 : -1;
          next = currentSlide + value;
        }
        if (next === -1) {
          next = this.data.total - 1;
        }
        if (next === this.data.total) {
          next = 0;
        }
        this._setActive(next);
        slidesControl = $(".slidesjs-control", $element);
        slidesControl.children(":eq(" + next + ")").css({
          display: "none",
          left: 0,
          zIndex: 10
        });
        this.options.callback.start(currentSlide + 1);
        if (this.options.effect.fade.crossfade) {
          slidesControl.children(":eq(" + this.data.current + ")").stop().fadeOut(this.options.effect.fade.speed);
          return slidesControl.children(":eq(" + next + ")").stop().fadeIn(this.options.effect.fade.speed, (function() {
            slidesControl.children(":eq(" + next + ")").css({
              zIndex: 0
            });
            $.data(_this, "animating", false);
            $.data(_this, "current", next);
            return _this.options.callback.complete(next + 1);
          }));
        } else {
          return slidesControl.children(":eq(" + currentSlide + ")").stop().fadeOut(this.options.effect.fade.speed, (function() {
            slidesControl.children(":eq(" + next + ")").stop().fadeIn(_this.options.effect.fade.speed, (function() {
              return slidesControl.children(":eq(" + next + ")").css({
                zIndex: 10
              });
            }));
            $.data(_this, "animating", false);
            $.data(_this, "current", next);
            return _this.options.callback.complete(next + 1);
          }));
        }
      }
    };
    Plugin.prototype._getVendorPrefix = function() {
      var body, i, style, transition, vendor;
      body = document.body || document.documentElement;
      style = body.style;
      transition = "transition";
      vendor = ["Moz", "Webkit", "Khtml", "O", "ms"];
      transition = transition.charAt(0).toUpperCase() + transition.substr(1);
      i = 0;
      while (i < vendor.length) {
        if (typeof style[vendor[i] + transition] === "string") {
          return vendor[i];
        }
        i++;
      }
      return false;
    };
    return $.fn[pluginName] = function(options) {
      return this.each(function() {
        if (!$.data(this, "plugin_" + pluginName)) {
          return $.data(this, "plugin_" + pluginName, new Plugin(this, options));
        }
      });
    }; */
    window.Slides = Slidesjs;
  })(window, document);
}).call(this);
