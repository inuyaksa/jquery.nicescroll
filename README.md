#jQuery.NiceScroll
v. 3.5.4 11-13-2013
 - [Web Site: nicescroll.areaaperta.com](http://nicescroll.areaaperta.com)
 - [Repo: github.com/inuyaksa/jquery.nicescroll](https://github.com/inuyaksa/jquery.nicescroll)
 - [Twitter: @nicescroll](https://twitter.com/nicescroll)

> Nicescroll as a Greasemonkey plugin: http://userscripts.org/scripts/show/119910 (freezed)


> Nicescroll is a jquery plugin, for nice scrollbars with a very similar ios/mobile style.

  - NOW supports HORIZONAL scrollbar too!
  - It supports DIVs, IFrames, textarea, and document page (body) scrollbars.
  - Compatible with all desktop browser: Firefox 4+, Chrome 5+, Safari 4+ (win/mac), Opera 10+, IE 6+. (all A-grade browsers)
  - Compatible with mobile device: iPad/iPhone/iPod, Android 2.2+, Blackberry phones and Playbook (WebWorks/Table OS), Windows Phone 7.5 Mango.
  - Compatible with all touch devices: iPad, Window Surface.
  - Compabible with multi-input device (mouse with touch or pen): Window Surface, Chrome Desktop on touch notebook.
  - Compatible with 2 directions mice: Apple Magic Mouse, Apple Mouser with 2-dir wheel, PC mouse with 2-dir wheel (if browser support it).

So you have scrollable divs with momentum for iPad 4+ and you have consistent scrollable areas for all desktop and mobile platforms.

Sexy zoom feature, you can "zoom-in" the content of any nicescroll'ed div.
Nice to use and nice to see, all the content of the div in fullscreen mode.
It works on desktop (double click on div) either in mobile/touch devices using pinch gesture.

On modern browsers hardware accelerated scrolling has implemented.
Using animationFrame for a smoothest and cpu-saving scrolling. (when browser supports)

Warning for IE6 users (why do you uses IE6 yet? Please updgrade to a more stable and modern browser), some feature can't work for limitation of the browser.
Document (body) scrollbars can't appears, old (native browser) one is used. Some issues with IFrame scrolling.


## FEATURES

- simple installation and activation, it works with NO modification of your code. (some exceptions can happen, so you can write to me)
- very stylish scrollbars, with no occupation on your window (original browser scrollbars need some of page space and reduces window/div usable width)
- you can style main document scrollbar (body) too!! (not all script implements this feature)
- on all browsers you can scroll: dragging the cursor, mouse wheel (speed customizable), keyboard navigation (cursor keys, pagup/down keys, home/end keys)
- scroll is smooth (as modern tablet browsing), speed is customizable
- zoom feature
- hardware accelerated scroll (where available)
- animation frame support for smoth scrolling and cpu-saving
- dragging scroll mode with scrolling momentum (as touch device)
- tested for all major browsers desktop and mobile versions
- support for touch devices
- support for multi-input devices (IE10 with MSPointer)
- compatible with many other browsers, including IE6, Safari on Mac and WP7 Mango!
- very customizable aspect of bar
- native scroll events are working yet
- fully integrated with jQuery
- compatibile with jQuery UI, jQuery Touch, jQuery Mobile


## DEPENDENCIES
>> It's a plugin for the jquery framework, you need to include jquery in your scripts.
>> From 1.5.x version and on. (you can try with 1.4.2+ also)


* INSTALLATION
Put loading script tag after jquery script tag and loading the zoom image in the same folder of the script:

<script src="jquery.nicescroll.js"></script>

Copy image "zoomico.png" in the same folder of jquery.nicescroll.js.


* HOW TO USE

Initialize nicescroll ALWAYS in (document) ready statement.
```javascript

  1. Simple mode, it styles document scrollbar:
  $(document).ready(
    function() {  
      $("html").niceScroll();
    }
  );

  2. Instance with object returned:

  var nice = false;
  $(document).ready(
    function() {  
      nice = $("html").niceScroll();
    }
  );

  3. Style a DIV and chage cursor color:

  $(document).ready(
    function() {  
      $("#thisdiv").niceScroll({cursorcolor:"#00F"});
    }
  );

  4. DIV with "wrapper", formed by two divs, the first is the vieport, the latter is the content:

  $(document).ready(
    function() {
      $("#viewportdiv").niceScroll("#wrapperdiv",{cursorcolor:"#00F"});
    }
  );

  5. Get nicescroll object:

  var nice = $("#mydiv").getNiceScroll();

  6. Hide scrollbars:

  $("#mydiv").getNiceScroll().hide();

  7. Check for scrollbars resize (when content or position have changed):

  $("#mydiv").getNiceScroll().resize();

  8. Scrolling to a position:

  Scroll X Axis - $("#mydiv").getNiceScroll().doScrollLeft(x, duration);
  Scroll Y Axis - $("#mydiv").getNiceScroll().doScrollTop(y, duration);
```

## CONFIGURATION PARAMETERS
When you call "niceScroll" you can pass some parameters to custom visual aspects:
  
- cursorcolor - change cursor color in hex, default is "#000000"
- cursoropacitymin - change opacity very cursor is inactive (scrollabar "hidden" state), range from 1 to 0, default is 0 (hidden)
- cursoropacitymax - change opacity very cursor is active (scrollabar "visible" state), range from 1 to 0, default is 1 (full opacity)
- cursorwidth - cursor width in pixel, default is 5 (you can write "5px" too)
- cursorborder - css definition for cursor border, default is "1px solid #fff"
- cursorborderradius - border radius in pixel for cursor, default is "4px"
- zindex - change z-index for scrollbar div, default value is 9999
- scrollspeed - scrolling speed, default value is 60
- mousescrollstep - scrolling speed with mouse wheel, default value is 40 (pixel)
- touchbehavior - enable cursor-drag scrolling like touch devices in desktop computer, default is false
- hwacceleration - use hardware accelerated scroll when supported, default is true
- boxzoom - enable zoom for box content, default is false
- dblclickzoom - (only when boxzoom=true) zoom activated when double click on box, default is true
- gesturezoom - (only when boxzoom=true and with touch devices) zoom activated when pinch out/in on box, default is true
- grabcursorenabled, display "grab" icon for div with touchbehavior = true, default is true
- autohidemode, how hide the scrollbar works, true=default / "cursor" = only cursor hidden / false = do not hide
- background, change css for rail background, default is ""
- iframeautoresize, autoresize iframe on load event (default:true)
- cursorminheight, set the minimum cursor height in pixel (default:20)
- preservenativescrolling, you can scroll native scrollable areas with mouse, bubbling mouse wheel event (default:true)
- railoffset, you can add offset top/left for rail position (default:false)
- bouncescroll, enable scroll bouncing at the end of content as mobile-like (only hw accell) (default:false)
- spacebarenabled, enable page down scrolling when space bar has pressed (default:true)
- railpadding, set padding for rail bar (default:{top:0,right:0,left:0,bottom:0})
- railmargin, set margin for rail bar (default:{top:0,right:0,left:0,bottom:0}) 
- railhpadding, set padding for hrail bar (default:{top:-1,right:-1,left:-1,bottom:-1}), if no specific railhpadding is set it'll mirror the settings from rail bar when mirrorrails is set to true
- railhmargin, set margin for hrail bar (default:{top:-1,right:-1,left:-1,bottom:-1}), if no specific railhmargin is set it'll mirror the settings from rail bar when mirrorrails is set to true
- mirrorrails, if no specific railhmargin/railhpadding is set it'll mirror the settings from rail bar (default:true)
- disableoutline, for chrome browser, disable outline (orange hightlight) when selecting a div with nicescroll (default:true)
- horizrailenabled, nicescroll can manage horizontal scroll (default:true)
- railalign, alignment of vertical rail (defaul:"right")
- railvalign, alignment of horizontal rail (defaul:"bottom")
- enabletranslate3d, nicescroll can use css translate to scroll content (default:true)
- enablemousewheel, nicescroll can manage mouse wheel events (default:true)
- enablekeyboard, nicescroll can manage keyboard events (default:true)
- smoothscroll, scroll with ease movement (default:true)
- sensitiverail, click on rail make a scroll (default:true)
- enablemouselockapi, can use mouse caption lock API (same issue on object dragging) (default:true)
- cursorfixedheight, set fixed height for cursor in pixel (default:false)
- hidecursordelay, set the delay in microseconds to fading out scrollbars (default:400)
- directionlockdeadzone, dead zone in pixels for direction lock activation (default:6)
- nativeparentscrolling , detect bottom of content and let parent to scroll, as native scroll does (default:true)
- enablescrollonselection, enable auto-scrolling of content when selection text (default:true)
- rtlmode, horizontal div scrolling starts at left side (default:false)
- cursordragontouch, drag cursor in touch / touchbehavior mode also (default:false)
- oneaxismousemode, it permits horizontal scrolling with mousewheel on horizontal only content, if false (vertical-only) mousewheel don't scroll horizontally, if value is auto detects two-axis mouse (default:"auto")
- scriptpath, define custom path for boxmode icons (default:"" => same script path)

* LICENSE

## Copyright 2011-13 InuYaksa

######Licensed under the MIT License, http://www.opensource.org/licenses/mit-license.php
######Images used for zoom icons have derived from OLPC interface, http://laptop.org/8.2.0/manual/Browse_ChangingView.html
