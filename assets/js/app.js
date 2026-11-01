/* ==========================================================================
   Hao Li — Academic CV
   Progressive enhancements: theme, navigation, scrollspy, filters, counters
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (selector, context) { return (context || document).querySelector(selector); };
  var $$ = function (selector, context) { return Array.prototype.slice.call((context || document).querySelectorAll(selector)); };

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var THEME_KEY = 'cv-theme';
  var metaTheme = $('meta[name="theme-color"]');
  var themeToggle = $('#themeToggle');
  var header = $('#siteHeader');
  var nav = $('#siteNav');
  var menuToggle = $('#menuToggle');
  var progressBar = $('#scrollBar');
  var toTop = $('#toTop');
  var toastEl = $('#toast');
  var toastTimer = null;

  /* ---------------------------------------------------------------- utils */

  function normalize(value) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 2200);
  }

  /* ---------------------------------------------------------------- theme */

  function syncThemeUI(theme) {
    var dark = theme === 'dark';
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(dark));
      themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    }
    if (metaTheme) metaTheme.setAttribute('content', dark ? '#0d1211' : '#f7f6f2');
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
    syncThemeUI(theme);
  }

  syncThemeUI(root.getAttribute('data-theme') || 'light');

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* -------------------------------------------------------- mobile menu */

  function setMenu(open) {
    if (!nav || !menuToggle) return;
    nav.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    var use = menuToggle.querySelector('use');
    if (use) use.setAttribute('href', open ? '#i-close' : '#i-menu');
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      setMenu(nav.classList.contains('is-open') === false);
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        menuToggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) return;
      if (!event.target.closest('.site-header')) setMenu(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860 && nav.classList.contains('is-open')) setMenu(false);
    });
  }

  /* ------------------------------------------------------- scrollspy + UI */

  var sections = $$('.section[id]');
  var spyLinks = $$('[data-spy]');
  var activeId = null;

  function setActive(id) {
    if (!id || id === activeId) return;
    activeId = id;
    spyLinks.forEach(function (link) {
      var on = link.getAttribute('data-spy') === id;
      link.classList.toggle('is-active', on);
      if (on) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function updateSpy() {
    if (!sections.length) return;
    var offset = 130;
    var current = sections[0].id;
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= offset) current = section.id;
    });
    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) current = sections[sections.length - 1].id;
    setActive(current);
  }

  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var y = window.scrollY;
      var max = document.documentElement.scrollHeight - window.innerHeight;

      if (header) header.classList.toggle('is-stuck', y > 8);
      if (progressBar) progressBar.style.width = (max > 0 ? Math.min(y / max, 1) * 100 : 0) + '%';
      if (toTop) toTop.classList.toggle('is-visible', y > 640);

      updateSpy();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  setActive(sections.length ? sections[0].id : null);

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  var printBtn = $('#printBtn');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  /* ------------------------------------------------------------ counters */

  function formatNumber(value, comma) {
    return comma ? value.toLocaleString('en-US') : String(value);
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var comma = el.getAttribute('data-format') === 'comma';
    if (isNaN(target)) return;

    if (reduceMotion) {
      el.textContent = formatNumber(target, comma);
      return;
    }

    var start = null;
    var duration = 1300;

    function frame(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatNumber(Math.round(target * eased), comma);
      if (progress < 1) window.requestAnimationFrame(frame);
    }

    window.requestAnimationFrame(frame);
  }

  var stats = $('.stats');
  var counters = $$('[data-count]');

  if (stats && counters.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          counters.forEach(animateCounter);
          counterObserver.disconnect();
        });
      }, { threshold: 0.35 });
      counterObserver.observe(stats);
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* Printing must never capture a number mid-animation. */
  window.addEventListener('beforeprint', function () {
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      if (!isNaN(target)) {
        el.textContent = formatNumber(target, el.getAttribute('data-format') === 'comma');
      }
    });
  });

  /* -------------------------------------------------------- publications */

  var tabs = $$('.tab');
  var panels = $$('.pub-panel');
  var searchInput = $('#pubSearch');
  var searchWrap = $('#searchWrap');
  var searchClear = $('#searchClear');
  var yearFilter = $('#yearFilter');
  var firstOnly = $('#firstOnly');
  var firstWrap = $('#firstToggleWrap');
  var countEl = $('#pubCount');
  var resetBtn = $('#resetFilters');
  var activeTab = 'journal';

  var labels = {
    journal: 'journal articles',
    review: 'preprints under review',
    books: 'book contributions',
    conference: 'conference papers',
    talks: 'oral presentations'
  };

  function panelFor(name) {
    return panels.filter(function (p) { return p.getAttribute('data-panel') === name; })[0] || null;
  }

  function itemsFor(panel) {
    return $$('.pub, .talk', panel);
  }

  function populateYears(panel) {
    if (!yearFilter) return;
    var years = [];
    itemsFor(panel).forEach(function (item) {
      var year = item.getAttribute('data-year');
      if (year && years.indexOf(year) === -1) years.push(year);
    });
    years.sort(function (a, b) { return Number(b) - Number(a); });

    yearFilter.innerHTML = '<option value="">All years</option>';
    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    });

    yearFilter.value = '';
    yearFilter.hidden = years.length < 2;
  }

  function applyFilters() {
    var panel = panelFor(activeTab);
    if (!panel || !searchInput) return;

    var query = normalize(searchInput.value.trim());
    var year = yearFilter ? yearFilter.value : '';
    var first = firstOnly ? firstOnly.checked : false;
    var items = itemsFor(panel);
    var shown = 0;

    items.forEach(function (item) {
      var ok = true;

      if (query && normalize(item.textContent).indexOf(query) === -1) ok = false;
      if (ok && year && item.getAttribute('data-year') !== year) ok = false;
      if (ok && first && item.getAttribute('data-first') !== '1') ok = false;

      item.classList.toggle('is-hidden', !ok);
      if (ok) shown += 1;
    });

    if (activeTab === 'talks') {
      $$('.talk-year', panel).forEach(function (group) {
        var visible = $$('.talk', group).some(function (talk) {
          return !talk.classList.contains('is-hidden');
        });
        group.classList.toggle('is-empty', !visible);
      });
    }

    var empty = $('[data-empty]', panel);
    if (empty) empty.classList.toggle('is-visible', shown === 0);

    if (countEl) {
      countEl.textContent = 'Showing ' + shown + ' of ' + items.length + ' · ' + labels[activeTab];
    }
  }

  function activateTab(name, focusTab) {
    activeTab = name;

    tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-tab') === name;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focusTab) tab.focus();
    });

    panels.forEach(function (panel) {
      var on = panel.getAttribute('data-panel') === name;
      panel.classList.toggle('is-active', on);
    });

    var panel = panelFor(name);
    if (!panel) return;

    if (searchInput) {
      searchInput.value = '';
      if (searchWrap) searchWrap.classList.remove('has-value');
    }
    if (firstOnly) firstOnly.checked = false;

    if (firstWrap) firstWrap.hidden = !panel.querySelector('[data-first]');

    populateYears(panel);
    applyFilters();
  }

  if (tabs.length && panels.length) {
    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        activateTab(tab.getAttribute('data-tab'), false);
      });

      tab.addEventListener('keydown', function (event) {
        var next = null;

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;

        if (next === null) return;
        event.preventDefault();
        activateTab(tabs[next].getAttribute('data-tab'), true);
      });
    });

    activateTab(activeTab, false);
  }

  var debounceTimer = null;

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      if (searchWrap) searchWrap.classList.toggle('has-value', searchInput.value.length > 0);
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(applyFilters, 120);
    });

    searchInput.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        searchInput.value = '';
        if (searchWrap) searchWrap.classList.remove('has-value');
        applyFilters();
      }
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', function () {
      if (!searchInput) return;
      searchInput.value = '';
      if (searchWrap) searchWrap.classList.remove('has-value');
      searchInput.focus();
      applyFilters();
    });
  }

  if (yearFilter) yearFilter.addEventListener('change', applyFilters);
  if (firstOnly) firstOnly.addEventListener('change', applyFilters);

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (searchInput) searchInput.value = '';
      if (searchWrap) searchWrap.classList.remove('has-value');
      if (yearFilter) yearFilter.value = '';
      if (firstOnly) firstOnly.checked = false;
      applyFilters();
    });
  }

  /* --------------------------------------------------------- copy email */

  var copyEmailBtn = $('#copyEmail');

  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', function () {
      var email = copyEmailBtn.getAttribute('data-email') || 'hli@sdu.dk';

      function done(success) {
        showToast(success ? 'Email address copied: ' + email : 'Could not copy — email is ' + email);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(function () { done(true); }, function () {
          done(fallbackCopy(email));
        });
      } else {
        done(fallbackCopy(email));
      }
    });
  }

  /* --------------------------------------------------- small utilities */

  $$('a[href^="#"]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && href.length > 1 && href !== '#top' && document.getElementById(href.slice(1))) {
      link.addEventListener('click', function () { setMenu(false); });
    }
  });

  /* Keep the current section highlighted after the page is restored from bfcache. */
  window.addEventListener('pageshow', function () {
    onScroll();
  });
})();
