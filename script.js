  setTimeout(function(){
    $("body").addClass("loaded");
  }, 500);

  var svg = d3.select("#nav-svg");
  var nav_line = svg.selectAll(".nav-path");

  svg
    .attr("width", $("nav").width())
    .attr("height", 400);

  var line_maker = d3.svg.diagonal()
      // .x(function(d) { return d.x; })
      // .y(function(d) { return d.y; });
      .source(function(d) { return d[0]; })
      .target(function(d) { return d[1]; });

  $(window).scroll(function(){
    console.log("scrolled");
    if (document.body.scrollTop > 6 && !$("body").hasClass("scrolled")) {
      shrink_nav();
    }
    else if (document.body.scrollTop < 6 && $("body").hasClass("scrolled")) {
      grow_nav();
    }
  });

  var resizetimer;
  $(window).resize(function(){
    clearTimeout(resizetimer);
    resizetimer = setTimeout(refresh, 600);
  });

  function refresh () {
    $("body").scrollTop(0);
    setTimeout(grow_nav, 600);
  }



  function navigate(event) {
    event.preventDefault();

    var href = this.getAttribute("href")
      , title = this.textContent
      , stateObj = { foo: "bar" }
      ;

    if (href == "") href = "home";

    document.body.setAttribute("data-page", href);

    var newpos = $(".desc-" + href + " .hide").offset();
    var thispos = $(this).offset();
    var shift = {
      dx: newpos.left - thispos.left,
      dy: newpos.top - thispos.top };

    // this.style.webkitTransform = build_tform(shift.dx, shift.dy);

    var self = this;
    //move(self, shift);
    move_each_letter(self, shift);
    // move($("nav .active a")[0], {x:0, y:0});

    $("nav .active").removeClass("active");
    $(this).parent().addClass("active");
    // $(".pages li a").attr("style", "");
    $(".pages li a i").attr("style", "");

    history.pushState(stateObj, title, "#/" + href);
    document.title = "Code Studio " + title;

    $("body").scrollTop(0);
  }

  function shrink_nav() {
    document.body.classList.add("scrolled");
    stepping = false;
    $(".pages li a i").attr("style", "");
  }

  function grow_nav() {
    document.body.classList.remove("scrolled");
    stepping = false;
    $("nav .active a").click();
  }


  // INIT

  $("nav li a").on("click", navigate);
  $("nav li a").each(function(index,el){
    wrap_chars_with_tags(el);
  });
  $("nav li a").first().click();

  var stepping;
  function move(self, shift) {
    var velocity = {x: 0, y: 20};
    var goal = shift;
    var current = {x: 0, y: 0};
    var delta = {
      x: goal.dx - current.x,
      y: goal.dy - current.y
    };
    var fric = 0.7;

    stepping = true;



    var navpos = $("nav").offset();

    var width = $(self).width();
    var height= $(self).height();

    // var svg_start_pos = {
    //   x: thispos.left + width/2 - navpos.left,
    //   y: thispos.top - navpos.top + height + 5
    // };


    function step() {

      if (!stepping) {
        return;
      }

      delta = {
        x: goal.dx - current.x,
        y: goal.dy - current.y
      };
      var spring = {
        x: 0.08 * delta.x,
        y: 0.08 * delta.y
      };
      velocity.x += spring.x;
      velocity.y += spring.y;

      velocity.x *= fric;
      velocity.y *= fric;

      // console.log(velocity);

      current.x += velocity.x;
      current.y += velocity.y;

      self.style.webkitTransform = build_tform(current.x, current.y);
      console.log();

      // var svg_end_pos = {
      //   x: svg_start_pos.x + current.x,
      //   y: svg_start_pos.y + current.y - height - 10
      // };

      // var dat = [svg_start_pos, svg_end_pos];

      // nav_line
      //   .datum(dat)
      //   .attr("d", function(d) {
      //     return line_maker(d);
      //   });



      if (Math.abs(delta.x) < 0.1
        && Math.abs(delta.y) < 0.1
        && Math.abs(velocity.x) < 0.1
        && Math.abs(velocity.y) < 0.1) {
        stepping = false;
        self.style.webkitTransform = build_tform(goal.dx, goal.dy);
        return;
      }
      else {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  function move_each_letter(node,shift) {
    move_by_letter(node.children, shift);
  }


  function move_by_letter(arr,shift) {
    for(var i = 0; i < arr.length; i++) {
      delayed_letter(arr[i], shift, i * 15);
    }
  }

  function delayed_letter(letter, shift, delay) {
      setTimeout(function(){
        move(letter,shift);
      }, delay);
  }

  function wrap_chars_with_tags(node){
    var chars = node.textContent.trim().split("");
    var wrapped = chars.reduce(function(prev, curr, i, arr) {
      if (curr == " ") curr = "&nbsp;";
      return prev + "<i>" + curr + "</i>"
    }, ""); // start with blank string
    node.innerHTML = wrapped;
  }



  // Time utility functions
  // ----------------------
  function get_time() {
    if (window.performance) return performance.now();
    else return Date.now();
  }


  // Transformation Utility functions
  // --------------------------------

  function build_tform(x,y) {
    return "translate3d("+
      ~~(x * 1000)/1000 +"px,"+
      ~~(y * 1000)/1000 +"px,0) ";
  }


  // CSS Utility functions
  // ---------------------

  function isiPhone(){
    return (
        //Detect iPhone
        (navigator.platform.indexOf("iPhone") != -1) ||
        //Detect iPad
        (navigator.platform.indexOf("iPad") != -1) ||
        //Detect iPod
        (navigator.platform.indexOf("iPod") != -1)
    );
  }
