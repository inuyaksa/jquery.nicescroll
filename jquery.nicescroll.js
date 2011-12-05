/* jquery.nicescroll
-- version 2.5.0
-- copyright 2011 InuYaksa*2011
-- licensed under the MIT
--
-- http://areaaperta.com/nicescroll
-- https://github.com/inuyaksa/jquery.nicescroll
--
*/


function resetniceScroll(element) {
        $('.Scroller').remove();
        $(element).removeAttr('style');
        $(element).removeAttr('tabindex');
        $(element).data('__nicescroll', 0);
        $(element).niceScroll({});
    }

(function($){

  // globals
  var domfocus = false;
  var mousefocus = false;
  var zoomactive = false;
  var tabindexcounter = 5000;
  var ascrailcounter = 2000;
 
  // http://stackoverflow.com/questions/2161159/get-script-path
  function getScriptPath() {
    var scripts=document.getElementsByTagName('script');
    var path=scripts[scripts.length-1].src.split('?')[0];
    return (path.split('/').length>0) ? path.split('/').slice(0,-1).join('/')+'/' : '';
  }
  var scriptpath = getScriptPath();

  
  var NiceScrollClass = function(myopt,me) {

    var self = this;

    this.version = '2.5.0';
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
      mousescrollstep:8*6,
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
      cursorminheight:20
    };
    
    if (myopt||false) {
      for(var a in self.opt) {
        if (myopt[a]!==undefined) self.opt[a] = myopt[a];
      }
    }
    
    this.id = self.opt.doc[0].id||'';
    this.doc = self.opt.doc;
    this.ispage = (self.doc[0].nodeName=='BODY'||self.doc[0].nodeName=='HTML');  
    this.haswrapper = (self.opt.win!==false);
    this.win = self.opt.win||(this.ispage?$(window):this.doc);
    this.docscroll = this.ispage?$(window):this.win;

    this.iframe = false;
    this.isiframe = ((this.doc[0].nodeName == 'IFRAME') && (this.win[0].nodeName == 'IFRAME'));
    
    this.istextarea = (this.win[0].nodeName == 'TEXTAREA');

// Events jump table    
    this.onmousedown = false;
    this.onmouseup = false;
    this.onmousemove = false;
    this.onmousewheel = false;
    this.onkeypress = false;
    
    
// Let's start!  
    this.view = false;
    this.page = false;
    
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
    
    this.events = [];  // event list for unbind
    
    this.saved = {};
    
    var domtest = document.createElement('DIV');
    
    this.isopera = ("opera" in window);
    
    this.isie = (("all" in document) && ("attachEvent" in domtest) && !this.isopera);
    this.isieold = (this.isie && !("msInterpolationMode" in domtest.style));  // IE6 and older
    this.isie7 = this.isie&&!this.isieold&&(!("documentMode" in document)||(document.documentMode==7));
    this.isie8 = this.isie&&("documentMode" in document)&&(document.documentMode==8);
    this.isie9 = this.isie&&("performance" in window)&&(document.documentMode>=9);
    
    this.ismozilla = ("MozAppearance" in domtest.style);
    
    this.cantouch = ("ontouchstart" in document.documentElement);

    if (this.cantouch && /iphone|ipad|ipod/i.test(navigator.platform)) {
      this.isios = true;
      this.isios4 = !("seal" in Object);
    } else {
      this.isios = false;
      this.isios4 = false;
    }
    
    if (self.opt.hwacceleration) {  // if you dont need dont bother to look for
      this.trstyle = (window.opera) ? 'OTransform' : (document.all) ? 'msTransform' : (domtest.style.webkitTransform!==undefined) ? 'webkitTransform' : (domtest.style.MozTransform!==undefined) ? 'MozTransform' : false;
      if (this.trstyle && domtest.style[this.trstyle] === undefined) this.trstyle = false;
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
        if (!self.isie||self.isie9) {  // some old IE return false positive
          var lst = ['grab','-moz-grab','-webkit-grab'];
          for(var a=0;a<lst.length;a++) {
            var p = lst[a];
            domtest.style['cursor']=p;
            if (domtest.style['cursor']==p) return p;
          }
        }
        return 'url(http://www.google.com/intl/en_ALL/mapfiles/openhand.cur),n-resize';
      }
      this.cursorgrabvalue = detectCursorGrab();
    }

    domtest = null;
    
    this.ishwscroll = (self.hastransform)&&(self.opt.hwacceleration)&&(self.haswrapper);
    
    this.scrollTop = function(val) {
      return (val === undefined) ? self.getScrollTop() : self.setScrollTop(val);
    };
    
    if (this.ishwscroll) {
      // hw accelerated scroll
      self.doc.translate = {x:0,y:0};
      this.getScrollTop = function() {
        return self.doc.translate.y;
      };
      if (this.hastranslate3d) {
        this.setScrollTop = function(val,silent) {
          self.doc.css(self.trstyle,"translate3d(0px,"+(val*-1)+"px,0px)");
          self.doc.translate.y = val;
          if (!silent) {
            if (document.createEvent) {
              var e = document.createEvent("UIEvents");
              e.initUIEvent("scroll", false, true, window, 1);
              self.docscroll[0].dispatchEvent(e);
            } else {
              var e = document.createEventObject();
              self.docscroll[0].fireEvent("onscroll");
              e.cancelBubble = true; 
            }
          }
        };
      } else {
        this.setScrollTop = function(val,silent) {
          self.doc.css(self.trstyle,"translate(0px,"+(val*-1)+"px)");
          self.doc.translate.y = val;
          if (!silent) {
            if (document.createEvent) {
              var e = document.createEvent("UIEvents");
              e.initUIEvent("scroll", false, true, window, 1);
              self.docscroll[0].dispatchEvent(e);
            } else {
              var e = document.createEventObject();
              self.docscroll[0].fireEvent("onscroll");
              e.cancelBubble = true; 
            }
          }
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
    
    this.updateScrollBar = function(len) {
      if (self.ishwscroll) {
        self.rail.css({height:self.win.innerHeight()});
      } else {
        var pos = self.win.offset();
        pos.top+=2;
        var brd = (self.win.outerWidth() - self.win.innerWidth())/2;
        pos.left+= self.win.innerWidth() + brd - self.rail.width - 1;
        self.rail.css({position:"absolute",top:pos.top,left:pos.left,height:(len)?len.h:self.win.innerHeight()});
        if (self.zoom) self.zoom.css({position:"absolute",top:pos.top+1,left:pos.left-20});
      }
    };
    
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
    
    self.hasanimationframe = (setAnimationFrame);
    self.hascancelanimationframe = (clearAnimationFrame);
    
    if (!self.hasanimationframe) {
      setAnimationFrame=function(fn){return setTimeout(fn,1000/60)};
      clearAnimationFrame=clearInterval;
    } 
    else if (!self.hascancelanimationframe) clearAnimationFrame=function(){self.cancelAnimationFrame=true};
    
    this.init = function() {

      self.saved.css = [];
      if (self.ispage) self.saved.css.push([self.doc,'overflow-y',self.doc.css('overflow-y')]);
      if (!self.ispage) self.saved.css.push([self.docscroll,'overflow-y',self.docscroll.css('overflow-y')]);
      if (self.ispage&&self.isie7) self.saved.css.push([$("html"),'overflow-y',$("html").css('overflow-y')]);
      
      if (!self.ispage || (!self.cantouch && !self.isieold)) {

        (self.ispage)?self.doc.css({'overflow-y':'hidden'}):self.docscroll.css({'overflow-y':'hidden'});
      
        if (self.ispage&&self.isie7) $("html").css({'overflow-y':'hidden'});  //IE7 double scrollbar issue
        
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
        rail.attr('class','Scroller');
        rail.width = 3+Math.max(parseFloat(self.opt.cursorwidth),cursor.outerWidth());
        rail.css({"padding-left":"0px","padding-right":"1px",width:rail.width+"px",'zIndex':(self.ispage)?self.opt.zindex:self.opt.zindex+2,"background":self.opt.background});
        
        rail.append(cursor);
        
        self.rail = rail;
        
        var zoom = false;
        if (self.opt.boxzoom&&!self.ispage&&!self.isieold) {
          zoom = document.createElement('div');          
          self.bind(zoom,"click",self.doZoom);
          self.zoom = $(zoom);
          self.zoom.css({"cursor":"pointer",'z-index':self.opt.zindex,'backgroundImage':'url('+scriptpath+'zoomico.png)','height':18,'width':18,'backgroundPosition':'0px 0px'});
          if (self.opt.dblclickzoom) self.bind(self.win,"dblclick",self.doZoom);
          if (self.cantouch&&self.opt.gesturezoom) {
            self.bind(self.win,"gestureend",function(e) {
              if (e.scale>1.5) self.doZoomIn(e);
              if (e.scale<0.8) self.doZoomOut(e);
              return self.cancelEvent(e);
            });             
          }
        }
        
        if (self.ispage) {
          rail.css({position:"fixed",top:"0px",right:"0px",height:"100%"});
          self.doc.append(rail);          
        } else {
          if (self.ishwscroll) {
            if (self.win.css('position')=='static') self.win.css('position','relative');
            if (self.zoom) {
              self.zoom.css({position:"absolute",top:1,right:0,"margin-right":rail.width+4});
              self.win.append(self.zoom);
            }
            rail.css({position:"absolute",top:0,right:0});
            self.win.append(rail);
          } else {
            self.updateScrollBar();
            $("body").append(rail);           
            if (self.zoom) $("body").append(self.zoom);
          }
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
        
        self.bind(window,'resize',self.onResize);
        self.bind(window,'orientationchange',self.onResize);
        
        if (!self.ispage&&!self.haswrapper) {
          self.bind(self.win,(self.isie&&!self.isie9)?"propertychange":"DOMAttrModified",self.onAttributeChange);
        }

        if (!self.ispage&&self.opt.boxzoom) $(window).resize(self.resizeZoom);
        if (self.istextarea) self.win.mouseup(self.onResize);
        self.onResize();
        
        if (self.cantouch||self.opt.touchbehavior) {
          self.scrollmom = {
            y:new ScrollMomentumClass(self)
          };
        
          self.onmousedown = function(e) {
            if (!self.locked) {
              self.cancelScroll();
              self.rail.drag = {x:e.pageX,y:e.pageY,sx:self.scroll.x,sy:self.scroll.y,st:self.getScrollTop()};//,st:self.getScrollTop(),lx:e.pageX,ly:e.pageY,nx:e.pageX,ny:e.pageY,tt:(new Date()).getTime(),lt:(new Date()).getTime()};
              self.hasmoving = false;
              self.scrollmom.y.reset(e.pageY);
              if (!self.cantouch) return self.cancelEvent(e);
            }
          };
          self.onmouseup = function(e) {
            if (self.rail.drag) {            
//              self.doScrollMomentum(self.rail.drag);
              self.scrollmom.y.doMomentum();
              self.rail.drag = false;
              if (self.hasmoving) {
                self.hasmoving = false;
                return self.cancelEvent(e);
              }
            }
          };
          self.onmousemove = function(e) {
            if (self.rail.drag) {
              self.hasmoving = true;            
              var my = (e.pageY-self.rail.drag.y);
/*              
              self.rail.drag.ly = self.rail.drag.ny;
              self.rail.drag.ny = e.pageY;
              self.rail.drag.lt = (new Date()).getTime();
*/              
              
              self.scrollmom.y.update(e.pageY);
              
/*              
              self.scroll.y = Math.round((self.rail.drag.st-my) * (1/self.scrollratio.y));
              if (self.scroll.y<0) self.scroll.y=0;
              if (self.scroll.y>self.scrollvaluemax) self.scroll.y=self.scrollvaluemax;
*/
              
              self.showCursor(self.rail.drag.st-my);
              
              if (self.prepareTransition) self.prepareTransition(0);
              self.setScrollTop(self.rail.drag.st-my);
              
              return self.cancelEvent(e);
            }
          };
          
          if (self.cursorgrabvalue) {
            self.saved.css.push([self.win,'cursor',self.win.css('cursor')]);
            self.win.css({'cursor':self.cursorgrabvalue});
          }
        } else {
          self.onmousedown = function(e) {
            if (self.locked) return self.cancelEvent(e);
            self.cancelScroll();
            self.rail.drag = {x:e.screenX,y:e.screenY,sx:self.scroll.x,sy:self.scroll.y};
            return self.cancelEvent(e);
          };
          self.onmouseup = function(e) {
            if (self.rail.drag) {
              self.rail.drag = false;
              return self.cancelEvent(e);
            }
          };        
          self.onmousemove = function(e) {
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
          };
        }

        if (self.cantouch||self.opt.touchbehavior) self.bind(self.win,"mousedown",self.onmousedown);
        self.bind(self.win,"mouseup",self.onmouseup);
        
        self.bind(self.rail,"mousedown",self.onmousedown);          
        self.bind(self.rail,"mouseup",function(e) {
          self.rail.drag = false;
          self.hasmoving = false;
          self.hideCursor();
          return self.cancelEvent(e);
        });
        
        self.bind(document,"mouseup",self.onmouseup);
        self.bind(document,"mousemove",self.onmousemove);
        
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

        if (!self.ispage&&!self.cantouch) {
          if (!self.win.attr("tabindex")) self.win.attr({"tabindex":tabindexcounter++});
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
        
        //Thanks to http://www.quirksmode.org !!
        self.onkeypress = function(e) {
          e = (e) ? e : window.e;
          var tg = self.getTarget(e);          
          if (tg&&/INPUT|TEXTAREA|SELECT/.test(tg.nodeName)) {
            var tp = tg.getAttribute('type')||tg.type||false;            
            if ((!tp)||!(/submit|button|cancel/i.tp)) return true;
          }
          
          if (self.hasfocus||(self.hasmousefocus&&!domfocus)||(self.ispage&&!domfocus&&!mousefocus)) {
            var key = e.keyCode;
            
            if (self.locked&&key!=27) return self.cancelEvent(e);
            
            var ret = true;
            switch (key) {
              case 38:
              case 63233: //safari
                self.doScrollBy(24*3,true);
                ret = false;
                break;
              case 40:
              case 63235: //safari
                self.doScrollBy(-24*3,true);
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
                self.doScrollTo(self.page.maxh,true);
                ret = false;
                break;
              case 27: // ESC
                if (self.zoomactive) {
                  self.doZoom();
                  ret = false;
                }
                break;
            }
            if (!ret) return self.cancelEvent(e);
          }
        };
        
        self.bind(document,(self.isopera)?"keypress":"keydown",self.onkeypress);
        
      }
      
      if (this.doc[0].nodeName == 'IFRAME') {
        function oniframeload(e) {
          var doc = 'contentDocument' in this ? this.contentDocument : this.contentWindow.document;
          if (self.isiframe) {
            self.docscroll = $(doc);        
            self.iframe = {
              html:self.doc.contents().find('html')[0],
              body:self.doc.contents().find('body')[0]
            };
          }
          if (self.opt.iframeautoresize&&!self.isiframe) {
            self.win.scrollTop(0); // reset position
            self.doc.height("");  //reset height to fix browser bug
            var cc=self.doc.contents();
            var hh=Math.max(cc.find('html').attr('scrollHeight'),cc.find('body').attr('scrollHeight'));
            self.doc.height(hh);          
          }
          self.onResize();
          
          if (self.isie7) self.saved.css.push([$(doc).find('html'),'overflow-y',$(doc).find('html').css('overflow-y')]);
          self.saved.css.push([$(doc.body),'overflow-y',$(doc.body).css('overflow-y')]);
          
          if (self.isie7) $(doc).find('html').css({'overflow-y':'hidden'});
          $(doc.body).css({'overflow-y':'hidden'});
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
            if (self.cursorgrabvalue) {
              self.saved.css.push([$(doc),'cursor',$(doc).css('cursor')]);
              $(doc).css({'cursor':self.cursorgrabvalue});
            }
          }
          
          self.bind(doc,"mousemove",self.onmousemove);
          
          if (self.zoom) {
            if (self.opt.dblclickzoom) self.bind(doc,'dblclick',self.doZoom);
            if (self.cantouch&&self.opt.gesturezoom) {
              self.bind(doc,"gesturechange",function(e) {
                if (e.scale>1.5) self.doZoomIn(e);
                if (e.scale<0.8) self.doZoomOut(e);
                return self.cancelEvent(e);
              });             
            }          
          }
        };
        
        if (this.doc[0].readyState&&this.doc[0].readyState=="complete"){
          setTimeout(function(){oniframeload.call(self.doc[0],false)},500);
        }
        this.doc.load(oniframeload);
        
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
      },tm||800);
    };
    
    this.noticeCursor = function(tm) {
      self.showCursor();
      self.hideCursor(tm);
    };
    
    this.getContentSize = function() {
      var pg = 
        (self.ispage) ?
        {
          w:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth),
          h:Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)
        } 
        : (self.haswrapper) ?
        {
          w:self.doc.outerWidth()+parseInt(self.win.css('paddingLeft'))+parseInt(self.win.css('paddingRight')),
          h:self.doc.outerHeight()+parseInt(self.win.css('paddingTop'))+parseInt(self.win.css('paddingBottom'))
        } 
        : (self.iframe) ?
        {
          w:Math.max(self.iframe.html.scrollWidth,self.iframe.body.scrollWidth),
          h:Math.max(self.iframe.html.scrollHeight,self.iframe.body.scrollHeight)
        }        
        :
        {
          w:self.docscroll[0].scrollWidth,
          h:self.docscroll[0].scrollHeight
        };
        
      pg.w-=1;
      pg.h-=1;

      return pg;
    };
    
    this.onAttributeChange = function(e) {      
      if (e&&e.target) {
        if ((e.target !== self.win[0])&&(e.target!==self.doc[0])) return true;
        var attr = ("attrChange" in e)?e.attrName:("propertyName" in e)?e.propertyName:false;
        if (attr&&/width|height|style|block/i.test(attr)) {
          if (self.lastattributechange) self.lastattributechange=clearTimeout(self.lastattributechange);
          self.lastattributechange = setTimeout(function(){
            self.lastattributechange = 0;
            self.onResize();            
          },60);
        }
      }
    };
    
    this.onResize = function() {
      if (!self.haswrapper&&!self.ispage) {        
        var vis = (self.win.css('display')!='none');      
        if (vis&&!self.visibility) self.show();
        if (!vis&&self.visibility) self.hide();      
        if (!self.visibility) return false;
      }
    
      self.view = {
        w:(self.ispage) ? self.win.width() : self.win.innerWidth(),
        h:(self.ispage) ? self.win.height() : self.win.innerHeight()
      };
      
      self.page = self.getContentSize();
      
      self.page.maxh = self.page.h - self.view.h;
      
      if (self.view.h>=self.page.h) {
        self.hide();        
        self.scrollvaluemax = 0;
        self.scroll.y = 0;
        self.scrollratio = {x:0,y:0};
        self.cursorheight = 0;
        self.locked = true;
        self.setScrollTop(0);
        return false;
      } 
      else if (!self.visibility) self.show();     
      
      self.locked = false;
      
      if (self.istextarea&&self.win.css('resize')&&self.win.css('resize')!='none') self.view.h-=20;      
      if (!self.ispage) self.updateScrollBar(self.view);

      self.cursorheight = Math.min(self.view.h,Math.round(self.view.h * (self.view.h / self.page.h)));
      self.cursorheight = Math.max(self.opt.cursorminheight,self.cursorheight);
      
      self.scrollvaluemax = self.view.h-self.cursorheight-self.cursor.hborder-2;
      
      self.scrollratio = {
        x:0,
        y:((self.page.h - self.view.h)/self.scrollvaluemax)
      };
     
      self.scroll.y = Math.round(self.getScrollTop() * (1/self.scrollratio.y));
      
      self.noticeCursor();
      
      return self;
    };
    
    this.resize = this.onResize;  // mask internal method -- in future name can change
   
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
      var el = (dom.length) ? dom[0] : dom;
      if (el.addEventListener) {
        if (self.cantouch && /mouseup|mousedown|mousemove/.test(name)) {  // touch device support
          var tt = (name=='mousedown')?'touchstart':(name=='mouseup')?'touchend':'touchmove';
          self._bind(el,tt,function(e){
            if(e.touches.length<2){var ev=(e.touches.length>0)?e.touches[0]:e;ev.original=e;fn.call(this,ev);}
          },bubble||false);
        }
        self._bind(el,name,fn,bubble||false);
        if (name=='mousewheel') self._bind(el,"DOMMouseScroll",fn,bubble||false);
        if (self.cantouch && name=="mouseup") self._bind(el,"touchcancel",fn,bubble||false);
      }
      else {
        self._bind(el,name,function(e) {
          if (e&&!("pageY" in e)&&("screenY" in e)) {
            e.pageX = e.screenX;
            e.pageY = e.screenY;
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
      if (self.cantouch) {
        e = e.original ? e.original : e||false;
      } else {
        e = e ? e : window.event||false;
      }
      if (!e) return false;      
      if(e.stopPropagation) e.stopPropagation();
      if(e.preventDefault) e.preventDefault();
      e.cancelBubble = true;
      e.cancel = true;
      e.returnValue = false;
      return false;
    };

    this.show = function() {
      self.visibility = true;
      self.rail.css('display','block');
      return self;
    };

    this.hide = function() {
      self.visibility = false;
      self.rail.css('display','none');
      return self;
    };
    
    this.remove = function() {
      self.doZoomOut();
      self.unbindAll();
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
    
    this.onmousewheel = function(e) {
      if (self.locked) return self.cancelEvent(e);
      e = e ? e : window.event;
      if (self.rail.drag) return self.cancelEvent(e);
      var delta = 0;      
      var delta = e.detail ? e.detail * -1 : e.wheelDelta / 40;
      if (delta) {
        if (self.scrollmom) self.scrollmom.y.stop();
        self.doScrollBy(delta*self.opt.mousescrollstep,true);
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
      };
      this.doScroll = function(y) {
        self.newscrolly = y;
        if (self.timer) return false;
        
        self.timer = setTimeout(function(){        
          var top = self.getScrollTop();
          var dif = Math.abs(top-self.newscrolly);
          self.prepareTransition(dif)
          self.timer = setTimeout(function(){
            self.setScrollTop(self.newscrolly);
            self.timer = 0;
          },15);
        },self.opt.scrollspeed);
        self.noticeCursor();
      };
      this.cancelScroll = function() {
        var py = self.getScrollTop();
        self.prepareTransition(0);
        self.setScrollTop(py);
        self.noticeCursor();
        return self;
      };
      
//      self.bind(self.doc,'transitionend',function(e){console.log(e)},false); TEST!! Later or soon I use it! (I hope so)
    } else {
      this.doScroll = function(y) {
        self.newscrolly = y;
        var df = y-self.getScrollTop();
        if ((df*df)>100) {
          self.newspeedy = {
            x:y-Math.round(df/6),
            v:Math.round(df/6*5/8)+1
          };
        } else {
          self.newspeedy = false;
        }
        if (self.timer) return;
        var rt = 1/4;      
        var sync = 0;
        var lastsync = 0;
        function scrolling() {
          if (self.cancelAnimationFrame) return true;
          sync=(new Date()).getTime();
          if (sync<lastsync) return (self.timer = setAnimationFrame(scrolling)||1);
          lastsync = Math.floor((new Date()).getTime()+self.opt.scrollspeed/2);
          sync=0;
          var sy = self.getScrollTop();
          if (self.newspeedy) {
            var sc = sy + self.newspeedy.v;
            if (self.newspeedy.v>0) {
              if (sc>=self.newspeedy.x) self.newspeedy = false;
            } else {
              if (sc<=self.newspeedy.x) self.newspeedy = false;
            }
          } else {
            var gp = self.newscrolly - self.getScrollTop();
            var df = (gp>0) ? Math.ceil(gp*rt) : Math.floor(gp*rt);
            var sc = self.getScrollTop()+df;
          }
          self.setScrollTop(sc);
//          if (!self.cursorfreezed) self.showCursor(sc);
          if (sc == self.newscrolly) {
//            clearAnimationFrame(self.timer);
            self.timer = 0;        
            self.cursorfreezed = false;
          } else {
            self.timer = setAnimationFrame(scrolling)||1;
          }
        };
        self.cancelAnimationFrame=false;
        self.timer = setAnimationFrame(scrolling)||1;
        
        self.noticeCursor();
      };
      this.cancelScroll = function() {
        if (self.timer) clearAnimationFrame(self.timer);
        self.timer = 0;
        return self;
      };
    }
    
    this.doScrollBy = function(stp,absolute) {
      var ny = 0;
      if (absolute) {
        if (self.timer) {
          ny = self.newscrolly-stp;
        } else {
          ny = self.getScrollTop()-stp;  
        }          
      } else {
        ny = Math.floor((self.scroll.y-stp)*self.scrollratio.y)
      }
      if (ny<0) ny=0
      else if (ny>self.page.maxh) ny = self.page.maxh;
      self.cursorfreezed = false;
      self.doScroll(ny);
    };
    
    this.doScrollTo = function(pos,absolute) {
      var ny = (absolute) ? pos : Math.round(pos*self.scrollratio.y);
      if (ny<0) ny=0
      else if (ny>self.page.maxh) ny = self.page.maxh;
      self.cursorfreezed = false;
      self.doScroll(pos);
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
      self.noticeCursor();
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
      self.setScrollTop(py);
      
      self.onResize();
    };
   
    this.init();

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
    
    this.timer = 0;
    
    this.time = function() {
      return (new Date()).getTime();
    };
    
    this.reset = function(py) {
      self.stop();
      self.lasttime = self.time();
      self.speedy = 0;
      self.lasty = py;      
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
      }    
    };
    
    this.doSnapy = function(ny) {
      if (ny<0) {
        self.nc.doScrollTo(0,true);
      }
      else if (ny>self.nc.page.maxh) {
        self.nc.doScrollTo(self.nc.page.maxh,true);
      }
    };
    
    this.doMomentum = function() {
      var l = self.lasttime;
      var t = self.time();
      
      self.speedy = Math.min(200,self.speedy);
      
      var chk = l && (t - l) <= 50;
      var sy = (self.speedy && chk) ? self.speedy : false;
      
      if (sy) {
        var tm = t-l;
        self.demuly = 0;
        var onscroll = function(){          
          var ny = Math.floor(self.nc.getScrollTop() - (self.speedy*(1-self.demuly)));
          self.demuly+=0.02;
          self.nc.setScrollTop(ny);
          self.nc.showCursor(ny);
          if(self.demuly<1) {
            self.timer = setTimeout(onscroll,tm);
          } else {
            self.timer = 0;
            self.nc.hideCursor();
            self.doSnapy(ny);
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
 
  jQuery.fn.scrollTop = function(value) {    
    if (typeof value == "undefined") {
      var nice = $.data(this,'__nicescroll')||false;
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
  
    this.show = function() {
      return self.each(function(){
        this.show();
      });
    };

    this.hide = function() {
      return self.each(function(){
        this.hide();
      });
    };

    this.onResize = function() {  // OBSOLETE - for compatibilty
      return self.each(function(){
        this.onResize();
      });
    };

    this.resize = function() {
      return self.each(function(){
        this.resize();
      });
    };
    
    this.remove = function() {
      return self.each(function(){
        this.remove();
      });
    };
    
    this.stop = function() {
      return self.each(function(){
        this.stop();
      });
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
  
  jQuery.fn.getNiceScroll = function(index) {
    if (typeof index == "undefined") {
      return (this.length>0) ? new NiceScrollArray(this) : $.data(this,'__nicescroll')||false;
    } else {
      var nice = $.data(this[index],'__nicescroll')||false;
      return nice;
    }
  };
  
  jQuery.extend(jQuery.expr[':'], {
    nicescroll: function(a) { 
      return ($.data(a,'__nicescroll')||false);
    }
  });  
  
  $.fn.niceScroll = function(wrapper,opt) {        
    if ((typeof wrapper=="object") && (typeof opt=="undefined")) {
      opt = wrapper;
      wrapper = false;
    }
    var ret = new NiceScrollArray();
    if (typeof opt=="undefined") opt = {};
    if (wrapper||false) {
      opt.doc = $(wrapper);
      opt.win = $(this);
    }    
    var docundef = !("doc" in opt);   
    
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
  
})( jQuery );
  