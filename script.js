/* ============================================
   SINDROME GAMES — Social Hub
   Ultra-Performance · Touch + Mouse Spotlight
   ============================================ */
(function () {
  'use strict';

  /* ========================================
     1. LOGO FADE-IN ON LOAD
     ======================================== */
  var logo = document.querySelector('.logo');
  if (logo) {
    if (logo.complete) {
      logo.classList.add('loaded');
    } else {
      logo.addEventListener('load', function () { logo.classList.add('loaded'); });
    }
  }

  /* ========================================
     2. REMOVE will-change AFTER ENTRY ANIMS
     ======================================== */
  setTimeout(function () {
    var els = document.querySelectorAll('.fade-in, .link-btn');
    for (var i = 0; i < els.length; i++) {
      els[i].style.willChange = 'auto';
    }
  }, 1800);

  /* ========================================
     3. RIPPLE EFFECT — BUTTONS
     ======================================== */
  var style = document.createElement('style');
  style.textContent = '@keyframes ripple{to{transform:scale(4);opacity:0}}';
  document.head.appendChild(style);

  function ripple(btn, x, y) {
    var old = btn.querySelector('.rp');
    if (old) old.remove();
    var rect = btn.getBoundingClientRect();
    var s = Math.max(rect.width, rect.height);
    var el = document.createElement('span');
    el.className = 'rp';
    el.style.cssText =
      'position:absolute;width:' + s + 'px;height:' + s + 'px;left:' +
      (x - rect.left - s / 2) + 'px;top:' + (y - rect.top - s / 2) +
      'px;border-radius:50%;background:rgba(255,255,255,.08);' +
      'transform:scale(0);animation:ripple .6s ease-out forwards;pointer-events:none;z-index:3';
    btn.appendChild(el);
    el.addEventListener('animationend', function () { el.remove(); });
  }

  /* ========================================
     4. BUTTON GLOW + EVENTS
     ======================================== */
  var btns = document.querySelectorAll('.link-btn');
  var hasHover = window.matchMedia('(hover: hover)').matches;

  btns.forEach(function (btn) {
    // Border glow element
    var glow = document.createElement('div');
    glow.className = 'btn-glow';
    glow.setAttribute('aria-hidden', 'true');
    btn.appendChild(glow);

    // Click/touch ripple
    btn.addEventListener('click', function (e) {
      ripple(btn, e.clientX, e.clientY);
    });

    // Desktop: track mouse inside button for border glow
    if (hasHover) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.setProperty('--btn-mx', (e.clientX - r.left) + 'px');
        btn.style.setProperty('--btn-my', (e.clientY - r.top) + 'px');
      });
    }
  });

  /* ========================================
     5. SPOTLIGHT — MOUSE + TOUCH
     ======================================== */
  var spot = document.getElementById('spotlight');
  if (!spot) return;

  var HALF = 300;
  var LERP = 0.1;
  var tx = -600, ty = -600; // Target (offscreen by default)
  var cx = -600, cy = -600; // Current (interpolated)
  var active = false;
  var scrolling = false;
  var scrollTimer = null;

  function tick() {
    cx += (tx - cx) * LERP;
    cy += (ty - cy) * LERP;
    spot.style.transform = 'translate3d(' + (cx - HALF) + 'px,' + (cy - HALF) + 'px,0)';

    if (Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3) {
      requestAnimationFrame(tick);
    } else {
      active = false;
    }
  }

  function startTick() {
    if (!active) {
      active = true;
      requestAnimationFrame(tick);
    }
  }

  function setTarget(x, y) {
    tx = x;
    ty = y;
    startTick();
  }

  /* --- MOUSE (desktop) --- */
  if (hasHover) {
    document.addEventListener('mousemove', function (e) {
      setTarget(e.clientX, e.clientY);
    }, { passive: true });

    // Hide spotlight when mouse leaves the window
    document.addEventListener('mouseleave', function () {
      setTarget(-600, -600);
    }, { passive: true });
  }

  /* --- TOUCH (mobile) --- */
  if (!hasHover) {
    // Show spotlight on touch, but disable during scroll
    document.addEventListener('touchstart', function (e) {
      if (scrolling) return;
      var t = e.touches[0];
      setTarget(t.clientX, t.clientY);
    }, { passive: true });

    document.addEventListener('touchmove', function (e) {
      if (scrolling) return;
      var t = e.touches[0];
      setTarget(t.clientX, t.clientY);
    }, { passive: true });

    document.addEventListener('touchend', function () {
      // Fade the spotlight offscreen after release
      setTarget(-600, -600);
    }, { passive: true });

    // Detect scrolling — disable spotlight during scroll to avoid lag
    window.addEventListener('scroll', function () {
      scrolling = true;
      setTarget(-600, -600);
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        scrolling = false;
      }, 200);
    }, { passive: true });
  }

})();
