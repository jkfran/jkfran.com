document.addEventListener("DOMContentLoaded", function () {
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
      nav.classList.remove("nav-down");
      nav.classList.add("nav-up");
      nav.style.top = -nav.offsetHeight + "px";
    } else {
      if (st + window.innerHeight < document.body.scrollHeight) {
        nav.classList.remove("nav-up");
        nav.classList.add("nav-down");
        nav.style.top = "0px";
      }
    }

    lastScrollTop = st;
  }
});

// Deferred style loading
var loadDeferredStyles = function () {
  var addStylesNode = document.getElementById("deferred-styles");
  if (!addStylesNode) return;
  var replacement = document.createElement("div");
  replacement.innerHTML = addStylesNode.textContent;
  document.body.appendChild(replacement);
  addStylesNode.parentElement.removeChild(addStylesNode);
};

if (window.requestAnimationFrame) {
  window.requestAnimationFrame(function () {
    window.setTimeout(loadDeferredStyles, 0);
  });
} else {
  window.addEventListener("load", loadDeferredStyles);
}
