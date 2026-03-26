document.addEventListener("DOMContentLoaded", function () {
  // Navbar toggle
  var toggler = document.querySelector(".navbar-toggler");
  if (toggler) {
    toggler.addEventListener("click", function () {
      var nav = document.getElementById("navbarMediumish");
      nav.classList.toggle("show");
      toggler.setAttribute("aria-expanded", nav.classList.contains("show"));
    });
  }

  // Smooth scroll to hash on page load
  setTimeout(function () {
    if (location.hash) {
      window.scrollTo(0, 0);
      var target = document.getElementById(location.hash.substring(1));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, 1);

  // Smooth scroll for anchor links
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href*="#"]:not([href="#"])');
    if (!link) return;

    if (
      link.pathname.replace(/^\//, "") ===
        location.pathname.replace(/^\//, "") &&
      link.hostname === location.hostname
    ) {
      var target = document.querySelector(link.hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  });

  // Hide navbar on scroll down, show on scroll up
  var didScroll = false;
  var lastScrollTop = 0;
  var delta = 5;
  var nav = document.querySelector("nav");
  var navbarHeight = nav ? nav.offsetHeight : 0;

  window.addEventListener("scroll", function () {
    didScroll = true;
  });

  setInterval(function () {
    if (didScroll) {
      hasScrolled();
      didScroll = false;
    }
  }, 250);

  function hasScrolled() {
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
});
