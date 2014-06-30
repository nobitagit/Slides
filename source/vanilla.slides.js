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
            active: false,
            effect: "slide",
            interval: 5000,
            auto: false,
            swap: true,
            pauseOnHover: false,
            restartDelay: 2500
          },
          effect: {
            slide: {
              speed: 500
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

    Slidesjs.prototype.init = function(){
      console.log(this);

      var element, nextButton, pagination, playButton, prevButton, stopButton,
        _this = this;

      this.data = {
        animating : false,
        touch : false,
        current : ( _this.options.start - 1 ),
        vendorPrefix : null,
        slidesCount : 0,
        total : null
      };

      //this.data.total = _this.data.slides.length;

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
      // TODO: uncomment
      //this.update();

      // TODO: refactor and put it inside the first if.. with eventlisteners
      if (this.data.touch) {
          // TODO: uncomment
          //this._setuptouch();
      }

      console.log(this.data.current, this.options.start )

      this.slides = this.slidesControl.children;
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
            _this.goto( (selectedSlide * 1) + 1);
          });
        }
      }
      window.addEventListener('resize', function(){
        _this.update();
      });

      // get the original dimensions of the 1st image
      this._getImgSize( this.slides[0].src );
      this._setActive();
      if (this.options.play.auto) {
        this.play();
      }
      return this.options.callback.loaded(this.options.start);
    };

    Slidesjs.prototype._getImgSize = function(imgSrc) {
      var newImg = new Image()
          _this = this;

      newImg.onload = function() {
        _this.data.imgHeight =  newImg.height;
        _this.data.imgWidth = newImg.width; 
      }

      newImg.src = imgSrc; // this must be done AFTER setting onload
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
      this.update();
    };

    Slidesjs.prototype.update = function() {
      var height, width;
      for ( i = 0; i < this.data.slidesCount; i++ ){
        if ( i !== this.data.current ){
          this.slides[i].style.display = 'none';
          this.slides[i].style.left = '0';
          this.slides[i].style.zIndex = '0';
        }
      }

      width = parseInt(window.getComputedStyle(this.slides[ this.data.current ]).getPropertyValue('width'));
      height = window.getComputedStyle(this.slides[ this.data.current ]).getPropertyValue('height');
      console.log(height)
      this.options.width = ( width * parseInt(this.data.imgWidth) ) / parseInt(this.data.imgHeight);
      console.log( this.data.imgWidth )
      this.options.height = height;
      this.slidesControl.style.width = width;
      this.slidesControl.style.height = height;

    };

    // Plugin.prototype.update = function() {
    //   var $element, height, width;
    //   $element = $(this.element);
    //   this.data = $.data(this);
    //   $(".slidesjs-control", $element).children(":not(:eq(" + this.data.current + "))").css({
    //     display: "none",
    //     left: 0,
    //     zIndex: 0
    //   });
    //   width = $element.width();
    //   height = (this.options.height / this.options.width) * width;
    //   this.options.width = width;
    //   this.options.height = height;
    //   return $(".slidesjs-control, .slidesjs-container", $element).css({
    //     width: width,
    //     height: height
    //   });
    // };

