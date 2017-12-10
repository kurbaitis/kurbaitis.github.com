function SignalZen(options) {

  this.options = options;
  this.height = 70;
  this.width = 65;

  this.getTopPx = function() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    var topPx = this.windowHeight() - this.height + scrollTop;
    var clientHeight = document.body.offsetHeight - this.height;
    if (topPx > clientHeight) {
      topPx = clientHeight;
    }
    return topPx;
  };
  this.getLeftPx = function() {
    var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    var leftPx = this.windowWidth() - this.width + scrollLeft;
    var clientWidth = document.body.offsetWidth - this.width;
    if (leftPx > clientWidth) {
      leftPx = clientWidth;
    }
    return leftPx;
  };
  this.frameStyle = function() {
    return 'position: absolute; top: ' + this.getTopPx() + 'px; left: ' + this.getLeftPx() + 'px; z-index:10000; height: ' + this.height + 'px; width: ' + this.width + 'px; padding-right: 10px;';
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
    document.body.appendChild(iframe)
  };

  this.sendUserDataIfAny = function() {
    var self = this;
    if (this.options.userData !== undefined && this.options.userData !== null) {
      this.getFrame().contentWindow.postMessage({ call: 'setUserData', value: this.options.userData }, '*');
    }
  };
}
window.onload = function() {
  var signalZen = new SignalZen(_sz);

  signalZen.createFrame();

  signalZen.setFrameStyle();

  window.onresize = function() {
    signalZen.setFrameStyle();
  };

  window.onscroll = function() {
    signalZen.setFrameStyle();
  };

  signalZen.bindMessageFromFrameEvent();
};
