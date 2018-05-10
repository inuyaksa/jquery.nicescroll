# jQuery.NiceScroll
v. 3.7.6

## The best nicescroll release ever - extremely smooth and consistent in modern browsers and mobile devices, with low resource usage

 - [Web Site: nicescroll.areaaperta.com](https://nicescroll.areaaperta.com)
 - [Repo: github.com/inuyaksa/jquery.nicescroll](https://github.com/inuyaksa/jquery.nicescroll)
 - [Twitter: @nicescroll](https://twitter.com/nicescroll)

 [![Join the chat at https://gitter.im/inuyaksa/jquery.nicescroll](https://badges.gitter.im/inuyaksa/jquery.nicescroll.svg)](https://gitter.im/inuyaksa/jquery.nicescroll?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> Nicescroll as a Greasemonkey plugin: http://userscripts.org/scripts/show/119910 (freezed)


> Nicescroll is a jQuery plugin, for nice scrollbars with a very similar ios/mobile style.

  - HORIZONAL scrollbar support!
  - It supports DIVs, IFrames, textarea, and document page (body) scrollbars.
  - Compatible with all recent desktop browsers and older: Chrome, Firefox, Edge, IE8+, Safari (win/mac), Opera. (all A-grade browsers)
  - Compatible with mobile devices: iPad/iPhone/iPod, Android 4+, Blackberry phones and Playbook (WebWorks/Table OS), Windows Phone 8 and 10.
  - Compatible with all touch devices: iPad, Android tablets, Window Surface.
  - Compabible with multi-input devices (mouse with touch or pen): Window Surface, Chrome Desktop on touch notebook.
  - Compatible with 2-directional mice: Apple Magic Mouse, Apple Mouser with 2-dir wheel, PC mouse with 2-dir wheel (if browser support it).

What you get: customizable and scrollable divs with momentum for iPad and consistent scrollable areas for all desktop and mobile platforms.

Sexy zoom feature: you can "zoom in" on the content of any nicescroll enabled DIV.
Nice to use and nice to see: all the content of the DIV in fullscreen mode.
It works on desktop (double click on div) either in mobile/touch devices using the pinch gesture.

On modern browsers hardware accelerated scrolling has been implemented.
Using animationFrame for smoother and cpu-saving scroll animations. (when browser supports)

"Use strict" tested script for maximum code quality.
Bower and AMD ready.

Warning for IE6/IE7 users: support for your browser has been deprecated. (Why do you still use this? Please upgrade to a more stable and modern browser)


## FEATURES

- Simple installation and activation: functions with NO modification of your code. (some exceptions can happen, in which case you can write to me.)
- Very stylish scrollbars with no occupation on your window: original browser scrollbars need some of page space and reduces window/div usable width.
- You can style main document scrollbar (body) too! (not all devices/browsers support this feature yet)
- You can scroll by dragging the cursor, mouse wheel (speed customizable), keyboard navigation (cursor keys, pagup/down keys, home/end keys) on all browsers.
- Scrolling is smooth (like modern tablet browsing). Speed is customizable.
- Zoom feature.
- Hardware accelerated scroll (where available).
- Animation frame support for smooth scrolling and cpu-saving.
- Dragging scroll mode with scrolling momentum (like touch devices).
- Tested for all major mobile and desktop browser versions.
- Support for touch devices.
- Support for multi-input devices (MSPointer/Pointer support).
- Compatible with many other browsers and webkit derivatives!
- Scrollbar has a lot a customizable features.
- Native scroll events are working.
- Fully integrated with jQuery.
- Compatibile with jQuery UI, jQuery Touch, jQuery Mobile


## DEPENDENCIES
>> jQuery is required to be included in your scripts.
>> Works with jQuery 1.x / 2.x / 3.x branch (slim version don't works)


* INSTALLATION
Put loading script tag after jquery script tag and loading the zoom image in the same folder of the script:

<script src="jquery.nicescroll.js"></script>

When using the zoom feature, copy "zoomico.png" in to the same folder as jquery.nicescroll.js.


* HOW TO USE

ALWAYS Initialize nicescroll in a (document) ready statement.
```javascript
// 1. Simple mode, it styles document scrollbar:
$(function() {  
    $("body").niceScroll();
});

// 2. Instance with object returned:
var nice = false;
$(function() {  
    nice = $("body").niceScroll();
});

// 3. Style a DIV and change cursor color:
$(function() {  
    $("#thisdiv").niceScroll({cursorcolor:"#00F"});
});

// 4. DIV with "wrapper", formed by two divs, the first is the vieport, the latter is the content:
$(function() {
    $("#viewportdiv").niceScroll("#wrapperdiv",{cursorcolor:"#00F"});
});

// 5. Get nicescroll object:
var nice = $("#mydiv").getNiceScroll();

// 6. Hide scrollbars:
$("#mydiv").getNiceScroll().hide();

// 7. Check for scrollbars resize (when content or position have changed):
$("#mydiv").getNiceScroll().resize();

// 8. Scrolling to a position:
$("#mydiv").getNiceScroll(0).doScrollLeft(x, duration); // Scroll X Axis
$("#mydiv").getNiceScroll(0).doScrollTop(y, duration); // Scroll Y Axis
```

## CONFIGURATION PARAMETERS
When you call "niceScroll" you can pass some parameters to custom visual aspects:

```javascript
$("#thisdiv").niceScroll({
    cursorcolor: "#424242", // change cursor color in hex
    cursoropacitymin: 0, // change opacity when cursor is inactive (scrollabar "hidden" state), range from 1 to 0
    cursoropacitymax: 1, // change opacity when cursor is active (scrollabar "visible" state), range from 1 to 0
    cursorwidth: "5px", // cursor width in pixel (you can also write "5px")
    cursorborder: "1px solid #fff", // css definition for cursor border
    cursorborderradius: "5px", // border radius in pixel for cursor
    zindex: "auto" | [number], // change z-index for scrollbar div
    scrollspeed: 60, // scrolling speed
    mousescrollstep: 40, // scrolling speed with mouse wheel (pixel)
    touchbehavior: false, // DEPRECATED!! use "emulatetouch"
    emulatetouch: false, // enable cursor-drag scrolling like touch devices in desktop computer
    hwacceleration: true, // use hardware accelerated scroll when supported
    boxzoom: false, // enable zoom for box content
    dblclickzoom: true, // (only when boxzoom=true) zoom activated when double click on box
    gesturezoom: true, // (only when boxzoom=true and with touch devices) zoom activated when pinch out/in on box
    grabcursorenabled: true // (only when touchbehavior=true) display "grab" icon
    autohidemode: true, // how hide the scrollbar works, possible values: 
      true | // hide when no scrolling
      "cursor" | // only cursor hidden
      false | // do not hide,
      "leave" | // hide only if pointer leaves content
      "hidden" | // hide always
      "scroll", // show only on scroll          
    background: "", // change css for rail background
    iframeautoresize: true, // autoresize iframe on load event
    cursorminheight: 32, // set the minimum cursor height (pixel)
    preservenativescrolling: true, // you can scroll native scrollable areas with mouse, bubbling mouse wheel event
    railoffset: false, // you can add offset top/left for rail position
    bouncescroll: false, // (only hw accell) enable scroll bouncing at the end of content as mobile-like 
    spacebarenabled: true, // enable page down scrolling when space bar has pressed
    railpadding: { top: 0, right: 0, left: 0, bottom: 0 }, // set padding for rail bar
    disableoutline: true, // for chrome browser, disable outline (orange highlight) when selecting a div with nicescroll
    horizrailenabled: true, // nicescroll can manage horizontal scroll
    railalign: right, // alignment of vertical rail
    railvalign: bottom, // alignment of horizontal rail
    enabletranslate3d: true, // nicescroll can use css translate to scroll content
    enablemousewheel: true, // nicescroll can manage mouse wheel events
    enablekeyboard: true, // nicescroll can manage keyboard events
    smoothscroll: true, // scroll with ease movement
    sensitiverail: true, // click on rail make a scroll
    enablemouselockapi: true, // can use mouse caption lock API (same issue on object dragging)
    cursorfixedheight: false, // set fixed height for cursor in pixel
    hidecursordelay: 400, // set the delay in microseconds to fading out scrollbars
    directionlockdeadzone: 6, // dead zone in pixels for direction lock activation
    nativeparentscrolling: true, // detect bottom of content and let parent to scroll, as native scroll does
    enablescrollonselection: true, // enable auto-scrolling of content when selection text
    cursordragspeed: 0.3, // speed of selection when dragged with cursor
    rtlmode: "auto", // horizontal div scrolling starts at left side
    cursordragontouch: false, // drag cursor in touch / touchbehavior mode also
    oneaxismousemode: "auto", // it permits horizontal scrolling with mousewheel on horizontal only content, if false (vertical-only) mousewheel don't scroll horizontally, if value is auto detects two-axis mouse
    scriptpath: "" // define custom path for boxmode icons ("" => same script path)
    preventmultitouchscrolling: true // prevent scrolling on multitouch events
    disablemutationobserver: false // force MutationObserver disabled,
    enableobserver: true // enable DOM changing observer, it tries to resize/hide/show when parent or content div had changed
    scrollbarid: false // set a custom ID for nicescroll bars 
});
```

Related projects
----------------

* [Nicescroll for Angular](https://github.com/tushariscoolster/angular-nicescroll)

* LICENSE

## Copyright 2011-17 InuYaksa

###### Licensed under the MIT License, http://www.opensource.org/licenses/mit-license.php

###### Images used for zoom icons have derived from OLPC interface, http://laptop.org/8.2.0/manual/Browse_ChangingView.html
