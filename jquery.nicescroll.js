/* jquery.nicescroll
-- version 2.9.6
-- copyright 2011-12 InuYaksa*2012
-- licensed under the MIT
--
-- http://areaaperta.com/nicescroll
-- https://github.com/inuyaksa/jquery.nicescroll
--
*/

(function(jQuery){

  // globals
  var domfocus = false;
  var mousefocus = false;
  var zoomactive = false;
  var tabindexcounter = 5000;
  var ascrailcounter = 2000;
  
  var $ = jQuery;  // sandbox
 
  // http://stackoverflow.com/questions/2161159/get-script-path
  function getScriptPath() {
    var scripts=document.getElementsByTagName('script');
    var path=scripts[scripts.length-1].src.split('?')[0];
    return (path.split('/').length>0) ? path.split('/').slice(0,-1).join('/')+'/' : '';
  }
  var scriptpath = getScriptPath();

  // derived by http://blog.joelambert.co.uk/2011/06/01/a-better-settimeoutsetinterval/
  var setAnimationFrame = (function(){
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            false;
  })();
  var clearAnimationFrame = (function(){
    return  window.cancelRequestAnimationFrame       || 
            window.webkitCancelRequestAnimationFrame || 
            window.mozCancelRequestAnimationFrame    || 
            window.oCancelRequestAnimationFrame      || 
            window.msCancelRequestAnimationFrame     || 
            false;
  })();  
  
  var NiceScrollClass = function(myopt,me) {

    var self = this;

    this.version = '2.9.6';
    this.name = 'nicescroll';
    
    this.me = me;
    
    this.opt = {
      doc:$("body"),
      win:false,
      zindex:9000,
      cursoropacitymin:0,
      cursoropacitymax:1,
      cursorcolor:"#424242",
      cursorwidth:"5px",
      cursorborder:"1px solid #fff",
      cursorborderradius:"5px",
      scrollspeed:60,
      mousescrollstep:8*5,
      touchbehavior:false,
      hwacceleration:true,
      usetransition:true,
      boxzoom:false,
      dblclickzoom:true,
      gesturezoom:true,
      grabcursorenabled:true,
      autohidemode:true,
      background:"",
      iframeautoresize:true,
      cursorminheight:20,
      preservenativescrolling:true,
      railoffset:false,
      bouncescroll:false,
      spacebarenabled:true,
      railpadding:{top:0,right:0,left:0,bottom:0},
      disableoutline:true
    };
    
    if (myopt||false) {
      for(var a in self.opt) {
        if (typeof myopt[a] != "undefined") self.opt[a] = myopt[a];
      }
    }
    
    this.doc = self.opt.doc;
    this.iddoc = (this.doc&&this.doc[0])?this.doc[0].id||'':'';    
    this.ispage = /BODY|HTML/.test((self.opt.win)?self.opt.win[0].nodeName:this.doc[0].nodeName);
    this.haswrapper = (self.opt.win!==false);
    this.win = self.opt.win||(this.ispage?$(window):this.doc);
    this.docscroll = (this.ispage&&!this.haswrapper)?$(window):this.win;
    this.body = $("body");
    
    this.iframe = false;
    this.isiframe = ((this.doc[0].nodeName == 'IFRAME') && (this.win[0].nodeName == 'IFRAME'));
    
    this.istextarea = (this.win[0].nodeName == 'TEXTAREA');

// Events jump table    
    this.onmousedown = false;
    this.onmouseup = false;
    this.onmousemove = false;
    this.onmousewheel = false;
    this.onkeypress = false;
    this.ongesturezoom = false;
    this.onclick = false;
    
    
// Let's start!  
    this.view = false;
    this.page = false;
    this.observer = false;
    
    this.scroll = {x:0,y:0};
    this.scrollratio = {x:0,y:0};    
    this.cursorheight = 20;
    this.scrollvaluemax = 0;
    
    this.scrollmom = false;
    
    do {
      this.id = "ascrail"+(ascrailcounter++);
    } while (document.getElementById(this.id));
    
    this.rail = false;
    this.cursor = false;
    this.cursorfreezed = false;  
    
    this.zoom = false;
    this.zoomactive = false;
    
    this.hasfocus = false;
    this.hasmousefocus = false;
    
    this.visibility = true;
    this.locked = false;
    this.hidden = false; // rails always hidden
    
    this.nativescrollingarea = false;
    
    this.events = [];  // event list for unbind
    
    this.saved = {};
    
    this.delaylist = {};
    this.synclist = {};
    
    this.lastdelta = 0;
    
    var domtest = document.createElement('DIV');
    
    this.isopera = ("opera" in window);
    
    this.isie = (("all" in document) && ("attachEvent" in domtest) && !this.isopera);
    this.isieold = (this.isie && !("msInterpolationMode" in domtest.style));  // IE6 and older
    this.isie7 = this.isie&&!this.isieold&&(!("documentMode" in document)||(document.documentMode==7));
    this.isie8 = this.isie&&("documentMode" in document)&&(document.documentMode==8);
    this.isie9 = this.isie&&("performance" in window)&&(document.documentMode>=9);
    
    this.isie9mobile = /iemobile.9/i.test(navigator.userAgent);  //wp 7.1 mango
    this.isie7mobile = (!this.isie9mobile&&this.isie7) && /iemobile/i.test(navigator.userAgent);  //wp 7.0
    
    this.ismozilla = ("MozAppearance" in domtest.style);
    this.ischrome = ("chrome" in window);
    
    this.cantouch = ("ontouchstart" in document.documentElement);
    this.hasmstouch = (window.navigator.msPointerEnabled||false);  // IE10+ pointer events - EXPERIMENTAL
    
/* alternative methods to detect touch support */
/* thanks modernizr.github.com/Modernizr/touch.html  */
//    if (!this.cantouch) this.cantouch = (typeof TouchEvent != "undefined");  // NOT READY -> testing session (false positive on chrome19)
/*  */    
    
    this.isios = (this.cantouch && /iphone|ipad|ipod/i.test(navigator.platform));
    this.isios4 = ((this.isios)&&!("seal" in Object));
    
    if (self.opt.hwacceleration) {  // if you dont need dont bother to look for
      this.trstyle = (window.opera) ? 'OTransform' : (document.all) ? 'msTransform' : (domtest.style.webkitTransform!==undefined) ? 'webkitTransform' : (domtest.style.MozTransform!==undefined) ? 'MozTransform' : false;
      if (this.trstyle && typeof domtest.style[this.trstyle] == "undefined") this.trstyle = false;
      this.hastransform = (this.trstyle != false);
      if (this.hastransform) {
        domtest.style[this.trstyle] = "translate3d(1px,2px,3px)";
        this.hastranslate3d = /translate3d/.test(domtest.style[this.trstyle]);
      }
      
      this.transitionstyle = false;
      this.prefixstyle = '';
      this.transitionend = false;
      var check = ['transition','webkitTransition','MozTransition','OTransition','msTransition','KhtmlTransition'];
      var prefix = ['','-webkit-','-moz-','-o-','-ms-','-khtml-'];
      var evs = ['transitionEnd','webkitTransitionEnd','transitionend','oTransitionEnd','msTransitionEnd','KhtmlTransitionEnd'];
      for(var a=0;a<check.length;a++) {
        if (check[a] in domtest.style) {
          this.transitionstyle = check[a];
          this.prefixstyle = prefix[a];
          this.transitionend = evs[a];
          break;
        }
      }
      this.hastransition = (this.transitionstyle);
      
    } else {
      this.trstyle = false;
      this.hastransform = false;
      this.hastranslate3d = false;
      this.transitionstyle = false;
      this.hastransition = false;
      this.transitionend = false;
    }
    
    this.cursorgrabvalue = '';
    
    if (self.opt.grabcursorenabled&&self.opt.touchbehavior) {  // check grab cursor support
      function detectCursorGrab() {
        // thank you google for custom cursor!
        var lst = ['-moz-grab','-webkit-grab','grab'];
        if (self.ischrome||self.isie) lst=[];  // force setting for IE returns false positive and chrome cursor bug
        for(var a=0;a<lst.length;a++) {
          var p = lst[a];
          domtest.style['cursor']=p;
          if (domtest.style['cursor']==p) return p;
        }
        return 'url(http://www.google.com/intl/en_ALL/mapfiles/openhand.cur),n-resize';
      }
      this.cursorgrabvalue = detectCursorGrab();
    }

    domtest = null;  //memory released
    
    this.ishwscroll = (self.hastransform)&&(self.opt.hwacceleration)&&(self.haswrapper);
    
    this.delayed = function(name,fn,tm) {
      var dd = self.delaylist[name];
      var nw = (new Date()).getTime();
      if (dd&&dd.tt) return false;
      if (dd&&dd.last+tm>nw&&!dd.tt) {      
        self.delaylist[name] = {
          last:nw+tm,
          tt:setTimeout(function(){self.delaylist[name].tt=0;fn.call();},tm)
        }
      }
      else if (!dd||!dd.tt) {
        self.delaylist[name] = {
          last:nw,
          tt:0
        }
        setTimeout(function(){fn.call();},0);
      }
    };
    
    this.requestSync = function() {
      if (self.onsync) return;
      setAnimationFrame(function(){
        self.onsync = false;
        for(name in self.synclist){
          var fn = self.synclist[name];
          if (fn) fn.call(self);
          self.synclist[name] = false;
        }
      });
      self.onsync = true;
    };
    
    this.synched = function(name,fn) {
      self.synclist[name] = fn;
      self.requestSync();
    };
    
    this.css = function(el,pars) {  // save & set
      for(var n in pars) {
        self.saved.css.push([el,n,el.css(n)]);
        el.css(n,pars[n]);
      }
    };
    
    this.scrollTop = function(val) {
      return (typeof val == "undefined") ? self.getScrollTop() : self.setScrollTop(val);
    };

// derived by by Dan Pupius www.pupius.net
    BezierClass = function(st,ed,spd,p1,p2,p3,p4) {
      this.st = st;
      this.ed = ed;
      this.spd = spd;

      this.p1 = p1||0;
      this.p2 = p2||1;
      this.p3 = p3||0;
      this.p4 = p4||1;
      
      this.ts = (new Date()).getTime();
      this.df = this.ed-this.st;
    };
    BezierClass.prototype = {
      B2:function(t){ return 3*t*t*(1-t) },
      B3:function(t){ return 3*t*(1-t)*(1-t) },
      B4:function(t){ return (1-t)*(1-t)*(1-t) },
      getNow:function(){
        var nw = (new Date()).getTime();
        var pc = 1-((nw-this.ts)/this.spd);
        var bz = this.B2(pc) + this.B3(pc) + this.B4(pc);
        return (pc<0) ? this.ed : this.st+Math.round(this.df*bz);
      },
      update:function(ed,spd){
        this.st = this.getNow();
        this.ed = ed;
        this.spd = spd;
        this.ts = (new Date()).getTime();
        this.df = this.ed-this.st;
        return this;
      }
    };
    
    if (this.ishwscroll) {  
    // hw accelerated scroll
      this.doc.translate = {x:0,y:0};
      
      if (this.hastranslate3d) this.doc.css(this.prefixstyle+"backface-visibility","hidden");  // prevent flickering http://stackoverflow.com/questions/3461441/      
      
      this.getScrollTop = function(last) {
        if (self.timerscroll&&!last) {
          return self.timerscroll.bz.getNow();
        } else {
          return self.doc.translate.y;
        }
      };
      
      if (document.createEvent) {
        this.notifyScrollEvent = function(el) {
          var e = document.createEvent("UIEvents");
          e.initUIEvent("scroll", false, true, window, 1);
          el.dispatchEvent(e);
        };
      }
      else if (document.fireEvent) {
        this.notifyScrollEvent = function(el) {
          var e = document.createEventObject();
          el.fireEvent("onscroll");
          e.cancelBubble = true; 
        };
      }
      else {
        this.notifyScrollEvent = function(el) {}; //NOPE
      }
      
      if (this.hastranslate3d) {
        this.setScrollTop = function(val,silent) {
          self.doc.css(self.trstyle,"translate3d(0px,"+(val*-1)+"px,0px)");
          self.doc.translate.y = val;
          if (!silent) self.notifyScrollEvent(self.win[0]);
        };
      } else {
        this.setScrollTop = function(val,silent) {
          self.doc.css(self.trstyle,"translate(0px,"+(val*-1)+"px)");
          self.doc.translate.y = val;
          if (!silent) self.notifyScrollEvent(self.win[0]);          
        };
      }
    } else {
    // native scroll
      this.getScrollTop = function() {
        return self.docscroll.scrollTop();
      };
      this.setScrollTop = function(val) {        
        return self.docscroll.scrollTop(val);
      };
    }
    
    this.getTarget = function(e) {
      if (!e) return false;
      if (e.target) return e.target;
      if (e.srcElement) return e.srcElement;
      return false;
    };
    
    this.hasParent = function(e,id) {
      if (!e) return false;
      var el = e.target||e.srcElement||e||false;
      while (el && el.id != id) {
        el = el.parentNode||false;
      }
      return (el!==false);
    };
    
//inspired by http://forum.jquery.com/topic/width-includes-border-width-when-set-to-thin-medium-thick-in-ie
    var _convertBorderWidth = {"thin":1,"medium":3,"thick":5};
    function getWidthToPixel(dom,prop,chkheight) {
      var wd = dom.css(prop);
      var px = parseFloat(wd);
      if (isNaN(px)) {
        px = _convertBorderWidth[wd]||0;
        var brd = (px==3) ? ((chkheight)?(self.win.outerHeight() - self.win.innerHeight()):(self.win.outerWidth() - self.win.innerWidth())) : 1; //DON'T TRUST CSS
        if (self.isie8&&px) px+=1;
        return (brd) ? px : 0;
/*        
        switch (wd) {
          case "thin":
            px = (self.isie8) ? 1 : 2;
            break;
          case "medium":
            var brd = (chkheight)?(self.win.outerHeight() - self.win.innerHeight()):(self.win.outerWidth() - self.win.innerWidth()); //DON'T TRUST CSS
            px = (brd) ? ((self.isie8) ? 3 : 4) : 0;
            break;
          case "thick":
            px = (self.isie8) ? 5 : 6;
            break;
        }        
*/        
      }
      return px;
    };
    
    this.updateScrollBar = function(len) {
      if (self.ishwscroll) {
        self.rail.css({height:self.win.innerHeight()});
      } else {
        var pos = self.win.offset();
        pos.top+= getWidthToPixel(self.win,'border-top-width',true);
        
//        var brd = (self.win.outerWidth() - self.win.innerWidth());
        pos.left+= self.win.outerWidth() - getWidthToPixel(self.win,'border-right-width',false) - self.rail.width;
        
        var off = self.opt.railoffset;
        if (off) {
          if (off.top) pos.top+=off.top;
          if (off.left) pos.left+=off.left;
        }
        
        self.rail.css({top:pos.top,left:pos.left,height:(len)?len.h:self.win.innerHeight()});
        if (self.zoom) self.zoom.css({top:pos.top+1,left:pos.left-20});
      }
    };
    
    self.hasanimationframe = (setAnimationFrame);
    self.hascancelanimationframe = (clearAnimationFrame);
    
    if (!self.hasanimationframe) {
      setAnimationFrame=function(fn){return setTimeout(fn,16)}; // 1000/60)};
      clearAnimationFrame=clearInterval;
    } 
    else if (!self.hascancelanimationframe) clearAnimationFrame=function(){self.cancelAnimationFrame=true};
    
    this.init = function() {

      self.saved.css = [];
      
      if (self.isie7mobile) return true; // SORRY, DO NOT WORK!
      
//      if (self.hasmstouch) $("html").css('-ms-content-zooming','none');
      if (self.hasmstouch) self.css((self.ispage)?$("html"):self.win,{'-ms-touch-action':'none'});
      
      if (!self.ispage || (!self.cantouch && !self.isieold && !self.isie9mobile)) {
      
        var cont = self.docscroll;
        if (self.ispage) cont = (self.haswrapper)?self.win:self.doc;
        
        if (!self.isie9mobile) self.css(cont,{'overflow-y':'hidden'});      
        
        if (self.ispage&&self.isie7&&self.win[0].nodeName=='BODY') self.css($("html"),{'overflow-y':'hidden'});  //IE7 double scrollbar issue
        
        var cursor = $(document.createElement('div'));
        cursor.css({
          position:"relative",top:0,"float":"right",width:self.opt.cursorwidth,height:"0px",
          'background-color':self.opt.cursorcolor,
          border:self.opt.cursorborder,
          'background-clip':'padding-box',
          '-webkit-border-radius':self.opt.cursorborderradius,
          '-moz-border-radius':self.opt.cursorborderradius,
          'border-radius':self.opt.cursorborderradius
        });   
        
        cursor.hborder = parseFloat(cursor.outerHeight() - cursor.innerHeight());        
        self.cursor = cursor;        
        
        var rail = $(document.createElement('div'));
        rail.attr('id',self.id);
        rail.width = Math.max(parseFloat(self.opt.cursorwidth),cursor.outerWidth());
        rail.css({width:rail.width+"px",'zIndex':(self.ispage)?self.opt.zindex:self.opt.zindex+2,"background":self.opt.background});
        
        var kp = ["top","bottom","left","right"];
        for(var a in kp) {
          var v = self.opt.railpadding[a];
          if (v) rail.css("padding-"+a,v+"px");
        }
        
        rail.append(cursor);
        
        self.rail = rail;
        
        self.rail.drag = false;
        
        var zoom = false;
        if (self.opt.boxzoom&&!self.ispage&&!self.isieold) {
          zoom = document.createElement('div');          
          self.bind(zoom,"click",self.doZoom);
          self.zoom = $(zoom);
          self.zoom.css({"cursor":"pointer",'z-index':self.opt.zindex,'backgroundImage':'url('+scriptpath+'zoomico.png)','height':18,'width':18,'backgroundPosition':'0px 0px'});
          if (self.opt.dblclickzoom) self.bind(self.win,"dblclick",self.doZoom);
          if (self.cantouch&&self.opt.gesturezoom) {
            self.ongesturezoom = function(e) {
              if (e.scale>1.5) self.doZoomIn(e);
              if (e.scale<0.8) self.doZoomOut(e);
              return self.cancelEvent(e);
            };
            self.bind(self.win,"gestureend",self.ongesturezoom);             
          }
        }
        
        if (self.ispage) {
          rail.css({position:"fixed",top:"0px",right:"0px",height:"100%"});
          self.body.append(rail);          
        } else {
          if (self.ishwscroll) {
            if (self.win.css('position')=='static') self.css(self.win,{'position':'relative'});
            var bd = (self.win[0].nodeName == 'HTML') ? self.body : self.win;
            if (self.zoom) {
              self.zoom.css({position:"absolute",top:1,right:0,"margin-right":rail.width+4});
              bd.append(self.zoom);
            }
            rail.css({position:"absolute",top:0,right:0});
            bd.append(rail);
          } else {
            rail.css({position:"absolute"});
            if (self.zoom) self.zoom.css({position:"absolute"});
            self.updateScrollBar();
            self.body.append(rail);           
            if (self.zoom) self.body.append(self.zoom);
          }
          
          if (self.isios) self.css(self.win,{'-webkit-tap-highlight-color':'rgba(0,0,0,0)','-webkit-touch-callout':'none'});  // prevent grey layer on click
          
        }
        
        if (self.opt.autohidemode===false) {
          self.autohidedom = false;
        }
        else if (self.opt.autohidemode===true) {
          self.autohidedom = self.rail;
        }
        else if (self.opt.autohidemode=="cursor") {
          self.autohidedom = self.cursor;
        }        
        
        if (self.isie9mobile) {

          self.scrollmom = {            
            y:new ScrollMomentumClass(self)
          };        

          self.onmangotouch = function(e) {
            var py = self.getScrollTop();
            if (py == self.scrollmom.y.lastscrolly) return true;
            var df = py-self.mangotouch.sy;
            if (df==0) return;
            var dr = (df<0)?-1:1;
            var tm = (new Date()).getTime();            
            if (self.mangotouch.lazy) clearTimeout(self.mangotouch.lazy);
            if (((tm-self.mangotouch.tm)>60)||(self.mangotouch.dry!=dr)) {
              self.scrollmom.y.stop();
              self.scrollmom.y.reset(py);
              self.mangotouch.sy = py;
              self.mangotouch.ly = py;
              self.mangotouch.dry = dr;
              self.mangotouch.tm = tm;
            } else {
              self.scrollmom.y.stop();
              self.scrollmom.y.update(self.mangotouch.sy-df);
              var gap = tm - self.mangotouch.tm;
              self.mangotouch.tm = tm;
              var px = Math.abs(self.mangotouch.ly-py);
              self.mangotouch.ly = py;
              if (px>2) {
                self.mangotouch.lazy = setTimeout(function(){
                  self.mangotouch.lazy = false;
                  self.mangotouch.dry = 0;
                  self.mangotouch.tm = 0;
                  self.scrollmom.y.doMomentum(gap);
                },80);
              }
            }
          }
          
          var top = self.getScrollTop()
          self.mangotouch = {sy:top,ly:top,dry:0,lazy:false,tm:0};
          
          self.bind(self.docscroll,"scroll",self.onmangotouch);
        
        } else {
        
          if (self.cantouch||self.opt.touchbehavior||self.hasmstouch) {
          
            self.scrollmom = {
              y:new ScrollMomentumClass(self)
            };        
          
            self.ontouchstart = function(e) {
              if (e.pointerType&&e.pointerType!=2) return false;
              
              if (!self.locked) {
              
                if (self.hasmstouch) {
                  var tg = (e.target) ? e.target : false;
                  while (tg) {
                    var nc = $(tg).getNiceScroll();
                    if ((nc.length>0)&&(nc[0].me == self.me)) break;
                    if (nc.length>0) return false;
                    if ((tg.nodeName=='DIV')&&(tg.id==self.id)) break;
                    tg = (tg.parentNode) ? tg.parentNode : false;
                  }
                }
              
                self.cancelScroll();
                self.rail.drag = {x:e.clientX,y:e.clientY,sx:self.scroll.x,sy:self.scroll.y,st:self.getScrollTop(),pt:2};
                
                self.hasmoving = false;
                self.lastmouseup = false;
                self.scrollmom.y.reset(e.clientY);
                if (!self.cantouch&&!self.hasmstouch) {
                  var tg = self.getTarget(e);                
                  var ip = (tg)?/INPUT|SELECT|TEXTAREA/i.test(tg.nodeName):false;
                  if (!ip) return self.cancelEvent(e);
                  if (/SUBMIT|CANCEL|BUTTON/i.test($(tg).attr('type'))) {
                    pc = {"tg":tg,"click":false};
                    self.preventclick = pc;
                  }
                }
              }
              
            };
            
            self.ontouchend = function(e) {
              if (e.pointerType&&e.pointerType!=2) return false;
              if (self.rail.drag&&(self.rail.drag.pt==2)) {            
                self.scrollmom.y.doMomentum();
                self.rail.drag = false;
                if (self.hasmoving) {
                  self.hasmoving = false;
                  self.lastmouseup = true;
                  self.hideCursor();
                  if (!self.cantouch) return self.cancelEvent(e);
                }                            
              }                        
              
            };
            
            self.ontouchmove = function(e) {            
              
              if (e.pointerType&&e.pointerType!=2) return false;
    
              if (self.rail.drag&&(self.rail.drag.pt==2)) {
                if (self.cantouch&&(typeof e.original == "undefined")) return true;  // prevent ios "ghost" events by clickable elements
              
                self.hasmoving = true;

                if (self.preventclick&&!self.preventclick.click) {
                  self.preventclick.click = self.preventclick.tg.onclick||false;                
                  self.preventclick.tg.onclick = self.onpreventclick;
                }

                var fy = e.clientY;
                var my = (fy-self.rail.drag.y);
                
                var ny = self.rail.drag.st-my;
                
                if (self.ishwscroll) {
                  if (ny<0) {
                    ny = Math.round(ny/2);
                    fy = 0;
                  }
                  else if (ny>self.page.maxh) {
                    ny = self.page.maxh+Math.round((ny-self.page.maxh)/2);
                    fy = 0;
                  }
                } else {
                  if (ny<0) ny=0;
                  if (ny>self.page.maxh) ny=self.page.maxh;
                }
                              
                self.synched("touchmove",function(){
                  if (self.rail.drag&&(self.rail.drag.pt==2)) {
                    if (self.prepareTransition) self.prepareTransition(0);
                    self.setScrollTop(ny);
                    self.showCursor(ny);
                    self.scrollmom.y.update(fy);
                  }
                });
                
                return self.cancelEvent(e);
              }
              
            };
          
          }
         
          if (self.cantouch||self.opt.touchbehavior) {
          
            self.onpreventclick = function(e) {
              if (self.preventclick) {
                self.preventclick.tg.onclick = self.preventclick.click;
                self.preventclick = false;            
                return self.cancelEvent(e);
              }
            }
          
            self.onmousedown = self.ontouchstart;
            
            self.onmouseup = self.ontouchend;

            self.onclick = (self.isios) ? false : function(e) { 
              if (self.lastmouseup) {
                self.lastmouseup = false;
                return self.cancelEvent(e);
              } else {
                return true;
              }
            }; 
            
            self.onmousemove = self.ontouchmove;
            
            if (self.cursorgrabvalue) {
              self.css((self.ispage)?self.doc:self.win,{'cursor':self.cursorgrabvalue});            
              self.css(self.rail,{'cursor':self.cursorgrabvalue});
            }
            
          } else {
          
            self.onmousedown = function(e) {            
              if (self.rail.drag&&self.rail.drag.pt!=1) return;
              if (self.locked) return self.cancelEvent(e);            
              self.cancelScroll();
              self.rail.drag = {x:e.clientX,y:e.clientY,sx:self.scroll.x,sy:self.scroll.y,pt:1};
              return self.cancelEvent(e);
            };
            self.onmouseup = function(e) {
              if (self.rail.drag) {
                if(self.rail.drag.pt!=1)return;
                self.rail.drag = false;
                return self.cancelEvent(e);
              }
            };        
            self.onmousemove = function(e) {

              if (self.rail.drag) {
                if(self.rail.drag.pt!=1)return;
                self.scroll.y = self.rail.drag.sy + (e.clientY-self.rail.drag.y);
                if (self.scroll.y<0) self.scroll.y=0;
                var my = self.scrollvaluemax;
                if (self.scroll.y>my) self.scroll.y=my;
                
                self.synched('mousemove',function(){
                  if (self.rail.drag&&(self.rail.drag.pt==1)) {
                    self.showCursor();
                    self.cursorfreezed = true;
                    self.doScroll(Math.round(self.scroll.y*self.scrollratio.y));          
                  }
                });
                
                return self.cancelEvent(e);
              } else {
                self.checkarea = true;
              }
            };
          }

          if (self.cantouch||self.opt.touchbehavior) {
            self.bind(self.win,"mousedown",self.onmousedown);
          }
          
          if (self.hasmstouch) {
            self.css(self.rail,{'-ms-touch-action':'none'});
            self.css(self.cursor,{'-ms-touch-action':'none'});
            
            self.bind(self.win,"MSPointerDown",self.ontouchstart);
            self.bind(document,"MSPointerUp",self.ontouchend);
            self.bind(document,"MSPointerMove",self.ontouchmove);
            self.bind(self.cursor,"MSGestureHold",function(e){e.preventDefault();});
            self.bind(self.cursor,"contextmenu",function(e){e.preventDefault();});
          }

          self.bind(self.cursor,"mousedown",self.onmousedown);
          self.bind(self.cursor,"mouseup",function(e) {
            if (self.rail.drag&&self.rail.drag.pt==2) return;
            self.rail.drag = false;
            self.hasmoving = false;
            self.hideCursor();
            return self.cancelEvent(e);
          });
          
          self.bind(document,"mouseup",self.onmouseup);
          self.bind(document,"mousemove",self.onmousemove);
          if (self.onclick) self.bind(document,"click",self.onclick);
    
          if (!self.cantouch) {
            self.rail.mouseenter(function() {
              self.showCursor();
              self.rail.active = true;
            });          
            self.rail.mouseleave(function() { 
              self.rail.active = false;
              if (!self.rail.drag) self.hideCursor();
            });
            if (!self.isiframe) self.bind((self.isie&&self.ispage) ? document : self.docscroll,"mousewheel",self.onmousewheel);
            self.bind(self.rail,"mousewheel",self.onmousewheel);
          }

          if (self.zoom) {
            self.zoom.mouseenter(function() {
              self.showCursor();
              self.rail.active = true;
            });          
            self.zoom.mouseleave(function() { 
              self.rail.active = false;
              if (!self.rail.drag) self.hideCursor();
            });
          }
          
          if (!self.ispage&&!self.cantouch&&!(/HTML|BODY/.test(self.win[0].nodeName))) {
            if (!self.win.attr("tabindex")) self.win.attr({"tabindex":tabindexcounter++});
            
            if (self.ischrome&&self.opt.disableoutline) self.win.css({"outline":"none"});
            
            self.win.focus(function(e) {
              domfocus = (self.getTarget(e)).id||true;
              self.hasfocus = true;
              self.noticeCursor();
            });
            self.win.blur(function(e) {
              domfocus = false;
              self.hasfocus = false;
            });
            self.win.mouseenter(function(e) {
              mousefocus = (self.getTarget(e)).id||true;
              self.hasmousefocus = true;
              self.noticeCursor();
            });
            self.win.mouseleave(function() {
              mousefocus = false;
              self.hasmousefocus = false;
            });
          };
          
        }  // !ie9mobile
        
        //Thanks to http://www.quirksmode.org !!
        self.onkeypress = function(e) {
          if (self.locked&&self.page.maxh==0) return true;
          e = (e) ? e : window.e;
          var tg = self.getTarget(e);
          if (tg&&/INPUT|TEXTAREA|SELECT|OPTION/.test(tg.nodeName)) {
            var tp = tg.getAttribute('type')||tg.type||false;            
            if ((!tp)||!(/submit|button|cancel/i.tp)) return true;
          }
          
          if (self.hasfocus||(self.hasmousefocus&&!domfocus)||(self.ispage&&!domfocus&&!mousefocus)) {
            var key = e.keyCode;
            
            if (self.locked&&key!=27) return self.cancelEvent(e);
            
            var ret = false;
            switch (key) {
              case 38:
              case 63233: //safari
                self.doScrollBy(24*3);
                ret = true;
                break;
              case 40:
              case 63235: //safari
                self.doScrollBy(-24*3);
                ret = true;
                break;
              case 33:
              case 63276: // safari
                self.doScrollBy(self.view.h);
                ret = true;
                break;
              case 34:
              case 63277: // safari
                self.doScrollBy(-self.view.h);
                ret = true;
                break;
              case 36:
              case 63273: // safari
                self.doScrollTo(0);
                ret = true;
                break;
              case 35:
              case 63275: // safari
                self.doScrollTo(self.page.maxh);
                ret = true;
                break;
              case 32:
                if (self.opt.spacebarenabled) {
                  self.doScrollBy(-self.view.h);
                  ret = true;
                }
                break;
              case 27: // ESC
                if (self.zoomactive) {
                  self.doZoom();
                  ret = true;
                }
                break;
            }
            if (ret) return self.cancelEvent(e);
          }
        };
        
        self.bind(document,(self.isopera)?"keypress":"keydown",self.onkeypress);
        
        
        self.bind(window,'resize',self.resize);
        self.bind(window,'orientationchange',self.resize);
        
        self.bind(window,"load",self.resize);

        
// Trying a cross-browser implementation - good luck!

        self.onAttributeChange = function(e) {
          self.lazyResize();
        }
        
        if (!self.ispage&&!self.haswrapper) {
          // thanks to Filip http://stackoverflow.com/questions/1882224/        
          if ("WebKitMutationObserver" in window) {
            self.observer = new WebKitMutationObserver(function(mutations) {
              mutations.forEach(self.onAttributeChange);
            });
            self.observer.observe(self.win[0],{attributes:true,subtree:false});
          } else {        
            self.bind(self.win,(self.isie&&!self.isie9)?"propertychange":"DOMAttrModified",self.onAttributeChange);
            if (self.isie9) self.win[0].attachEvent("onpropertychange",self.onAttributeChange); //IE9 DOMAttrModified bug
          }
        }
        
//

        if (!self.ispage&&self.opt.boxzoom) self.bind(window,"resize",self.resizeZoom);
        if (self.istextarea) self.bind(self.win,"mouseup",self.resize);
        
        self.resize();
        
      }
      
      if (this.doc[0].nodeName == 'IFRAME') {
        function oniframeload(e) {
          self.iframexd = false;
          try {
            var doc = 'contentDocument' in this ? this.contentDocument : this.contentWindow.document;
            var a = doc.domain;            
          } catch(e){self.iframexd = true;doc=false};
          
          if (self.iframexd) return true;  //cross-domain - I can't manage this        
          
          if (self.isiframe) {
            self.iframe = {
              html:self.doc.contents().find('html')[0],
              body:self.doc.contents().find('body')[0]
            };
            self.getContentSize = function(){
              return {
                w:Math.max(self.iframe.html.scrollWidth,self.iframe.body.scrollWidth),
                h:Math.max(self.iframe.html.scrollHeight,self.iframe.body.scrollHeight)
              }
            }            
            self.docscroll = $(this.contentWindow);
          }
          if (self.opt.iframeautoresize&&!self.isiframe) {
            self.win.scrollTop(0); // reset position
            self.doc.height("");  //reset height to fix browser bug
            var hh=Math.max(doc.getElementsByTagName('html')[0].scrollHeight,doc.body.scrollHeight);
            self.doc.height(hh);          
          }
          self.resize();
          
          if (self.isie7) self.css($(doc).find('html'),{'overflow-y':'hidden'});
          self.css($(doc.body),{'overflow-y':'hidden'});
          if ('contentWindow' in this) {
            self.bind(this.contentWindow,"scroll",self.onscroll);  //IE8 & minor
          } else {          
            self.bind(doc,"scroll",self.onscroll);
          }          
          self.bind(doc,"mouseup",self.onmouseup);
          self.bind(doc,"mousewheel",self.onmousewheel);
          self.bind(doc,(self.isopera)?"keypress":"keydown",self.onkeypress);          
          if (self.cantouch||self.opt.touchbehavior) {
            self.bind(doc,"mousedown",self.onmousedown);
            if (self.cursorgrabvalue) self.css($(doc.body),{'cursor':self.cursorgrabvalue});
          }
          
          self.bind(doc,"mousemove",self.onmousemove);
          
          if (self.zoom) {
            if (self.opt.dblclickzoom) self.bind(doc,'dblclick',self.doZoom);
            if (self.ongesturezoom) self.bind(doc,"gestureend",self.ongesturezoom);             
          }
        };
        
        if (this.doc[0].readyState&&this.doc[0].readyState=="complete"){
          setTimeout(function(){oniframeload.call(self.doc[0],false)},500);
        }
        self.bind(this.doc,"load",oniframeload);
        
      }
      
    };
    
    this.showCursor = function(py) {
      if (self.cursortimeout) {
        clearTimeout(self.cursortimeout);
        self.cursortimeout = 0;
      }
      if (!self.rail) return;
      if (self.autohidedom) self.autohidedom.stop().css({opacity:self.opt.cursoropacitymax});
      
      if (typeof py != "undefined") {
        self.scroll.y = Math.round(py * 1/self.scrollratio.y);
      }
      
      self.cursor.css({height:self.cursorheight,top:self.scroll.y});
      if (self.zoom) self.zoom.stop().css({opacity:self.opt.cursoropacitymax});
    };
    
    this.hideCursor = function(tm) {
      if (self.cursortimeout) return;
      if (!self.rail) return;
      if (!self.autohidedom) return;
      self.cursortimeout = setTimeout(function() {
         if (!self.rail.active) {
           self.autohidedom.stop().animate({opacity:self.opt.cursoropacitymin});
           if (self.zoom) self.zoom.stop().animate({opacity:self.opt.cursoropacitymin});
         }
         self.cursortimeout = 0;
      },tm||400);
    };
    
    this.noticeCursor = function(tm,py) {
      self.showCursor(py);
      self.hideCursor(tm);
    };
        
    this.getContentSize = 
      (self.ispage) ?
        function(){
          return {
            w:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth),
            h:Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)
          }
        }
      : (self.haswrapper) ?
        function(){
          return {
            w:self.doc.outerWidth()+parseInt(self.win.css('paddingLeft'))+parseInt(self.win.css('paddingRight')),
            h:self.doc.outerHeight()+parseInt(self.win.css('paddingTop'))+parseInt(self.win.css('paddingBottom'))
          }
        }
      : function() {        
        return {
          w:self.docscroll[0].scrollWidth,
          h:self.docscroll[0].scrollHeight
        }
      };

    this.onResize = function(e,page) {
      if (self.rail == false) {
        return false;
      }
      if (!self.haswrapper&&!self.ispage) {        
        if (self.win.css('display')=='none') {
          if (self.visibility) self.hideRail();
          return false;
        } else {
          if (!self.visibility&&(self.getScrollTop()==0)) self.doScrollTo(Math.floor(self.scroll.y*self.scrollratio.y));
          if (!self.hidden&&!self.visibility) self.showRail();
        }        
      }
    
      var premaxh = self.page.maxh;
      var premaxw = self.page.maxw;

      var preview = {h:self.view.h,w:self.view.w};
      
      self.view = {
        w:(self.ispage) ? self.win.width() : parseInt(self.win[0].clientWidth),
        h:(self.ispage) ? self.win.height() : parseInt(self.win[0].clientHeight)
      };
      
      self.page = (page) ? page : self.getContentSize();
      
      self.page.maxh = Math.max(0,self.page.h - self.view.h);
      self.page.maxw = Math.max(0,self.page.w - self.view.w);      
      
      if ((self.page.maxh==premaxh)&&(self.page.maxw==premaxw)&&(self.view.w==preview.w)) {
        // test position        
        if (!self.ispage) {
          var pos = self.win.offset();
          if (self.lastposition) {
            var lst = self.lastposition;
            if ((lst.top==pos.top)&&(lst.left==pos.left)) return self; //nothing to do            
          }
          self.lastposition = pos;
        } else {
          return self; //nothing to do
        }
      }
      
      if (self.page.maxh==0) {
        self.hideRail();        
        self.scrollvaluemax = 0;
        self.scroll.y = 0;
        self.scrollratio = {x:0,y:0};
        self.cursorheight = 0;
        self.locked = true;
        self.setScrollTop(0);
        return false;
      } 
      else if (!self.hidden&&!self.visibility) {
        self.showRail();     
        self.locked = false;
      }
      
      if (self.istextarea&&self.win.css('resize')&&self.win.css('resize')!='none') self.view.h-=20;      
      if (!self.ispage) self.updateScrollBar(self.view);

      self.cursorheight = Math.min(self.view.h,Math.round(self.view.h * (self.view.h / self.page.h)));
      self.cursorheight = Math.max(self.opt.cursorminheight,self.cursorheight);
      
      self.scrollvaluemax = self.view.h-self.cursorheight-self.cursor.hborder;
      
      self.scrollratio = {
        x:0,
        y:(self.page.maxh/self.scrollvaluemax)
      };
     
      var sy = self.getScrollTop();
      if (sy>self.page.maxh) {
        self.doScroll(self.page.maxh);
      } else {     
        self.scroll.y = Math.round(self.getScrollTop() * (1/self.scrollratio.y));
        self.noticeCursor();     
      }      
      
      return self;
    };
    
    this.resize = this.onResize;  // hide internal method -- in future name can change
    this.lazyResize = function() {
      self.delayed('resize',self.resize,250);
    }
   
    this._bind = function(el,name,fn,bubble) {  // primitive bind
      self.events.push({e:el,n:name,f:fn});
      if (el.addEventListener) {
        el.addEventListener(name,fn,bubble||false);
      }
      else if (el.attachEvent) {
        el.attachEvent("on"+name,fn);
      }
      else {
        el["on"+name] = fn;        
      }        
    };
   
    this.bind = function(dom,name,fn,bubble) {  // touch-oriented & fixing jquery bind
      var el = ("jquery" in dom) ? dom[0] : dom;
      if (el.addEventListener) {
        if (self.cantouch && /mouseup|mousedown|mousemove/.test(name)) {  // touch device support
          var tt=(name=='mousedown')?'touchstart':(name=='mouseup')?'touchend':'touchmove';
          self._bind(el,tt,function(e){
            if (e.touches) {
              if (e.touches.length<2) {var ev=(e.touches.length)?e.touches[0]:e;ev.original=e;fn.call(this,ev);}
            } 
            else if (e.changedTouches) {var ev=e.changedTouches[0];ev.original=e;fn.call(this,ev);}  //blackberry
          },bubble||false);
        }
        self._bind(el,name,fn,bubble||false);
        if (name=='mousewheel') self._bind(el,"DOMMouseScroll",fn,bubble||false);
        if (self.cantouch && name=="mouseup") self._bind(el,"touchcancel",fn,bubble||false);
      }
      else {
        self._bind(el,name,function(e) {
          e = e||window.event||false;
          if (e) {
            if (e.srcElement) e.target=e.srcElement;
          }
          return ((fn.call(el,e)===false)||bubble===false) ? self.cancelEvent(e) : true;
        });
      } 
    };
    
    this._unbind = function(el,name,fn) {  // primitive unbind
      if (el.removeEventListener) {
        el.removeEventListener(name,fn,false);
      }
      else if (el.detachEvent) {
        el.detachEvent('on'+name,fn);
      } else {
        el['on'+name] = false;
      }
    };
    
    this.unbindAll = function() {
      for(var a=0;a<self.events.length;a++) {
        var r = self.events[a];        
        self._unbind(r.e,r.n,r.f);
      }
    };
    
    // Thanks to http://www.switchonthecode.com !!
    this.cancelEvent = function(e) {
      var e = (e.original) ? e.original : (e) ? e : window.event||false;
      if (!e) return false;      
      if(e.preventDefault) e.preventDefault();
      if(e.stopPropagation) e.stopPropagation();
      if(e.preventManipulation) e.preventManipulation();  //IE10
      e.cancelBubble = true;
      e.cancel = true;
      e.returnValue = false;
      return false;
    };

    this.showRail = function() {
      if ((self.page.maxh!=0)&&(self.ispage||self.win.css('display')!='none')) {
        self.visibility = true;
        self.rail.css('display','block');
      }
      return self;
    };

    this.hideRail = function() {
      self.visibility = false;
      self.rail.css('display','none');
      return self;
    };
    
    this.show = function() {
      self.hidden = false;
      self.locked = false;
      return self.showRail();
    };

    this.hide = function() {
      self.hidden = true;
      self.locked = true;
      return self.hideRail();
    };
    
    this.remove = function() {
      self.doZoomOut();
      self.unbindAll();
      if (self.observer !== false) {
        self.observer.disconnect();
      }
      self.events = [];
      self.rail.remove();
      if (self.zoom) self.zoom.remove();
      self.cursor = false;
      self.rail = false;
      self.zoom = false;
      for(var a=0;a<self.saved.css.length;a++) {
        var d=self.saved.css[a];
        d[0].css(d[1],(typeof d[2]=="undefined") ? '' : d[2]);
      }
      self.saved = false;      
      self.me.data('__nicescroll',''); //erase all traces
      return self;
    };
    
    this.isScrollable = function(e) {      
      var dom = (e.target) ? e.target : e;
      while (dom&&dom.nodeName&&!(/BODY|HTML/.test(dom.nodeName))) {
        var dd = $(dom);
        var ov = dd.css('overflowY')||dd.css('overflow')||'';        
        if (/scroll|auto/.test(ov)) return (dom.clientHeight!=dom.scrollHeight);
        dom = (dom.parentNode) ? dom.parentNode : false;        
      }
      return false;
    };
    
    this.onmousewheel = function(e) {
      if (self.locked&&self.page.maxh==0) return true;
      if (self.opt.preservenativescrolling&&self.checkarea) {
        self.checkarea = false;
        self.nativescrollingarea = self.isScrollable(e); 
      }
      if (self.nativescrollingarea) return true; // this isn't my business
      if (self.locked) return self.cancelEvent(e);
      if (self.rail.drag) return self.cancelEvent(e);
      var delta = 0;      
      var delta = e.detail ? e.detail * -1 : e.wheelDelta / 40;
      if (delta) {        
        if (self.scrollmom) self.scrollmom.y.stop();
        self.lastdelta += (delta*self.opt.mousescrollstep);
        self.synched("mousewheel",function(){if(!self.rail.drag){var dt=self.lastdelta;self.lastdelta=0;self.doScrollBy(dt)}});
      }
      return self.cancelEvent(e);
    };
    
    this.stop = function() {
      self.cancelScroll();
      if (self.scrollmon) self.scrollmon.stop();
      self.cursorfreezed = false;
      self.scroll.y = Math.round(self.getScrollTop() * (1/self.scrollratio.y));      
      self.noticeCursor();
      return self;
    };
    
    if (self.ishwscroll&&self.hastransition&&self.opt.usetransition) {
      this.prepareTransition = function(dif,trend) {
        var sp = Math.round(self.opt.scrollspeed*10);
        var ex = Math.min(sp,Math.round((dif / 20) * self.opt.scrollspeed));
        var trans = (ex>20) ? self.prefixstyle+'transform '+ex+'ms ease-out 0s' : '';
        if (!self.lasttransitionstyle||self.lasttransitionstyle!=trans) {
          self.lasttransitionstyle = trans;
          self.doc.css(self.transitionstyle,trans);
        }
        return ex;
      };
      this.doScroll = function(y,spd) {  //trans
        var sy = self.getScrollTop();
        if (y<0&&sy<=0) return self.noticeCursor();
        else if (y>self.page.maxh&&sy>=self.page.maxh) {
          self.checkContentSize();
          return self.noticeCursor();
        }
        
        self.newscrolly = y;
        self.newscrollspeed = spd||false;
        
        if (self.timer) return false;
        
        if (!self.scrollendtrapped) {
          self.scrollendtrapped = true;
          self.bind(self.doc,self.transitionend,self.onScrollEnd,false); //I have got to do something usefull!!
        }
        
        self.timer = setTimeout(function(){
          var top = self.getScrollTop();
          var dif = (self.newscrollspeed)?self.newscrollspeed:Math.abs(top-self.newscrolly);
          var ms = self.prepareTransition(dif);
          self.timer = setTimeout(function(){
            if (self.newscrolly<0&&!self.opt.bouncescroll) self.newscrolly = 0
            else if (self.newscrolly>self.page.maxh&&!self.opt.bouncescroll) self.newscrolly = self.page.maxh;          
            if (self.newscrolly==self.getScrollTop()) {
              self.timer = 0;
              self.onScrollEnd();              
            } else {              
              var py = self.getScrollTop();        
              if (self.timerscroll&&self.timerscroll.tm) clearInterval(self.timerscroll.tm);              
              if (ms>0) {
                self.timerscroll = {
                  ts:(new Date()).getTime(),
                  s:self.getScrollTop(),
                  e:self.newscrolly,
                  sp:ms,
                  bz: new BezierClass(py,self.newscrolly,ms,0,1,0,1)                  
                };
                if (!self.cursorfreezed) self.timerscroll.tm=setInterval(function(){self.showCursor(self.getScrollTop())},60);
              }
              self.setScrollTop(self.newscrolly);
              self.timer = 0;
            }
//            self.noticeCursor();
          },15);          
        },self.opt.scrollspeed);        
      };
      this.cancelScroll = function() {        
        if (!self.scrollendtrapped) return true;
        var py = self.getScrollTop();
        self.scrollendtrapped = false;
        self._unbind(self.doc,self.transitionend,self.onScrollEnd);        
        self.prepareTransition(0);        
        self.setScrollTop(py); // fire event onscroll
        if (self.timerscroll&&self.timerscroll.tm) clearInterval(self.timerscroll.tm);
        self.timerscroll = false;
        self.cursorfreezed = false;
//        self.scrollstart = false;
        self.noticeCursor(false,py);
        return self;
      };
      this.onScrollEnd = function() {        
        self.scrollendtrapped = false;
        self._unbind(self.doc,self.transitionend,self.onScrollEnd);
        if (self.timerscroll&&self.timerscroll.tm) clearInterval(self.timerscroll.tm);
        self.timerscroll = false;
        self.cursorfreezed = false;
        var py = self.getScrollTop();
        self.setScrollTop(py);  // fire event onscroll
        self.noticeCursor(false,py);        
        if (py<0) self.doScroll(0,60)
        else if (py>self.page.maxh) self.doScroll(self.page.maxh,60);
//        else self.checkContentSize();
      };

    } else {
      this.doScroll = function(y) {  //no-trans
      
        if (self.newscrolly==y) return true;
      
        var py = self.getScrollTop();
        self.newscrolly = y;
        
        if (!self.bouncescroll) {
          if (self.newscrolly<0) {
            if (self.newspeedy) self.newspeedy.x = 0;
            self.newscrolly = 0;
          }
          else if (self.newscrolly>self.page.maxh) {
            if (self.newspeedy) self.newspeedy.x = self.page.maxh;
            self.newscrolly = self.page.maxh;
          }
        }

        var mg = Math.floor(Math.abs(y-py)/40);
        if (mg>0) {
          var ms = Math.min(10,mg)*100;
          self.bzscroll = (self.bzscroll) ? self.bzscroll.update(y,ms) : new BezierClass(py,y,ms,0,1,0,1);
        } else {
          self.bzscroll = false;
        }
        
        if (self.timer) return;
        
        if (py==self.page.maxh&&y>=self.page.maxh) self.checkContentSize();
        
        var sync = 1;
        
        function scrolling() {          
          if (self.cancelAnimationFrame) return true;
          
          sync = 1-sync;
          if (sync) return (self.timer = setAnimationFrame(scrolling)||1);

          var sy = self.getScrollTop();
          var sc = (self.bzscroll) ? self.bzscroll.getNow() : self.newscrolly;
          var dr=sc-sy;          
          if ((dr<0&&sc<self.newscrolly)||(dr>0&&sc>self.newscrolly)) sc = self.newscrolly;
          
          self.setScrollTop(sc);
          if (sc == self.newscrolly) {
//            clearAnimationFrame(self.timer);
            self.timer = 0;
            self.cursorfreezed = false;
            self.bzscroll = false;
            if (sc<0) self.doScroll(0);
            else if (sc>self.page.maxh) self.doScroll(self.page.maxh);
//            else self.checkContentSize();
          } else {
            self.timer = setAnimationFrame(scrolling)||1;
          }
        };
        self.cancelAnimationFrame=false;
        self.timer = 1;
        scrolling();
        
        if (py==self.page.maxh&&y>=py) self.checkContentSize();
        
        self.noticeCursor();
      };
      this.cancelScroll = function() {
        if (self.timer) clearAnimationFrame(self.timer);
        self.timer = 0;
        self.bzscroll = false;
        return self;
      };
    }
    
    this.doScrollBy = function(stp,relative) {
      var ny = 0;
      if (relative) {
        ny = Math.floor((self.scroll.y-stp)*self.scrollratio.y)
      } else {        
        var sy = (self.timer) ? self.newscrolly : self.getScrollTop(true);        
        ny = sy-stp;
      }
      if (self.bouncescroll) {
        var haf = Math.round(self.view.h/2);
        if (ny<-haf) ny=-haf
        else if (ny>(self.page.maxh+haf)) ny = (self.page.maxh+haf);
      }
      self.cursorfreezed = false;      
      self.doScroll(ny);      
    };
    
    this.doScrollTo = function(pos,relative) {
      var ny = (relative) ? Math.round(pos*self.scrollratio.y) : pos;
      if (ny<0) ny=0
      else if (ny>self.page.maxh) ny = self.page.maxh;
      self.cursorfreezed = false;
      self.doScroll(pos);
    };
    
    this.checkContentSize = function() {      
      var pg = self.getContentSize();
      if (pg.h!=self.page.h) self.resize(false,pg);
    };
    
    self.onscroll = function(e) {    
      if (self.rail.drag) return;
      if (!self.cursorfreezed) {
/*      
        self.delayed('onscroll',function(){
          self.scroll.y = Math.round(self.getScrollTop() * (1/self.scrollratio.y));
          self.noticeCursor();
        },30);
*/
        self.synched('scroll',function(){
          self.scroll.y = Math.round(self.getScrollTop() * (1/self.scrollratio.y));
          self.noticeCursor();
        });
        
      }
    };
    self.bind(self.docscroll,"scroll",self.onscroll);
    
    this.doZoomIn = function(e) {
      if (self.zoomactive) return;
      self.zoomactive = true;
      
      self.zoomrestore = {
        style:{}
      };
      var lst = ['position','top','left','zIndex','backgroundColor','marginTop','marginBottom','marginLeft','marginRight'];
      var win = self.win[0].style;
      for(var a in lst) {
        var pp = lst[a];
        self.zoomrestore.style[pp] = (typeof win[pp]!='undefined') ? win[pp] : '';
      }
      
      self.zoomrestore.style.width = self.win.css('width');
      self.zoomrestore.style.height = self.win.css('height');
      
      self.zoomrestore.padding = {
        w:self.win.outerWidth()-self.win.width(),
        h:self.win.outerHeight()-self.win.height()
      };
      
      if (self.isios4) {
        self.zoomrestore.scrollTop = $(window).scrollTop();
        $(window).scrollTop(0);
      }
      
      self.win.css({
        "position":(self.isios4)?"absolute":"fixed",
        "top":0,
        "left":0,
        "z-index":self.opt.zindex+100,
        "margin":"0px"
      });
      var bkg = self.win.css("backgroundColor");      
      if (bkg==""||/transparent|rgba\(0, 0, 0, 0\)|rgba\(0,0,0,0\)/.test(bkg)) self.win.css("backgroundColor","#fff");
      self.rail.css({"z-index":self.opt.zindex+110});
      self.zoom.css({"z-index":self.opt.zindex+112});      
      self.zoom.css('backgroundPosition','0px -18px');
      self.resizeZoom();                
      return self.cancelEvent(e);
    };

    this.doZoomOut = function(e) {
      if (!self.zoomactive) return;
      self.zoomactive = false;
      
      self.win.css("margin","");
      self.win.css(self.zoomrestore.style);
      
      if (self.isios4) {
        $(window).scrollTop(self.zoomrestore.scrollTop);
      }
      
      self.rail.css({"z-index":(self.ispage)?self.opt.zindex:self.opt.zindex+2});
      self.zoom.css({"z-index":self.opt.zindex});
      self.zoomrestore = false;
      self.zoom.css('backgroundPosition','0px 0px');
      self.onResize();
      return self.cancelEvent(e);
    };
    
    this.doZoom = function(e) {
      return (self.zoomactive) ? self.doZoomOut(e) : self.doZoomIn(e);
    };
    
    this.resizeZoom = function() {
      if (!self.zoomactive) return;

      var py = self.getScrollTop(); //preserve scrolling position
      self.win.css({
        width:$(window).width()-self.zoomrestore.padding.w+"px",
        height:$(window).height()-self.zoomrestore.padding.h+"px"
      });
      self.onResize();
      self.setScrollTop(Math.min(self.page.maxh,py));
    };
   
    this.init();
    
    $.nicescroll.push(this);

  };
  
