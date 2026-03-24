jQuery(document).ready(function ($) {
  // Smooth on external page
  $(function () {
    setTimeout(function () {
      if (location.hash) {
        window.scrollTo(0, 0);
        target = location.hash.split("#");
        smoothScrollTo($("#" + target[1]));
      }
    }, 1);

    $("a[href*=\\#]:not([href=\\#])").click(function () {
      if (
        location.pathname.replace(/^\//, "") ==
          this.pathname.replace(/^\//, "") &&
        location.hostname == this.hostname
      ) {
        smoothScrollTo($(this.hash));
        return false;
      }
    });

    function smoothScrollTo(target) {
      target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");

      if (target.length) {
        $("html,body").animate(
          {
            scrollTop: target.offset().top,
          },
          1000
        );
      }
    }
  });

  // Hide Header on scroll down
  var didScroll;
  var lastScrollTop = 0;
  var delta = 5;
  var navbarHeight = $("nav").outerHeight();

  $(window).scroll(function (event) {
    didScroll = true;
  });

  setInterval(function () {
    if (didScroll) {
      hasScrolled();
      didScroll = false;
    }
  }, 250);

  function hasScrolled() {
    var st = $(this).scrollTop();

    if (Math.abs(lastScrollTop - st) <= delta) return;

    if (st > lastScrollTop && st > navbarHeight) {
      $("nav").removeClass("nav-down").addClass("nav-up");
      $(".nav-up").css("top", -$("nav").outerHeight() + "px");
    } else {
      if (st + $(window).height() < $(document).height()) {
        $("nav").removeClass("nav-up").addClass("nav-down");
        $(".nav-up, .nav-down").css("top", "0px");
      }
    }

    lastScrollTop = st;
  }

  $(".site-content").css("margin-top", $("header").outerHeight() + "px");
});

// deferred style loading
var loadDeferredStyles = function () {
  var addStylesNode = document.getElementById("deferred-styles");
  var replacement = document.createElement("div");
  replacement.innerHTML = addStylesNode.textContent;
  document.body.appendChild(replacement);
  addStylesNode.parentElement.removeChild(addStylesNode);
};
var raf =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;
if (raf)
  raf(function () {
    window.setTimeout(loadDeferredStyles, 0);
  });
else window.addEventListener("load", loadDeferredStyles);
