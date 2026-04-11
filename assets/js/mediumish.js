document.addEventListener("DOMContentLoaded", () => {
  // Navbar toggle
  const toggler = document.querySelector(".navbar-toggler");
  if (toggler) {
    toggler.addEventListener("click", () => {
      const nav = document.getElementById("navbarMediumish");
      if (!nav) return;
      nav.classList.toggle("show");
      toggler.setAttribute("aria-expanded", nav.classList.contains("show"));
    });
  }

  // Smooth scroll to hash on page load
  if (location.hash) {
    const target = document.getElementById(location.hash.substring(1));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Smooth scroll for anchor links
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href*="#"]:not([href="#"])');
    if (!link) return;

    if (
      link.pathname.replace(/^\//, "") === location.pathname.replace(/^\//, "") &&
      link.hostname === location.hostname
    ) {
      const target = document.querySelector(link.hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  });

  // Share links: native share on mobile, popup on desktop
  document.querySelectorAll(".share-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      if (navigator.share) {
        navigator.share({ title: document.title, url: window.location.href }).catch(() => {});
      } else {
        window.open(link.href, "share", "width=550,height=435");
      }
    });
  });

  // Hide navbar on scroll down, show on scroll up
  let lastScrollTop = 0;
  const delta = 5;
  const nav = document.querySelector("nav");
  const navbarHeight = nav?.offsetHeight ?? 0;
  let ticking = false;

  function hasScrolled() {
    if (!nav) return;
    const st = window.pageYOffset || document.documentElement.scrollTop;

    if (Math.abs(lastScrollTop - st) <= delta) return;

    if (st > lastScrollTop && st > navbarHeight) {
      nav.style.top = `${-navbarHeight}px`;
    } else if (st + window.innerHeight < document.body.scrollHeight) {
      nav.style.top = "0px";
    }

    lastScrollTop = st;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          hasScrolled();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
});