// Inspired by the work of Kin Blas
// http://webpro.host.adobe.com/people/jblas/momentum/includes/jquery.momentum.0.7.js  
  
  var ScrollMomentumClass = function(nc) {
    var self = this;
    this.nc = nc;
    
    this.lasty = 0;
    this.speedy = 0;
    this.lasttime = 0;    
    this.snapy = false;
    this.demuly = 0;
    
    this.lastscrolly = -1;
    
    this.chky = 0;
    
    this.timer = 0;
    
    this.time = function() {
      return (new Date()).getTime();
    };
    
    this.reset = function(py) {
      self.stop();
      self.lasttime = self.time();
      self.speedy = 0;
      self.lasty = py;
      self.lastscrolly = -1;
    };
    
    this.update = function(py) {
      self.lasttime = self.time();
      var dy = py - self.lasty;
      var sy = nc.getScrollTop();
      var newy = sy + dy;
      self.snapy = (newy<0)||(newy>self.nc.page.maxh);
      self.speedy = dy;
      self.lasty = py;
    };
    
    this.stop = function() {
      if (self.timer) {
        clearTimeout(self.timer);
        self.timer = 0;
        self.lastscrolly = -1;
      }    
    };
    
    this.doSnapy = function(ny) {
      if (ny<0) {
        self.nc.doScroll(0,60);
      }
      else if (ny>self.nc.page.maxh) {
        self.nc.doScroll(self.nc.page.maxh,60);
      }
    };
    
    this.doMomentum = function(tm) {
      var t = self.time();
      var l = (tm) ? t+tm : self.lasttime;
      
      self.speedy = Math.min(60,self.speedy);
      
      var chk = l && (t - l) <= 50;
      var sy = (self.speedy && chk) ? self.speedy : false;
      
      if (sy) {
        var tm = t-l;
        var pageh = self.nc.page.maxh;
        self.demuly = 0;
        
        self.lastscrolly = self.nc.getScrollTop();
        self.chky = self.lastscrolly;
        
        var onscroll = function(){          
//          var ny = Math.floor(self.nc.getScrollTop() - (self.speedy*(1-self.demuly)));
          var ny = Math.floor(self.lastscrolly - (self.speedy*(1-self.demuly)));
          if ((ny<0)||(ny>pageh)) {
            self.demuly+=0.08;
          } else {
            self.demuly+=0.01;
          }
          self.lastscrolly = ny;
          
          self.nc.synched("domomentum",function(){
          
            var scy = self.nc.getScrollTop();          
            if (scy!=self.chky) self.stop();          
            self.chky=ny;
          
            self.nc.setScrollTop(ny);
            if(self.timer) {
              self.nc.showCursor(ny);              
            } else {
              self.nc.hideCursor();
              self.doSnapy(ny);
            }
          });
          
          if(self.demuly<1) {
            self.timer = setTimeout(onscroll,tm);
          } else {
            self.timer = 0;
//            self.nc.hideCursor();
//            self.doSnapy(ny);
          }
        };
        onscroll();
      } else {
        if (self.snapy) {
          self.doSnapy(self.nc.getScrollTop());
        }
      }      
      
    }
    
  };

