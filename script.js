"use strict";

/* ─────────────────────────────────────────────────────
   Nav colour mode
   Switches to .nav--dark when the nav's bottom edge is
   over a light-background section (about, quote-left,
   quote-right). Checked on every scroll tick via rAF.
   ───────────────────────────────────────────────────── */
(function navColour() {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  const darkSections = Array.from(
    document.querySelectorAll(".s-about, .s-quote-left, .s-quote-right"),
  );

  let rafPending = false;

  function update() {
    // Page position of the nav's bottom edge
    const navBottom = window.scrollY + nav.offsetHeight;

    const isDark = darkSections.some((el) => {
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      return navBottom >= top && navBottom < bottom;
    });

    nav.classList.toggle("nav--dark", isDark);
    rafPending = false;
  }

  function onScroll() {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update(); // set correct colour on page load
})();

/* ─────────────────────────────────────────────────────
   Hero background zoom
   .s-hero__bg starts at scale(2) and animates to scale(1)
   as the user scrolls through 90 vh.
   At scale 2 (page load) About is at the bottom edge of
   the viewport — as the user scrolls, About rises over the
   fixed hero while the background zooms out to 100%.
   transform-origin: center bottom — bottom edge stays
   anchored while the image zooms out upward.
   ───────────────────────────────────────────────────── */
(function heroZoom() {
  const heroBg = document.querySelector(".s-hero__bg");
  if (!heroBg) return;

  let rafPending = false;

  function applyScale() {
    const scrollY = window.scrollY;
    const heroH = window.innerHeight * 0.9; // 90 vh in px
    const progress = Math.min(Math.max(scrollY / heroH, 0), 1);
    const maxScale = window.innerWidth <= 1024 ? 1.2 : 2; // smaller zoom on mobile
    const scale = maxScale - progress * (maxScale - 1); // maxScale → 1.0

    heroBg.style.transform = `scale(${scale})`;
    rafPending = false;
  }

  function onScroll() {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(applyScale);
    }
  }

  window.addEventListener("resize", applyScale, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  applyScale(); // set initial state — no flash
})();

/* ─────────────────────────────────────────────────────
   Manifesto video — show/play on viewport enter, hide/pause on exit.
   Hidden by default so the fixed hero is visible on page load.
   The IntersectionObserver on pin-manifesto drives both visibility
   and playback: the video only appears when the manifesto area is
   actually in the viewport.
   ───────────────────────────────────────────────────── */
(function manifestoVideo() {
  const videoFixed = document.querySelector(".manifesto-video-fixed");
  const video = document.querySelector(".manifesto-video");
  const pinManifesto = document.querySelector(".pin-manifesto");
  if (!video || !videoFixed || !pinManifesto) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          videoFixed.style.visibility = "visible";
          video.play().catch(() => {
            // Autoplay blocked (e.g. data-saver mode) — silent fail
          });
        } else {
          videoFixed.style.visibility = "hidden";
          video.pause();
        }
      });
    },
    { threshold: 0 }, // fire as soon as any pixel enters / leaves
  );

  observer.observe(pinManifesto);
})();

/* ─────────────────────────────────────────────────────
   Mobile menu — hamburger toggle
   ───────────────────────────────────────────────────── */
(function mobileMenu() {
  const nav = document.querySelector(".nav");
  const burger = document.querySelector(".nav__burger");
  const mobileMenu = document.querySelector(".nav__mobile-menu");
  if (!nav || !burger || !mobileMenu) return;

  function openMenu() {
    nav.classList.add("nav--open");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Menu sluiten");
    mobileMenu.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    nav.classList.remove("nav--open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Menu openen");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  burger.addEventListener("click", () => {
    nav.classList.contains("nav--open") ? closeMenu() : openMenu();
  });

  mobileMenu.querySelectorAll(".nav__mobile-link").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
})();
