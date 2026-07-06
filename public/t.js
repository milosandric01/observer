(function () {
  'use strict';

  // Extract project ID from the script tag's src or data attribute
  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf('/t.js') !== -1) return scripts[i];
    }
  })();

  var projectId = script && (script.getAttribute('data-project') || new URL(script.src).searchParams.get('pid'));
  if (!projectId) {
    console.warn('[Observer] Missing project ID. Add data-project="YOUR_ID" to the script tag.');
    return;
  }

  var endpoint = script.src.replace(/\/t\.js.*$/, '/api/track');
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
  var observer = new MutationObserver(function () {
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
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

})();
