var SignalZen = (function() {
  var instance;
  var Cookie = {
    set: function set(name, value, days) {
      var domain, domainParts, date, expires, host;

      if (days) {
        date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toGMTString();
      } else {
        expires = "";
      }

      host = location.host;
      if (host.split(".").length === 1) {
        // no "." in a domain - it's localhost or something similar
        document.cookie = name + "=" + value + expires + "; path=/";
      } else {
        // Remember the cookie on all subdomains.
        //
        // Start with trying to set cookie to the top domain.
        // (example: if user is on foo.com, try to set
        //  cookie to domain ".com")
        //
        // If the cookie will not be set, it means ".com"
        // is a top level domain and we need to
        // set the cookie to ".foo.com"
        domainParts = host.split(".");
        domainParts.shift();
        domain = "." + domainParts.join(".");

        document.cookie =
          name + "=" + value + expires + "; path=/; domain=" + domain;

        // check if cookie was successfuly set to the given domain
        // (otherwise it was a Top-Level Domain)
        if (Cookie.get(name) == null || Cookie.get(name) != value) {
          // append "." to current domain
          domain = "." + host;
          document.cookie =
            name + "=" + value + expires + "; path=/; domain=" + domain;
        }
      }
    },

    get: function get(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(";");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1, c.length);
        }

        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    },

    erase: function erase(name) {
      Cookie.set(name, "", -1);
    }
  };

  function SignalZen(options) {
    if (typeof instance != "undefined") {
      throw new Error("Signalzen client can only be instantiated once.");
    }
    this.options = options;
    this.height = 0;
    this.width = 0;
    this.appUrl = 'http://localhost:4201';

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
      return 'position: fixed; border:none; top: ' + this.getTopPx() + 'px; left: ' + this.getLeftPx() + 'px; z-index:10000; height: ' + this.height + 'px; width: ' + this.width + 'px;';
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
        if (typeof e.data === 'object') {
          return;
        }
        var data = window.JSON.parse(e.data);
        if (data.event == 'resize') {
          self.width = data.params.width;
          self.height = data.params.height;
        }
        if (data.event == 'loaded') {
          self.sendUserDataIfAny();
          self.sendUserURL();
        }
        self.setFrameStyle();
        if (data.event == 'resize') {
          self.postMessage({ event: 'resized', params: {} });
        }

        if (data.event == 'setCookie') {
          Cookie.set(data.name, data.value);
        }

        if (data.event == 'deleteCookie') {
          Cookie.erase(data.name);
        }

        if (data.event == 'getCookie') {
          self.postMessage({
            event: 'getCookie',
            name: data.name,
            value: Cookie.get(data.name),
            identifier: data.identifier
          });
        }
      });
    };

    this.windowHeight = function() {
      var w = window,
      d = document,
      e = d.documentElement,
      // g = d.getElementsByTagName('body')[0];
      a = [];
      if (w.innerHeight > 0) {
        a.push(w.innerHeight);
      }
      if (e.clientHeight > 0) {
        a.push(e.clientHeight);
      }
      // if (g.clientHeight > 0) {
      //   a.push(g.clientHeight);
      // }
      return Math.min.apply(null, a);
    };

    this.windowWidth = function() {
      var w = window,
      d = document,
      e = d.documentElement,
      // g = d.getElementsByTagName('body')[0];
      a = [];
      if (w.innerWidth > 0) {
        a.push(w.innerWidth);
      }
      if (e.clientWidth > 0) {
        a.push(e.clientWidth);
      }
      // if (g.clientWidth > 0) {
      //   a.push(g.clientWidth);
      // }
      return Math.min.apply(null, a);
    };

    this.createFrame = function() {
      var iframe = document.createElement("IFRAME");
      iframe.src = this.appUrl + '/' + this.options.appId;
      iframe.frameBorder = 'none';
      iframe.id = 'signal_zen_frame';
      document.body.appendChild(iframe);
    };

    this.sendUserDataIfAny = function() {
      if (this.options.userData !== undefined && this.options.userData !== null) {
        this.postMessage({ event: 'setUserData', params: this.options.userData });
      }
    };

    this.sendUserURL = function() {
      this.postMessage({ event: 'setUserURL', params: { url: window.location.href } });
    };

    this.postMessage = function(data) {
      var jsonData = window.JSON.stringify(data);
      this.getFrame().contentWindow.postMessage(jsonData, '*');
    };

    this.checkForSizeChanges = function() {
      var self = this;
      var width = this.windowWidth();
      var height = this.windowHeight();
      if (this.currentWindowWidth !== width || this.currentWindowHeight !== height) {
        this.setFrameStyle();
      }
      this.currentWindowWidth = width;
      this.currentWindowHeight = height;
      setTimeout(function() {
        self.checkForSizeChanges();
      }, 1000);
    };
    // Keep a closured reference to the instance
    instance = this;
  }

  // Add public methods to Client.prototype
  SignalZen.prototype.load = function() {
    var self = this;
    this.createFrame();

    this.setFrameStyle();

    this.bindEvent(window, 'resize', function (e) {
      self.setFrameStyle();
    });
    this.checkForSizeChanges();
    this.bindMessageFromFrameEvent();
  };

  SignalZen.reloadOptions = function(options) {
    SignalZen.getInstance().options = options;
    SignalZen.getInstance().sendUserDataIfAny();
    SignalZen.getInstance().sendUserURL();
  };

  SignalZen.pushUserData = function(userData) {
    SignalZen.getInstance().options.userData = userData;
    SignalZen.getInstance().sendUserDataIfAny();
    SignalZen.getInstance().sendUserURL();
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
