/* jquery.nicescroll
-- versione 1.5.0
-- copyright 2011 InuYaksa*2011
-- licensed under the MIT
--
-- https://github.com/inuyaksa/jquery.nicescroll
--
*/

(function($){

  var domfocus = false;
  var mousefocus = false;

  var NiceScrollClass = function(myopt) {

    var self = this;
    
    this.opt = {
      doc:$("body"),
      win:false,
      zindex:9999,
      cursoropacitymin:0,
      cursoropacitymax:1,
      cursorcolor:"#424242",
      scrollspeed:60,
      mousescrollstep:8*6
    };
    
    if (myopt||false) {
      for(var a in self.opt) {
        if (myopt[a]!==undefined) self.opt[a] = myopt[a];
      }
    }
    
    this.id = self.opt.doc[0].id||'';
    this.doc = self.opt.doc;
    this.ispage = (self.doc[0].nodeName=='BODY'||self.doc[0].nodeName=='HTML');    
    this.docscroll = self.ispage?$(window):this.doc;
    this.win = self.opt.win||this.docscroll;
    
    this.isiframe = (this.doc[0].nodeName == 'IFRAME');
    
    if (self.isiframe) {
      this.docscroll = (this.doc[0].document)?$(this.doc[0].document.body):this.doc;
      this.doc.load(function() {
        var doc = 'contentDocument' in this? this.contentDocument : this.contentWindow.document;
        self.docscroll = $(doc.body);
        self.onResize();
        $(doc.body).css({'overflow-y':'hidden'});
        $(doc).scroll(self.onscroll);
        self.bind(doc,"mousewheel",self.onmousewheel);
        $(doc).keydown(self.onkeypress);
      });
    }
    
    this.view = false;
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
    
    this.hasfocus = false;
    this.hasmousefocus = false;
    
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
    
    this.updateScrollBar = function() {
      var pos = self.win.offset();
      pos.top+=2;
      pos.left+=self.win.outerWidth()-16;
      self.rail.css({position:"absolute",top:pos.top,left:pos.left,height:self.win.outerHeight()});
    };
    
    this.init = function() {
      self.doc.css({'overflow-y':'hidden'});
      var rail = $(document.createElement('div'));
      rail.attr('id',self.id);
      rail.css({"padding-left":"4px",width:"12px",'z-index':self.opt.zindex,opacity:self.cursoropacitymin});
      self.rail = rail;
      
      if (self.ispage) {
        rail.css({position:"fixed",top:"0px",right:"0px",height:"100%"});
        self.doc.append(rail);
      } else {
        self.updateScrollBar();
        $("body").append(rail);
      }
      
      var cursor = $(document.createElement('div'));
      cursor.css({
        position:"relative",top:0,left:0,width:"8px",height:"0px",
        'background-color':self.opt.cursorcolor,
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

      self.rail.mousedown(function(e) {
        self.rail.drag = {x:e.screenX,y:e.screenY,sx:self.scroll.x,sy:self.scroll.y};
        return self.cancelEvent(e);
      });
      self.rail.mouseup(function() {
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
          return self.cancelEvent(e);
        }
      });
      
      self.rail.mouseenter(function() {
        $(self.rail).animate({opacity:self.opt.cursoropacitymax});
        self.rail.active = true;
      });
      self.rail.mouseleave(function() {
        self.rail.active = false;
        if (!self.rail.drag) self.hideCursor();
      });
      
      if (!self.isiframe) self.bind((self.isie&&self.ispage) ? document : self.docscroll,"mousewheel",self.onmousewheel);
      self.bind(self.rail,"mousewheel",self.onmousewheel);

      if (!self.ispage) {
        if (!self.win.attr("tabindex")) self.win.attr({"tabindex":(new Date()).getTime()});
        self.win.focus(function(e) {          
          domfocus = e.target.id||true;
          self.hasfocus = true;
          self.showCursor();
          self.hideCursor();
        });
        self.win.blur(function(e) {
          domfocus = false;
          self.hasfocus = false;
        });
        self.win.mouseenter(function(e) {
          mousefocus = e.target.id||true;
          self.hasmousefocus = true;
        });
        self.win.mouseleave(function() {
          mousefocus = false;
          self.hasmousefocus = false;
        });
      };
      
      //Thanks to http://www.quirksmode.org !!
      self.onkeypress = function(e) {
        e = (e) ? e : window.e;
        if (e.target&&/(INPUT|TEXTAREA|SELECT)/.test(e.target.nodeName)) return;
        if (self.hasfocus||(self.hasmousefocus&&!domfocus)||(self.ispage&&!domfocus&&!mousefocus)) {
          var key = e.keyCode;     
          var ret = true;
          switch (key) {
            case 38:
            case 63233: //safari
              self.doScrollBy(12);
              ret = false;
              break;
            case 40:
            case 63235: //safari
              self.doScrollBy(-12);
              ret = false;
              break;
            case 33:
            case 63276: // safari
              self.doScrollBy(self.view.h,true);
              ret = false;
              break;
            case 34:
            case 63277: // safari
              self.doScrollBy(-self.view.h,true);
              ret = false;
              break;
            case 36:
            case 63273: // safari
              self.doScrollTo(0,true);
              ret = false;
              break;
            case 35:
            case 63275: // safari
              self.doScrollTo(self.page.h,true);
              ret = false;
              break;
          }
          if (!ret) return self.cancelEvent(e);
        }
      };
      self.bind(document,"keydown",self.onkeypress);
      
    };
    
    this.showCursor = function() {
      if (self.cursortimeout) {
        clearTimeout(self.cursortimeout);
        self.cursortimeout = 0;
      }
      self.rail.clearQueue().css({opacity:self.opt.cursoropacitymax});
      self.cursor.css({height:self.cursorheight,top:self.scroll.y});
    };
    
    this.hideCursor = function(tm) {
      if (self.cursortimeout) return;
      self.cursortimeout = setTimeout(function() {
         if (self.rail.active) return;
         $(self.rail).animate({opacity:self.opt.cursoropacitymin});
         self.cursortimeout = 0;
      },tm||800);
    };
    
    this.getContentSize = function() {
      var pg = (self.ispage) ?
        {
          w:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth),
          h:Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)
        } : 
        {
          w:self.docscroll[0].scrollWidth,
          h:self.docscroll[0].scrollHeight
        };

      pg.w-=1;
      pg.h-=1;

      return pg;
    };
    
    this.onResize = function() {
      if (!self.ispage) self.updateScrollBar();
    
      self.view = {
        w:(self.ispage) ? self.win.width() : self.win.innerWidth(),
        h:(self.ispage) ? self.win.height() : self.win.innerHeight()
      };
      self.page = self.getContentSize();
      
      self.cursorheight = Math.min(self.view.h,Math.round(self.view.h * (self.view.h / self.page.h)));
      
      self.scrollvaluemax = self.view.h-self.cursorheight-2;
      
      self.scrollratio = {
        x:0,
        y:((self.page.h - self.view.h)/self.scrollvaluemax)
      };
      
      self.scroll.y = Math.round(self.getScrollTop() * (1/self.scrollratio.y));
      
      self.showCursor();
      self.hideCursor();
    };
   
    this.bind = function(dom,name,fn,bubble) {  // fixing jquery bind
      var el = (dom.length) ? dom[0] : dom;
      if (el.addEventListener) {
        el.addEventListener(name,fn,bubble||false);
        if (name=='mousewheel') el.addEventListener("DOMMouseScroll",fn,bubble||false);
      } 
      else if (el.attachEvent) {
        el.attachEvent("on"+name,fn);
      } 
      else {
        el["on"+name] = fn;
      }
    };
    
    // Thanks to http://www.switchonthecode.com !!
    this.cancelEvent = function(e) {
      e = e ? e : window.event;
      if(e.stopPropagation) e.stopPropagation();
      if(e.preventDefault) e.preventDefault();
      e.cancelBubble = true;
      e.cancel = true;
      e.returnValue = false;
      return false;
    };
   
    this.onmousewheel = function(e) {
      var delta = 0;
      e = e ? e : window.event;
      var delta = e.detail ? e.detail * -1 : e.wheelDelta / 40;
      if (delta) {
        self.doScrollBy(delta*self.opt.mousescrollstep,true);
      }
      return self.cancelEvent(e);
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
      },self.opt.scrollspeed);
      self.showCursor();
      self.hideCursor();
    };
    
    this.doScrollBy = function(stp,absolute) {
      if (absolute) stp = Math.round(stp * 1/self.scrollratio.y);
      var ny = self.scroll.y-stp;
      if (ny<0) ny=0;
      var my = self.scrollvaluemax;
      if (ny>my) ny=my;
      self.cursorfreezed = false;
      self.doScroll(Math.floor(ny*self.scrollratio.y));
    };

    this.doScrollTo = function(pos,absolute) {
      if (absolute) pos = Math.round(pos * 1/self.scrollratio.y);
      ny=pos;
      if (ny<0) ny=0;
      var my = self.scrollvaluemax;
      if (ny>my) ny=my;
      self.cursorfreezed = false;
      self.doScroll(Math.floor(ny*self.scrollratio.y));
    };
    
    self.onscroll = function(e) {    
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
    };
    self.docscroll.scroll(function(e) {
      self.onscroll(e);
    });
   
    this.init();

  };
  
  $.fn.niceScroll = function(opt) {
    var ret = [];
    if (typeof opt=="undefined") opt = {};
    var docundef = !("doc" in opt);
    this.each(function() {      
      opt.doc = (docundef) ? $(this) : opt.doc;
      ret.push(new NiceScrollClass(opt));
    });
    return (ret.length==1) ? ret[0] : ret;
  };
  
})( jQuery );
  