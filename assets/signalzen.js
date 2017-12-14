var SignalZen = (function() {
  var instance;

  function SignalZen(options) {
    if (typeof instance != "undefined") {
      throw new Error("Signalzen client can only be instantiated once.");
    }
    this.options = options;
    this.height = 70;
    this.width = 65;

    this.getTopPx = function() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      var topPx = this.windowHeight() - this.height;
      return topPx;
    };
    this.getLeftPx = function() {
      var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
      var leftPx = this.windowWidth() - this.width;
      return leftPx;
    };
    this.frameStyle = function() {
      return 'position: fixed; top: ' + this.getTopPx() + 'px; left: ' + this.getLeftPx() + 'px; z-index:10000; height: ' + this.height + 'px; width: ' + this.width + 'px;';
    };
    this.getFrame = function() {
      return document.getElementById('signal_zen_frame');
    };

    this.setFrameStyle = function() {
      this.getFrame().style.cssText = this.frameStyle();
    };

    this.bindEvent = function(element, eventName, eventHandler) {
      if (element.addEventListener){
          element.addEventListener(eventName, eventHandler, false);
      } else if (element.attachEvent) {
          element.attachEvent('on' + eventName, eventHandler);
      }
    };

    this.bindMessageFromFrameEvent = function() {
      var self = this;
      this.bindEvent(window, 'message', function (e) {
        if (e.data == 'chat') {
          self.width = 300;
          self.height = 530;
        }
        if (e.data == 'icon') {
          self.width = 65;
          self.height = 70;
        }
        if (e.data == 'loaded') {
          self.sendUserDataIfAny();
        }
        self.setFrameStyle();
      });
    };

    this.windowHeight = function() {
      var w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0];
      return w.innerHeight|| e.clientHeight|| g.clientHeight;
    };

    this.windowWidth = function() {
      var w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0];
      return w.innerWidth || e.clientWidth || g.clientWidth;
    };

    this.createFrame = function() {
      var iframe = document.createElement("IFRAME");
      iframe.src = 'http://localhost:4201/' + this.options.appId;
      iframe.frameBorder = 'none';
      iframe.id = 'signal_zen_frame';
      document.body.appendChild(iframe);
    };

    this.sendUserDataIfAny = function() {
      var self = this;
      if (this.options.userData !== undefined && this.options.userData !== null) {
        this.getFrame().contentWindow.postMessage({ call: 'setUserData', value: this.options.userData }, '*');
      }
    };

    // Keep a closured reference to the instance
    instance = this;
  }

  // Add public methods to Client.prototype
  SignalZen.prototype.load = function() {
    var self = this;
    this.createFrame();

    this.setFrameStyle();

    window.onresize = function() {
      self.setFrameStyle();
    };

    window.onscroll = function() {
      self.setFrameStyle();
    };

    this.bindMessageFromFrameEvent();
  };

  SignalZen.reloadOptions = function(options) {
    SignalZen.getInstance().options = options;
    SignalZen.getInstance().sendUserDataIfAny();
  };

  SignalZen.getInstance = function() {
    if (typeof instance == "undefined") {
      return new this();
    }
    else {
      return instance;
    }
  };

  // Return the constructor
  return SignalZen;
})();