/*

    Plugin.prototype.update = function() {
      var $element, height, width;
      $element = $(this.element);
      this.data = $.data(this);
      $(".slidesjs-control", $element).children(":not(:eq(" + this.data.current + "))").css({
        display: "none",
        left: 0,
        zIndex: 0
      });
      width = $element.width();
      height = (this.options.height / this.options.width) * width;
      this.options.width = width;
      this.options.height = height;
      return $(".slidesjs-control, .slidesjs-container", $element).css({
        width: width,
        height: height
      });
    };
    Plugin.prototype.next = function(effect) {
      var $element;
      $element = $(this.element);
      this.data = $.data(this);
      $.data(this, "direction", "next");
      if (effect === void 0) {
        effect = this.options.navigation.effect;
      }
      if (effect === "fade") {
        return this._fade();
      } else {
        return this._slide();
      }
    };
    Plugin.prototype.previous = function(effect) {
      var $element;
      $element = $(this.element);
      this.data = $.data(this);
      $.data(this, "direction", "previous");
      if (effect === void 0) {
        effect = this.options.navigation.effect;
      }
      if (effect === "fade") {
        return this._fade();
      } else {
        return this._slide();
      }
    };
    Plugin.prototype.goto = function(number) {
      var $element, effect;
      $element = $(this.element);
      this.data = $.data(this);
      if (effect === void 0) {
        effect = this.options.pagination.effect;
      }
      if (number > this.data.total) {
        number = this.data.total;
      } else if (number < 1) {
        number = 1;
      }
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
    Plugin.prototype._setuptouch = function() {
      var $element, next, previous, slidesControl;
      $element = $(this.element);
      this.data = $.data(this);
      slidesControl = $(".slidesjs-control", $element);
      next = this.data.current + 1;
      previous = this.data.current - 1;
      if (previous < 0) {
        previous = this.data.total - 1;
      }
      if (next > this.data.total - 1) {
        next = 0;
      }
      slidesControl.children(":eq(" + next + ")").css({
        display: "block",
        left: this.options.width
      });
      return slidesControl.children(":eq(" + previous + ")").css({
        display: "block",
        left: -this.options.width
      });
    };
    Plugin.prototype._touchstart = function(e) {
      var $element, touches;
      $element = $(this.element);
      this.data = $.data(this);
      touches = e.originalEvent.touches[0];
      this._setuptouch();
      $.data(this, "touchtimer", Number(new Date()));
      $.data(this, "touchstartx", touches.pageX);
      $.data(this, "touchstarty", touches.pageY);
      return e.stopPropagation();
    };
    Plugin.prototype._touchend = function(e) {
      var $element, duration, prefix, slidesControl, timing, touches, transform,
        _this = this;
      $element = $(this.element);
      this.data = $.data(this);
      touches = e.originalEvent.touches[0];
      slidesControl = $(".slidesjs-control", $element);
      if (slidesControl.position().left > this.options.width * 0.5 || slidesControl.position().left > this.options.width * 0.1 && (Number(new Date()) - this.data.touchtimer < 250)) {
        $.data(this, "direction", "previous");
        this._slide();
      } else if (slidesControl.position().left < -(this.options.width * 0.5) || slidesControl.position().left < -(this.options.width * 0.1) && (Number(new Date()) - this.data.touchtimer < 250)) {
        $.data(this, "direction", "next");
        this._slide();
      } else {
        prefix = this.data.vendorPrefix;
        transform = prefix + "Transform";
        duration = prefix + "TransitionDuration";
        timing = prefix + "TransitionTimingFunction";
        slidesControl[0].style[transform] = "translateX(0px)";
        slidesControl[0].style[duration] = this.options.effect.slide.speed * 0.85 + "ms";
      }
      slidesControl.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd", function() {
        prefix = _this.data.vendorPrefix;
        transform = prefix + "Transform";
        duration = prefix + "TransitionDuration";
        timing = prefix + "TransitionTimingFunction";
        slidesControl[0].style[transform] = "";
        slidesControl[0].style[duration] = "";
        return slidesControl[0].style[timing] = "";
      });
      return e.stopPropagation();
    };
    Plugin.prototype._touchmove = function(e) {
      var $element, prefix, slidesControl, touches, transform;
      $element = $(this.element);
      this.data = $.data(this);
      touches = e.originalEvent.touches[0];
      prefix = this.data.vendorPrefix;
      slidesControl = $(".slidesjs-control", $element);
      transform = prefix + "Transform";
      $.data(this, "scrolling", Math.abs(touches.pageX - this.data.touchstartx) < Math.abs(touches.pageY - this.data.touchstarty));
      if (!this.data.animating && !this.data.scrolling) {
        e.preventDefault();
        this._setuptouch();
        slidesControl[0].style[transform] = "translateX(" + (touches.pageX - this.data.touchstartx) + "px)";
      }
      return e.stopPropagation();
    };
    Plugin.prototype.play = function(next) {
      var $element, currentSlide, slidesContainer,
        _this = this;
      $element = $(this.element);
      this.data = $.data(this);
      if (!this.data.playInterval) {
        if (next) {
          currentSlide = this.data.current;
          this.data.direction = "next";
          if (this.options.play.effect === "fade") {
            this._fade();
          } else {
            this._slide();
          }
        }
        $.data(this, "playInterval", setInterval((function() {
          currentSlide = _this.data.current;
          _this.data.direction = "next";
          if (_this.options.play.effect === "fade") {
            return _this._fade();
          } else {
            return _this._slide();
          }
        }), this.options.play.interval));
        slidesContainer = $(".slidesjs-container", $element);
        if (this.options.play.pauseOnHover) {
          slidesContainer.unbind();
          slidesContainer.bind("mouseenter", function() {
            return _this.stop();
          });
          slidesContainer.bind("mouseleave", function() {
            if (_this.options.play.restartDelay) {
              return $.data(_this, "restartDelay", setTimeout((function() {
                return _this.play(true);
              }), _this.options.play.restartDelay));
            } else {
              return _this.play();
            }
          });
        }
        $.data(this, "playing", true);
        $(".slidesjs-play", $element).addClass("slidesjs-playing");
        if (this.options.play.swap) {
          $(".slidesjs-play", $element).hide();
          return $(".slidesjs-stop", $element).show();
        }
      }
    };
    Plugin.prototype.stop = function(clicked) {
      var $element;
      $element = $(this.element);
      this.data = $.data(this);
      clearInterval(this.data.playInterval);
      if (this.options.play.pauseOnHover && clicked) {
        $(".slidesjs-container", $element).unbind();
      }
      $.data(this, "playInterval", null);
      $.data(this, "playing", false);
      $(".slidesjs-play", $element).removeClass("slidesjs-playing");
      if (this.options.play.swap) {
        $(".slidesjs-stop", $element).hide();
        return $(".slidesjs-play", $element).show();
      }
    };
    Plugin.prototype._slide = function(number) {
      var $element, currentSlide, direction, duration, next, prefix, slidesControl, timing, transform, value,
        _this = this;
      $element = $(this.element);
      this.data = $.data(this);
      if (!this.data.animating && number !== this.data.current + 1) {
        $.data(this, "animating", true);
        currentSlide = this.data.current;
        if (number > -1) {
          number = number - 1;
          value = number > currentSlide ? 1 : -1;
          direction = number > currentSlide ? -this.options.width : this.options.width;
          next = number;
        } else {
          value = this.data.direction === "next" ? 1 : -1;
          direction = this.data.direction === "next" ? -this.options.width : this.options.width;
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
        if (number > -1) {
          slidesControl.children(":not(:eq(" + currentSlide + "))").css({
            display: "none",
            left: 0,
            zIndex: 0
          });
        }
        slidesControl.children(":eq(" + next + ")").css({
          display: "block",
          left: value * this.options.width,
          zIndex: 10
        });
        this.options.callback.start(currentSlide + 1);
        if (this.data.vendorPrefix) {
          prefix = this.data.vendorPrefix;
          transform = prefix + "Transform";
          duration = prefix + "TransitionDuration";
          timing = prefix + "TransitionTimingFunction";
          slidesControl[0].style[transform] = "translateX(" + direction + "px)";
          slidesControl[0].style[duration] = this.options.effect.slide.speed + "ms";
          return slidesControl.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd", function() {
            slidesControl[0].style[transform] = "";
            slidesControl[0].style[duration] = "";
            slidesControl.children(":eq(" + next + ")").css({
              left: 0
            });
            slidesControl.children(":eq(" + currentSlide + ")").css({
              display: "none",
              left: 0,
              zIndex: 0
            });
            $.data(_this, "current", next);
            $.data(_this, "animating", false);
            slidesControl.unbind("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd");
            slidesControl.children(":not(:eq(" + next + "))").css({
              display: "none",
              left: 0,
              zIndex: 0
            });
            if (_this.data.touch) {
              _this._setuptouch();
            }
            return _this.options.callback.complete(next + 1);
          });
        } else {
          return slidesControl.stop().animate({
            left: direction
          }, this.options.effect.slide.speed, (function() {
            slidesControl.css({
              left: 0
            });
            slidesControl.children(":eq(" + next + ")").css({
              left: 0
            });
            return slidesControl.children(":eq(" + currentSlide + ")").css({
              display: "none",
              left: 0,
              zIndex: 0
            }, $.data(_this, "current", next), $.data(_this, "animating", false), _this.options.callback.complete(next + 1));
          }));
        }
      }
    };
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
