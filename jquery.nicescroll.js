/* jquery.nicescroll
-- versione 1.0.0
-- copyright 2011 InuYaksa*2011
-- licensed under the MIT
--
-- https://github.com/inuyaksa/jquery.nicescroll
--
*/

(function($){

  var AScrollClass = function(myopt) {

    var self = this;
    
    var opt = {
      doc:$("body"),
      win:$(window),
      zindex:9999,
      cursoropacitymin:0,
      scrollspeed:60
    };
    
    if (myopt) {
      for(var a in opt) {
        if (myopt[a]!==undefined) opt[a] = myopt[a];
      }
    }
    
    this.zindex = opt.zindex;
    this.cursoropacitymin = opt.cursoropacitymin;
    
    this.doc = opt.doc;
    this.win = opt.win;
    this.docscroll = (self.doc[0].nodeName=='BODY'||self.doc[0].nodeName=='HTML')?$(window):this.doc;
    
    this.screen = false;
    this.page = false;
    
    this.scroll = {x:0,y:0};
    this.scrollratio = {x:0,y:0};
    this.cursorheight = 20;
    this.scrollvaluemax = 0;
    
    do {
      this.id = "ascrail"+Math.round(Math.random() * 99999);
    } while (document.getElementById(this.id));
    
    this.rail = false;
    this.cursor = false;
    this.cursorfreezed = false;
    
    this.isie = (document.all && !document.opera);
    
    this.scrollTop = function(val) {
      return (val === undefined) ? self.getScrollTop() : self.setScrollTop(val);
    };
    
    this.getScrollTop = function() {
      return self.docscroll.scrollTop();
    };
    this.setScrollTop = function(val) {
      return self.docscroll.scrollTop(val);
    };
    
    this.hasParent = function(e,id) {
      var el = e.target||e||false;
      while (el && el.id != id) {
        el = el.parentNode||false;
      }
      return (el!==false);
    };
    
    this.init = function() {
      self.doc.css({'overflow-y':'hidden'});
      var rail = $(document.createElement('div'));
      rail.attr('id',self.id);
      rail.css({position:"fixed",top:0,right:0,"padding-left":"4px",width:"12px",height:"100%",'z-index':self.zindex,opacity:self.cursoropacitymin});
      self.rail = rail;
      self.doc.append(rail);
      var cursor = $(document.createElement('div'));
      cursor.css({
        position:"relative",top:0,right:0,width:"8px",height:"0px",'background-color':"#424242",
        border:"1px solid #fff",
        '-webkit-border-radius':'4px',
        '-moz-border-radius':'4px',
        'border-radius':'4px'
      });
      self.cursor = cursor;
      self.rail.append(cursor);
      
      self.win.resize(function(){self.onResize()});    
      self.doc.resize(function(){self.onResize()});    
      self.onResize();

      $(self.rail).mousedown(function(e) {
        self.rail.drag = {x:e.screenX,y:e.screenY,sx:self.scroll.x,sy:self.scroll.y};
        e.preventDefault();
        return false;
      });
      $(self.rail).mouseup(function() {
        self.rail.drag = false;
        return false;
      });
      
      $(document).mouseup(function(e) {
        self.rail.drag = false;      
        self.hideCursor();
      });
      
      $(document).mousemove(function(e) {
        if (self.rail.drag) {
          self.scroll.y = self.rail.drag.sy + (e.screenY-self.rail.drag.y);
          if (self.scroll.y<0) self.scroll.y=0;
          var my = self.scrollvaluemax;
          if (self.scroll.y>my) self.scroll.y=my;
          self.showCursor();
          self.cursorfreezed = true;
          self.doScroll(Math.round(self.scroll.y*self.scrollratio.y));
          e.preventDefault();
          return false;
        }
      });
      
      $(self.rail).mouseenter(function() {
        $(self.rail).animate({opacity:1});
        self.rail.active = true;
      });
      $(self.rail).mouseleave(function() {
        self.rail.active = false;
        if (!self.rail.drag) self.hideCursor();
      });
      
      self.mousewheel(function(delta){
        self.scroll.y+=(-delta)*12;
        if (self.scroll.y<0) self.scroll.y=0;
        var my = self.scrollvaluemax;
        if (self.scroll.y>my) self.scroll.y=my;
        self.cursorfreezed = false;
        self.doScroll(Math.round(self.scroll.y*self.scrollratio.y));
      });
    
    };
    
    this.showCursor = function() {
      if (self.cursortimeout) {
        clearTimeout(self.cursortimeout);
        self.cursortimeout = 0;
      }
      self.rail.clearQueue().css({opacity:1});
      self.cursor.css({height:self.cursorheight,top:self.scroll.y});
    }
    
    this.hideCursor = function(tm) {
      if (self.cursortimeout) return;
      self.cursortimeout = setTimeout(function() {
         if (self.rail.active) return;
         $(self.rail).animate({opacity:self.cursoropacitymin});
         self.cursortimeout = 0;
      },tm||800);
    };
    
    this.getContentSize = function() {
      return (self.doc[0].nodeName=='BODY') ?
        {
          w:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth),
          h:Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)
        } : 
        {
          w:self.doc[0].scrollWidth,
          h:self.doc[0].scrollHeight
        };
    };
    
    this.onResize = function() {
      self.view = {
        w:self.win.width(),
        h:self.win.height()
      };
      self.page = self.getContentSize();
      
      self.cursorheight = Math.round(self.view.h * (self.view.h / self.page.h));
      
      self.scrollvaluemax = self.view.h-self.cursorheight-1;
      
      self.scrollratio = {
        x:0,
        y:((self.page.h - self.view.h)/self.scrollvaluemax)
      };
      
      self.scroll.y = Math.round(self.getScrollTop() * (1/self.scrollratio.y));
      
      self.showCursor();
      self.hideCursor();
    };
   
    this.bind = function(dom,name,fn,bubble) {  // fixing jquery bind
      var el = dom[0];
      if (el.addEventListener) {
        el.addEventListener(name,fn,bubble||false);
      } 
      else if (el.attachEvent) {
        el.attachEvent(name,fn);
      } 
      else {
        el["on"+name] = fn;
      }
    };
   
    this.mousewheel = function(fn) {
      function wheel(e){
        var delta = 0;
        e = e ? e : window.event;
        var delta = e.detail ? e.detail * -1 : e.wheelDelta / 40;
        if (fn&&delta) fn(delta);
        if (e.preventDefault) e.preventDefault();
        e.returnValue = false;
      }
      if (!self.isie) self.bind(self.docscroll,'DOMMouseScroll',wheel,false);
      self.bind(self.docscroll,'mousewheel',wheel,false);
    };
    
    this.doScroll = function(y) {
      self.newscrolly = y;
      if (self.timer) return;
      self.timer = setInterval(function() {
        var gp = self.newscrolly - self.getScrollTop();
        var df = (gp>0) ? Math.ceil(gp/4) : Math.floor(gp/4);
        var sc = self.getScrollTop()+df;
        self.setScrollTop(sc);
        if (sc == self.newscrolly) {
          clearInterval(self.timer);
          self.timer = 0;        
          self.cursorfreezed = false;
        }
      },opt.scrollspeed);
    }

    self.win.scroll(function(e) {
      var tm = (new Date()).getTime();
      if (!self.lastcontentcheck || self.lastcontentcheck<tm) {
        self.lastcontentcheck=tm+500;
        var pg = self.getContentSize();
        if (pg.h!=self.page.h) self.onResize();        
      }
    
      if (self.rail.drag) return;
      if (!self.cursorfreezed) self.scroll.y = Math.round(self.getScrollTop() * (1/self.scrollratio.y));
      self.showCursor();
      self.hideCursor();
    });
   
    this.init();

  }
  
  $.fn.niceScroll = function(opt) {
    var ret = [];
    if (!opt) opt = {};
    this.each(function() {
      opt.doc = (opt.doc===undefined) ? $(this) : opt.doc;
      ret.push(new AScrollClass(opt));
    });
    return (ret.length==1) ? ret[0] : ret;
  };
  
})( jQuery );
  