// override jQuery scrollTop
 
  var _scrollTop = jQuery.fn.scrollTop; // preserve original function
   
  $.cssHooks.scrollTop = {
    get: function(elem,computed,extra) {
      var nice = $.data(elem,'__nicescroll')||false;
      return (nice&&nice.ishwscroll) ? nice.getScrollTop() : _scrollTop.call(elem);
    },
    set: function(elem,value) {
      var nice = $.data(elem,'__nicescroll')||false;    
      (nice&&nice.ishwscroll) ? nice.setScrollTop(parseInt(value)) : _scrollTop.call(elem,value);
      return this;
    }
  };
  
/*  ====================================> TO INSPECT  
  $.fx.step["scrollTop"] = function(fx){
    if (fx.start=='') fx.start=$.cssHooks.scrollTop.get(fx.elem);
    $.cssHooks.scrollTop.set(fx.elem,fx.now+fx.unit);
  };  
*/  
 
  jQuery.fn.scrollTop = function(value) {    
    if (typeof value == "undefined") {
      var nice = (this[0]) ? $.data(this[0],'__nicescroll')||false : false;
      return (nice&&nice.ishwscroll) ? nice.getScrollTop() : _scrollTop.call(this);
    } else {
      return this.each(function() {     
        var nice = $.data(this,'__nicescroll')||false;
        (nice&&nice.ishwscroll) ? nice.setScrollTop(parseInt(value)) : _scrollTop.call($(this),value);
      });
    }
  }

  var NiceScrollArray = function(doms) {
    var self = this;
    this.length = 0;
    this.name = "nicescrollarray";
  
    this.each = function(fn) {
      for(var a=0;a<self.length;a++) fn.call(self[a]);
      return self;
    };
    
    this.push = function(nice) {
      self[self.length]=nice;
      self.length++;
    };
    
    this.eq = function(idx) {
      return self[idx];
    };
    
    if (doms) {
      for(a=0;a<doms.length;a++) {
        var nice = $.data(doms[a],'__nicescroll')||false;
        if (nice) {
          this[this.length]=nice;
          this.length++;
        }
      };
    }
    
    return this;
  };
  
  function mplex(el,lst,fn) {
    for(var a=0;a<lst.length;a++) fn(el,lst[a]);
  };  
  mplex(
    NiceScrollArray.prototype,
    ['show','hide','onResize','resize','remove','stop'],
    function(e,n) {
      e[n] = function(){
        return this.each(function(){
          this[n].call();
        });
      };
    }
  );  
  
  jQuery.fn.getNiceScroll = function(index) {
    if (typeof index == "undefined") {
      return new NiceScrollArray(this);
    } else {
      var nice = $.data(this[index],'__nicescroll')||false;
      return nice;
    }
  };
  
  jQuery.extend(jQuery.expr[':'], {
    nicescroll: function(a) {
      return ($.data(a,'__nicescroll'))?true:false;
    }
  });  
  
  $.fn.niceScroll = function(wrapper,opt) {        
    if (typeof opt=="undefined") {
      if ((typeof wrapper=="object")&&!("jquery" in wrapper)) {
        opt = wrapper;
        wrapper = false;        
      }
    }
    var ret = new NiceScrollArray();
    if (typeof opt=="undefined") opt = {};
    
    if (wrapper||false) {      
      opt.doc = $(wrapper);
      opt.win = $(this);
    }    
    var docundef = !("doc" in opt);   
    if (!docundef&&!("win" in opt)) opt.win = $(this);    
    
    this.each(function() {
      var nice = $(this).data('__nicescroll')||false;
      if (!nice) {
        opt.doc = (docundef) ? $(this) : opt.doc;
        nice = new NiceScrollClass(opt,$(this));        
        $(this).data('__nicescroll',nice);
      }
      ret.push(nice);
    });
    return (ret.length==1) ? ret[0] : ret;
  };
  
  window.NiceScroll = {
    getjQuery:function(){return jQuery}
  };
  
  if (!$.nicescroll) {
   $.nicescroll = new NiceScrollArray();
  }
  
})( jQuery );
  