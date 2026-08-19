(function () {
  'use strict';
  var documentRef = document;
  var windowRef = window;
  var root = documentRef.documentElement;
  var cleanups = [];
  function listen(target, type, handler, options) { target.addEventListener(type, handler, options); cleanups.push(function () { target.removeEventListener(type, handler, options); }); }
  function destroy() { cleanups.splice(0).forEach(function (cleanup) { cleanup(); }); root.classList.remove('nav-ready', 'nav-open', 'reveal-ready'); }

  var toggle = documentRef.querySelector('[data-nav-toggle]');
  var panel = documentRef.querySelector('[data-nav-panel]');
  if (toggle && panel) {
    function closeNavigation(restoreFocus) { root.classList.remove('nav-open'); toggle.setAttribute('aria-expanded', 'false'); if (restoreFocus) toggle.focus(); }
    function openNavigation() { root.classList.add('nav-open'); toggle.setAttribute('aria-expanded', 'true'); }
    listen(toggle, 'click', function () { if (toggle.getAttribute('aria-expanded') === 'true') closeNavigation(false); else openNavigation(); });
    listen(documentRef, 'keydown', function (event) { if (event.key === 'Escape' && root.classList.contains('nav-open')) { event.preventDefault(); closeNavigation(true); } });
    Array.prototype.forEach.call(panel.querySelectorAll('a[href^="#"]'), function (link) { listen(link, 'click', function () { closeNavigation(false); }); });
    root.classList.add('nav-ready');
  }

  var navigationLinks = Array.prototype.slice.call(documentRef.querySelectorAll('[data-nav-panel] a[href^="#"]'));
  if (navigationLinks.length) {
    var sections = navigationLinks.map(function (link) { return documentRef.querySelector(link.getAttribute('href')); }).filter(Boolean);
    function setCurrent(section) {
      navigationLinks.forEach(function (link) {
        if (link.getAttribute('href') === '#' + section.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    if (typeof windowRef.IntersectionObserver === 'function') {
      setCurrent(sections[0]);
      var activeObserver = new windowRef.IntersectionObserver(function (entries) {
        var visibleSections = entries.filter(function (entry) { return entry.isIntersecting; }).sort(function (left, right) { return left.boundingClientRect.top - right.boundingClientRect.top; });
        if (visibleSections.length) setCurrent(visibleSections[0].target);
      }, { rootMargin: '-25% 0px -60% 0px', threshold: .01 });
      sections.forEach(function (section) { activeObserver.observe(section); });
      cleanups.push(function () { activeObserver.disconnect(); });
    } else setCurrent(sections[0]);
  }

  var reveals = Array.prototype.slice.call(documentRef.querySelectorAll('[data-reveal]'));
  if (reveals.length) {
    var revealAll = function () { reveals.forEach(function (element) { element.classList.add('is-visible'); }); };
    var revealObserver = null;
    if (windowRef.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof windowRef.IntersectionObserver !== 'function') revealAll();
    else {
      revealObserver = new windowRef.IntersectionObserver(function (entries) { entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); } }); }, { threshold: .08 });
      reveals.forEach(function (element) { revealObserver.observe(element); });
      cleanups.push(function () { revealObserver.disconnect(); });
    }
    var revealTimeout = windowRef.setTimeout(revealAll, 1900);
    cleanups.push(function () { windowRef.clearTimeout(revealTimeout); });
    root.classList.add('reveal-ready');
  }

  Array.prototype.forEach.call(documentRef.querySelectorAll('a[target="_blank"]'), function (link) { link.rel = 'noopener noreferrer'; });
  var dormant = documentRef.querySelector('[data-dormant-cta]');
  var status = documentRef.querySelector('[data-play-status]');
  if (dormant && status) {
    function showDormant(event) { event.preventDefault(); status.hidden = false; status.textContent = 'Disponível em breve na Play.'; }
    listen(dormant, 'click', showDormant);
    listen(dormant, 'keydown', function (event) { if (event.key === 'Enter' || event.key === ' ') showDormant(event); });
  }

  if (windowRef.JoberCircuit && typeof windowRef.JoberCircuit.mount === 'function') { var circuit = windowRef.JoberCircuit.mount(); cleanups.push(function () { circuit.destroy(); }); }
  if (windowRef.JoberSonar && typeof windowRef.JoberSonar.mount === 'function' && windowRef.innerWidth > 900) {
    Array.prototype.forEach.call(documentRef.querySelectorAll('[data-sonar-field]'), function (field) { var sonar = windowRef.JoberSonar.mount(field); cleanups.push(function () { sonar.destroy(); }); });
  }
  windowRef.JoberPersonalLanding = { destroy: destroy };
}());
