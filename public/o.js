(function () {
  'use strict';

  // Extract project ID from the script tag's src or data attribute
  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf('/o.js') !== -1) return scripts[i];
    }
  })();

  var projectId = script && (
    script.getAttribute('data-project-id') ||
    script.getAttribute('data-site') ||
    new URL(script.src).searchParams.get('pid')
  );
  if (!projectId) {
    console.warn('[Observer] Missing project ID. Add data-project-id="YOUR_ID" to the script tag.');
    return;
  }

  // API endpoint: explicit data-api attribute, or derived from the script's origin.
  var endpoint = (script && script.getAttribute('data-api')) ||
    script.src.replace(/\/[^\/]*\.js.*$/, '/api/track');
  var sessionId = getSessionId();
  var pageEnteredAt = Date.now();
  var maxScroll = 0;
  var events = [];
  var flushTimer = null;
  var FLUSH_INTERVAL = 3000;
  var FLUSH_SIZE = 20;

  // --- Session Management ---
  function getSessionId() {
    var key = '__obs_sid';
    var sid = sessionStorage.getItem(key);
    if (!sid) {
      sid = generateId();
      sessionStorage.setItem(key, sid);
    }
    return sid;
  }

  function generateId() {
    return 'xxxxxxxx-xxxx-4xxx'.replace(/[x]/g, function () {
      return ((Math.random() * 16) | 0).toString(16);
    });
  }

  // --- Event Tracking ---
  function track(type, data) {
    events.push({
      type: type,
      timestamp: Date.now(),
      url: location.href,
      path: location.pathname,
      data: data || {}
    });

    if (events.length >= FLUSH_SIZE) flush();
    scheduleFlush();
  }

  function flush() {
    if (events.length === 0) return;

    var payload = {
      projectId: projectId,
      sessionId: sessionId,
      visitor: getVisitorId(),
      events: events.splice(0)
    };

    if (navigator.sendBeacon) {
      var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(payload));
    }
  }

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(function () {
      flushTimer = null;
      flush();
    }, FLUSH_INTERVAL);
  }

  // --- Visitor ID (persists across sessions) ---
  function getVisitorId() {
    var key = '__obs_vid';
    var vid = localStorage.getItem(key);
    if (!vid) {
      vid = generateId();
      localStorage.setItem(key, vid);
    }
    return vid;
  }

  // --- Element Descriptor ---
  function describeElement(el) {
    if (!el || !el.tagName) return null;
    var desc = {
      tag: el.tagName.toLowerCase(),
      id: el.id || undefined,
      classes: el.className && typeof el.className === 'string' ? el.className.split(/\s+/).slice(0, 3) : undefined,
      text: (el.innerText || '').substring(0, 80) || undefined,
      href: el.href || undefined,
      type: el.type || undefined,
      name: el.name || undefined,
      placeholder: el.placeholder || undefined,
      label: fieldLabelText(el) || undefined
    };
    // Remove undefined keys
    Object.keys(desc).forEach(function (k) { if (desc[k] === undefined) delete desc[k]; });
    return desc;
  }

  // Best human-readable label for a form field.
  function fieldLabelText(el) {
    if (!el || !el.tagName) return '';
    // aria-label wins
    var aria = el.getAttribute && el.getAttribute('aria-label');
    if (aria) return aria.trim().substring(0, 80);
    // aria-labelledby -> referenced element text
    var labelledby = el.getAttribute && el.getAttribute('aria-labelledby');
    if (labelledby) {
      var ref = document.getElementById(labelledby);
      if (ref && ref.innerText) return ref.innerText.trim().substring(0, 80);
    }
    // <label for="id">
    if (el.id) {
      var forLabel = document.querySelector('label[for="' + (window.CSS && CSS.escape ? CSS.escape(el.id) : el.id) + '"]');
      if (forLabel && forLabel.innerText) return forLabel.innerText.trim().substring(0, 80);
    }
    // wrapping <label>
    var parentLabel = el.closest && el.closest('label');
    if (parentLabel && parentLabel.innerText) return parentLabel.innerText.trim().substring(0, 80);
    return '';
  }

  // --- Click Tracking ---
  document.addEventListener('click', function (e) {
    var el = e.target.closest('a, button, [role="button"], input[type="submit"], [data-obs-track]') || e.target;
    track('click', {
      element: describeElement(el),
      x: e.clientX,
      y: e.clientY
    });
  }, true);

  // --- Scroll Tracking ---
  var scrollTimeout;
  window.addEventListener('scroll', function () {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function () {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var percent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      if (percent < 0) percent = 0;
      if (percent > 100) percent = 100;

      if (percent > maxScroll) {
        maxScroll = percent;
        track('scroll', { depth: percent, maxDepth: maxScroll });
      }
    }, 150);
  }, { passive: true });

  // --- Form Interaction Tracking ---
  document.addEventListener('focus', function (e) {
    var el = e.target;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
      track('form_focus', { element: describeElement(el) });
    }
  }, true);

  document.addEventListener('submit', function (e) {
    var form = e.target;
    track('form_submit', {
      element: describeElement(form),
      action: form.action || undefined,
      method: form.method || 'get'
    });
    flush(); // Flush immediately on submit
  }, true);

  // --- Page View ---
  track('pageview', {
    referrer: document.referrer || undefined,
    title: document.title,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight
  });

  // --- Page Visibility / Leave ---
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      track('page_leave', {
        timeOnPage: Date.now() - pageEnteredAt,
        maxScroll: maxScroll
      });
      flush();
    }
  });

  window.addEventListener('beforeunload', function () {
    track('page_leave', {
      timeOnPage: Date.now() - pageEnteredAt,
      maxScroll: maxScroll
    });
    flush();
  });

  // --- SPA Navigation Detection ---
  var lastPath = location.pathname;
  var spaObserver = new MutationObserver(function () {
    if (location.pathname !== lastPath) {
      // Track leave of old page
      track('page_leave', {
        timeOnPage: Date.now() - pageEnteredAt,
        maxScroll: maxScroll,
        path: lastPath
      });

      // Reset for new page
      lastPath = location.pathname;
      pageEnteredAt = Date.now();
      maxScroll = 0;

      // Track new pageview
      track('pageview', {
        referrer: document.referrer || undefined,
        title: document.title,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight
      });

      // Re-observe sections on new page
      observeSections();
    }
  });
  spaObserver.observe(document.body, { childList: true, subtree: true });

  // --- Section Visibility Tracking (IntersectionObserver) ---
  var SECTION_ATTR = 'observer-section';
  var sectionState = {}; // { enteredAt, deepAt, engaged, fired }

  function flushSection(name, el) {
    var s = sectionState[name];
    if (!s || s.fired) return;
    s.fired = true;
    var duration = s.enteredAt ? Date.now() - s.enteredAt : 0;
    // engaged = held the focus band for at least 1 second
    var engaged = s.engaged || (s.deepAt && (Date.now() - s.deepAt >= 1000));
    track('section_view', {
      section: name,
      duration: duration,
      engaged: engaged,
      tag: el ? el.tagName.toLowerCase() : undefined,
      id: (el && el.id) || undefined
    });
  }

  function observeSections() {
    if (!window.IntersectionObserver) return;

    var sections = document.querySelectorAll('[' + SECTION_ATTR + ']');
    if (!sections.length) return;

    // A section is "active" only while it crosses a band through the vertical
    // centre of the screen. It fires the moment it leaves that band — i.e. as
    // soon as the next section takes over — instead of waiting for the section
    // to scroll completely off screen (which lags by 1-2 sections when several
    // are visible at once).
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var name = entry.target.getAttribute(SECTION_ATTR);
        if (!name) return;

        if (!sectionState[name]) {
          sectionState[name] = { enteredAt: null, deepAt: null, engaged: false, fired: false };
        }
        var s = sectionState[name];
        if (s.fired) return;

        // Ignore exits caused by the tab being hidden (tab switch, minimize).
        // The browser reports every observed element as not-intersecting when
        // the page is hidden, which would otherwise flush all sections at once.
        if (document.visibilityState === 'hidden') return;

        if (entry.isIntersecting) {
          // Section reached the focus band — it's now the active section.
          if (!s.enteredAt) {
            s.enteredAt = Date.now();
            s.deepAt = s.enteredAt;
          }
        } else {
          // Section left the focus band — the next section is taking over.
          if (s.enteredAt) {
            if (s.deepAt && (Date.now() - s.deepAt >= 1000)) {
              s.engaged = true;
            }
            flushSection(name, entry.target);
            sectionObserver.unobserve(entry.target);
          }
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    sections.forEach(function (el) {
      var name = el.getAttribute(SECTION_ATTR);
      if (!sectionState[name] || !sectionState[name].fired) {
        sectionObserver.observe(el);
      }
    });

    // On page leave, flush any sections still in viewport
    function flushRemaining() {
      var elems = document.querySelectorAll('[' + SECTION_ATTR + ']');
      elems.forEach(function (el) {
        var name = el.getAttribute(SECTION_ATTR);
        if (name) flushSection(name, el);
      });
    }
    // Only flush still-visible sections when the page is genuinely unloading.
    // pagehide fires on real navigation/close but NOT on tab switches, so a
    // user leaving and returning to the tab no longer dumps every section.
    function flushRemainingAndSend() {
      flushRemaining();
      flush();
    }
    window.addEventListener('pagehide', flushRemainingAndSend);
    window.addEventListener('beforeunload', flushRemainingAndSend);
  }

  // Initial observation (wait for DOM ready)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeSections);
  } else {
    observeSections();
  }

})();
