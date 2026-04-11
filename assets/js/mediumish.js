document.addEventListener("DOMContentLoaded", function () {
  // Navbar toggle
  var toggler = document.querySelector(".navbar-toggler");
  if (toggler) {
    toggler.addEventListener("click", function () {
      var nav = document.getElementById("navbarMediumish");
      if (!nav) return;
      nav.classList.toggle("show");
      toggler.setAttribute("aria-expanded", nav.classList.contains("show"));
    });
  }

  // Smooth scroll to hash on page load
  if (location.hash) {
    var target = document.getElementById(location.hash.substring(1));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Smooth scroll for anchor links
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href*="#"]:not([href="#"])');
    if (!link) return;

    if (
      link.pathname.replace(/^\//, "") === location.pathname.replace(/^\//, "") &&
      link.hostname === location.hostname
    ) {
      var target = document.querySelector(link.hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  });

  // Share links: native share on mobile, popup on desktop
  document.querySelectorAll(".share-link").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      if (navigator.share) {
        navigator
          .share({
            title: document.title,
            url: window.location.href,
          })
          .catch(function () {});
      } else {
        window.open(link.href, "share", "width=550,height=435");
      }
    });
  });

  // Hide navbar on scroll down, show on scroll up
  var lastScrollTop = 0;
  var delta = 5;
  var nav = document.querySelector("nav");
  var navbarHeight = nav ? nav.offsetHeight : 0;
  var ticking = false;

  function hasScrolled() {
    if (!nav) return;
    var st = window.pageYOffset || document.documentElement.scrollTop;

    if (Math.abs(lastScrollTop - st) <= delta) return;

    if (st > lastScrollTop && st > navbarHeight) {
      nav.style.top = -nav.offsetHeight + "px";
    } else {
      if (st + window.innerHeight < document.body.scrollHeight) {
        nav.style.top = "0px";
      }
    }

    lastScrollTop = st;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          hasScrolled();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
});
