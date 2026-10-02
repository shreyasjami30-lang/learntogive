/* =====================================================================
   MAIN SCRIPT
   ---------------------------------------------------------------------
   - Language toggle (English / Telugu) using data-i18n attributes
   - Fills values from js/site-config.js (data-config, data-mailto, ...)
   - Renders founders, classes, stats, social links and testimonials
   - Mobile menu, class filters, FAQ accordion, donate dialog
   - Form validation and Formspree submission
   Classic script on purpose: no modules, no fetch() of local files, so
   the site works when opened straight from disk.
   ===================================================================== */

(function () {
  'use strict';

  var C = window.SITE_CONFIG || {};
  var T = window.TRANSLATIONS || { en: {}, te: {} };
  var STORAGE_KEY = 'ltg-language';
  var LANGS = ['en', 'te'];

  var state = { lang: 'en', classFilter: 'all' };
  var englishDefaults = new WeakMap(); // original English text written in the HTML
  var attrDefaults = new WeakMap();

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
  }

  function getPath(obj, path) {
    return path.split('.').reduce(function (acc, part) {
      return acc == null ? undefined : acc[part];
    }, obj);
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function interpolate(str, vars) {
    return String(str).replace(/\{(\w+)\}/g, function (match, name) {
      return Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : match;
    });
  }

  function hasValue(value) {
    if (value == null || value === '' || value === false) return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  /* Text values that live in site-config.js but are used like translations. */
  function configStrings() {
    return {
      orgName: C.orgName,
      tagline: C.tagline,
      mission: C.mission
    };
  }

  /* Looks up a key in the current language.
     Returns { text, isFallback } or null when the key is unknown. */
  function lookup(key) {
    var te = T.te || {};
    var en = T.en || {};
    if (state.lang === 'te' && Object.prototype.hasOwnProperty.call(te, key)) {
      return { text: te[key], isFallback: false };
    }
    if (Object.prototype.hasOwnProperty.call(en, key)) {
      return { text: en[key], isFallback: state.lang === 'te' };
    }
    return null;
  }

  function t(key, extraVars) {
    var found = lookup(key);
    var text = found ? found.text : key;
    return interpolate(text, Object.assign({}, vars(), extraVars || {}));
  }

  /* Translate a value that comes from site-config.js, e.g. tr('topic', 'Fractions').
     Falls back to the English value when no Telugu entry exists. */
  function tr(prefix, englishValue) {
    if (state.lang === 'te' && T.te) {
      var hit = T.te[prefix + ':' + englishValue];
      if (hit) return hit;
    }
    if (T.en && T.en[prefix + ':' + englishValue]) return T.en[prefix + ':' + englishValue];
    return englishValue;
  }

  function trIsFallback(prefix, englishValue) {
    return state.lang === 'te' && !(T.te && T.te[prefix + ':' + englishValue]);
  }

  function monthYear(value) {
    if (!value) return '';
    var parts = String(value).split(' ');
    if (parts.length === 2) return tr('month', parts[0]) + ' ' + parts[1];
    return value;
  }

  function formatINR(amount) {
    if (typeof amount !== 'number') return String(amount);
    return '₹' + amount.toLocaleString('en-IN');
  }

  function ordinal(n) {
    var s = ['th', 'st', 'nd', 'rd'];
    var v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function citiesText() {
    var cities = (C.stats && C.stats.cities) || [];
    var names = cities.map(function (c) { return tr('city', c); });
    var and = state.lang === 'te' ? ' మరియు ' : ' and ';
    if (names.length <= 1) return names.join('');
    return names.slice(0, -1).join(', ') + and + names[names.length - 1];
  }

  /* Variables available to every {placeholder} in translations.js */
  function vars() {
    var d = C.donations || {};
    var s = C.stats || {};
    var sadhana = C.sadhana || {};
    return {
      orgName: C.orgName || '',
      sadhanaName: sadhana.name || '',
      email: C.contactEmail || '',
      studentsTaught: s.studentsTaught,
      volunteerTutors: s.volunteerTutors,
      classTypes: s.classTypes,
      startedMonthYear: monthYear(s.startedMonthYear),
      asOf: monthYear(d.asOf),
      lastUpdated: monthYear(d.lastUpdated)
    };
  }

  /* Formatted config values for data-config="path" elements. */
  function configValue(path) {
    var d = C.donations || {};
    switch (path) {
      case 'donations.transferredToSadhanaINR': return formatINR(d.transferredToSadhanaINR);
      case 'donations.totalReceived': return d.totalReceived == null ? '' : formatINR(d.totalReceived);
      case 'donations.asOf': return monthYear(d.asOf);
      case 'donations.lastUpdated': return monthYear(d.lastUpdated);
      case 'stats.startedMonthYear': return monthYear(C.stats && C.stats.startedMonthYear);
      case 'stats.cities': return citiesText();
    }
    if (state.lang === 'te' && T.te && T.te['config:' + path]) return T.te['config:' + path];
    var value = getPath(C, path);
    return value == null ? '' : String(value);
  }

  /* ------------------------------------------------------------------
     Applying language and config values to the page
     ------------------------------------------------------------------ */
  function applyText(root) {
    var v = vars();

    $all('[data-i18n]', root).forEach(function (el) {
      if (!englishDefaults.has(el)) englishDefaults.set(el, el.textContent);
      var key = el.getAttribute('data-i18n');
      var found = lookup(key);
      var text = found ? found.text : englishDefaults.get(el);
      if (!found && configStrings()[key] != null) text = configStrings()[key];
      el.textContent = interpolate(text, v);
      if (found && found.isFallback) {
        el.setAttribute('lang', 'en');
      } else if (el.getAttribute('data-i18n-lang') == null) {
        el.removeAttribute('lang');
      }
    });

    $all('[data-i18n-attr]', root).forEach(function (el) {
      var pairs = el.getAttribute('data-i18n-attr').split(';');
      if (!attrDefaults.has(el)) attrDefaults.set(el, {});
      var saved = attrDefaults.get(el);
      pairs.forEach(function (pair) {
        var bits = pair.split(':');
        var attr = bits[0].trim();
        var key = bits.slice(1).join(':').trim();
        if (!attr || !key) return;
        if (!(attr in saved)) saved[attr] = el.getAttribute(attr);
        var found = lookup(key);
        el.setAttribute(attr, interpolate(found ? found.text : saved[attr] || '', v));
      });
    });

    $all('[data-config]', root).forEach(function (el) {
      var path = el.getAttribute('data-config');
      var text = configValue(path);
      el.textContent = text;
      var translatable = path === 'tagline' || path === 'mission' || path === 'sadhana.description';
      if (state.lang === 'te' && translatable && !(T.te && T.te['config:' + path])) {
        el.setAttribute('lang', 'en');
      }
      if (state.lang === 'te' && translatable && T.te && T.te['config:' + path]) {
        el.removeAttribute('lang');
      }
    });

    $all('[data-config-href]', root).forEach(function (el) {
      var url = getPath(C, el.getAttribute('data-config-href'));
      if (url) el.setAttribute('href', url);
    });

    $all('[data-config-src]', root).forEach(function (el) {
      var src = getPath(C, el.getAttribute('data-config-src'));
      if (src) el.setAttribute('src', src);
    });

    $all('[data-mailto]', root).forEach(function (el) {
      if (!C.contactEmail) return;
      el.setAttribute('href', 'mailto:' + C.contactEmail);
      if (!el.hasAttribute('data-i18n')) el.textContent = C.contactEmail;
    });

    applyVisibility(root);
  }

  function applyVisibility(root) {
    $all('[data-show-if]', root).forEach(function (el) {
      el.hidden = !hasValue(getPath(C, el.getAttribute('data-show-if')));
    });
    $all('[data-show-lang]', root).forEach(function (el) {
      var show = el.getAttribute('data-show-lang') === state.lang;
      var flag = el.getAttribute('data-flag');
      if (flag) show = show && !!(C.flags && C.flags[flag]);
      el.hidden = !show;
    });
    $all('[data-flag]:not([data-show-lang])', root).forEach(function (el) {
      el.hidden = !(C.flags && C.flags[el.getAttribute('data-flag')]);
    });
  }

  function setLanguage(lang, persist) {
    if (LANGS.indexOf(lang) === -1) lang = 'en';
    state.lang = lang;
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.classList.toggle('lang-te', lang === 'te');
    if (persist) storageSet(STORAGE_KEY, lang);

    $all('.lang-btn').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang') === lang));
    });

    renderAll();
    applyText(document);
    retranslateFormMessages();
  }

  /* ------------------------------------------------------------------
     Renderers (re-run on every language change)
     ------------------------------------------------------------------ */
  var renderers = {
    stats: function (el) {
      var s = C.stats || {};
      var items = [
        { value: s.studentsTaught, key: 'stat.students' },
        { value: s.volunteerTutors, key: 'stat.tutors' },
        { value: s.classTypes, key: 'stat.classes' },
        { value: citiesText(), key: 'stat.cities', small: true },
        { value: monthYear(s.startedMonthYear), key: 'stat.since', small: true }
      ];
      el.innerHTML = items.filter(function (item) { return hasValue(item.value); }).map(function (item) {
        return '<li class="stat' + (item.small ? ' stat--text' : '') + '">' +
          '<span class="stat-value">' + escapeHTML(item.value) + '</span>' +
          '<span class="stat-label">' + escapeHTML(t(item.key)) + '</span>' +
          '</li>';
      }).join('');
    },

    founders: function (el) {
      var founders = C.founders || [];
      el.innerHTML = founders.map(function (f) {
        var roleFallback = trIsFallback('role', f.role) ? ' lang="en"' : '';
        var grade = state.lang === 'te' ? f.grade : ordinal(f.grade);
        return '<li class="founder-card card">' +
          '<img class="founder-photo" src="' + escapeHTML(f.photo) + '" alt="' +
            escapeHTML(t('about.founderPhotoAlt', { name: f.name })) + '" width="160" height="160" loading="lazy" decoding="async">' +
          '<h3 class="founder-name" lang="en">' + escapeHTML(f.name) + '</h3>' +
          '<p class="founder-role"' + roleFallback + '>' + escapeHTML(tr('role', f.role)) + '</p>' +
          '<p class="founder-school">' + escapeHTML(t('about.founderGrade', { gradeOrdinal: grade, grade: f.grade, school: f.school })) + '</p>' +
          '<p class="founder-bio" lang="en">' + escapeHTML(f.bio) + '</p>' +
          '</li>';
      }).join('');
    },

    classes: function (el) {
      var classes = C.classes || [];
      var icons = (C.images && C.images.classIcons) || {};
      el.innerHTML = classes.map(function (cls) {
        var name = t(cls.nameKey);
        var headingId = 'class-' + cls.id + '-title';
        var topics = (cls.topics || []).map(function (topic) {
          var lang = trIsFallback('topic', topic) ? ' lang="en"' : '';
          return '<li' + lang + '>' + escapeHTML(tr('topic', topic)) + '</li>';
        }).join('');
        var versions = (cls.versions || []).map(function (v) {
          return '<li class="version" data-language="' + escapeHTML(v.language) + '">' +
            '<span class="version-lang">' + escapeHTML(t('classes.versionLabel', { language: tr('lang', v.language) })) + '</span>' +
            '<span class="version-day">' + escapeHTML(tr('day', v.day)) + '</span>' +
            '<span class="version-time"><span lang="en">' + escapeHTML(v.timeIST) + '</span> ' +
              '<abbr class="ist-badge" title="' + escapeHTML(t('common.istFull')) + '">' + escapeHTML(t('common.ist')) + '</abbr></span>' +
            '</li>';
        }).join('');
        var action = cls.signupOpen
          ? '<a class="btn btn-primary btn-block" href="join.html?class=' + encodeURIComponent(cls.id) + '" aria-label="' +
              escapeHTML(t('classes.signUpAria', { name: name })) + '">' + escapeHTML(t('classes.signUp')) + '</a>'
          : '<p class="class-closed">' + escapeHTML(t('classes.closed')) + '</p>';
        var icon = icons[cls.id]
          ? '<img class="class-icon" src="' + escapeHTML(icons[cls.id]) + '" alt="" width="56" height="56" loading="lazy" decoding="async">'
          : '';
        return '<li class="class-card card" id="class-' + escapeHTML(cls.id) + '">' +
          '<article aria-labelledby="' + headingId + '">' +
            '<div class="class-card-head">' + icon +
              '<div><h3 id="' + headingId + '" class="class-name">' + escapeHTML(name) + '</h3>' +
              '<p class="class-for">' + escapeHTML(t(cls.gradeKey)) + '</p></div>' +
              '<span class="badge badge-free">' + escapeHTML(t('classes.free')) + '</span>' +
            '</div>' +
            '<p class="class-duration">' + escapeHTML(durationText(cls.durationMinutes)) + '</p>' +
            '<h4 class="class-subhead">' + escapeHTML(t('classes.topics')) + '</h4>' +
            '<ul class="topic-list">' + topics + '</ul>' +
            '<h4 class="class-subhead">' + escapeHTML(t('classes.times')) + '</h4>' +
            '<ul class="version-list">' + versions + '</ul>' +
            action +
          '</article>' +
          '</li>';
      }).join('');
      applyClassFilter();
    },

    'class-list': function (el) {
      el.innerHTML = (C.classes || []).map(function (cls) {
        return '<li>' + escapeHTML(t(cls.nameKey)) + '</li>';
      }).join('');
    },

    'class-options': function (select) {
      var previous = select.value;
      var placeholder = '<option value="">' + escapeHTML(t('form.choose')) + '</option>';
      select.innerHTML = placeholder + (C.classes || []).map(function (cls) {
        var english = (T.en && T.en[cls.nameKey]) || cls.id;
        var disabled = cls.signupOpen ? '' : ' disabled';
        return '<option value="' + escapeHTML(english) + '" data-class-id="' + escapeHTML(cls.id) + '"' + disabled + '>' +
          escapeHTML(t(cls.nameKey)) + '</option>';
      }).join('');
      if (previous) select.value = previous;
    },

    social: function (el) {
      el.innerHTML = (C.socialLinks || []).map(function (link) {
        return '<li><a href="' + escapeHTML(link.url) + '" target="_blank" rel="noopener">' + escapeHTML(link.label) +
          '<span class="visually-hidden"> ' + escapeHTML(t('common.newTab')) + '</span></a></li>';
      }).join('');
    },

    testimonials: function (el) {
      var list = C.testimonials || [];
      if (!(C.flags && C.flags.showTestimonials) || !list.length) {
        el.innerHTML = '';
        return;
      }
      el.innerHTML = '<section class="section" aria-labelledby="testimonials-title"><div class="container">' +
        '<h2 id="testimonials-title">' + escapeHTML(t('impact.testimonialsTitle')) + '</h2>' +
        '<ul class="testimonial-grid">' + list.map(function (item) {
          return '<li class="card testimonial"><blockquote><p>' + escapeHTML(item.quote) + '</p></blockquote>' +
            '<p class="testimonial-name">' + escapeHTML(item.name) + (item.role ? ', ' + escapeHTML(item.role) : '') + '</p></li>';
        }).join('') + '</ul></div></section>';
    }
  };

  function durationText(minutes) {
    if (!minutes) return '';
    if (minutes % 60 === 0) {
      var hours = minutes / 60;
      return t(hours === 1 ? 'classes.hoursPerWeek' : 'classes.hoursPerWeekPlural', { n: hours });
    }
    return t('classes.minutesPerWeek', { n: minutes });
  }

  function renderAll() {
    $all('[data-render]').forEach(function (el) {
      var fn = renderers[el.getAttribute('data-render')];
      if (fn) fn(el);
    });
  }

  /* ------------------------------------------------------------------
     Head tags: canonical and Open Graph URLs from siteUrl
     ------------------------------------------------------------------ */
  function updateHeadUrls() {
    if (!C.siteUrl) return;
    var base = C.siteUrl.replace(/\/+$/, '');
    var file = window.location.pathname.split('/').pop() || 'index.html';
    var pageUrl = base + '/' + (file === 'index.html' ? '' : file);
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', pageUrl);
    var ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', pageUrl);
    if (C.images && C.images.ogImage) {
      $all('meta[property="og:image"], meta[name="twitter:image"]').forEach(function (m) {
        m.setAttribute('content', base + '/' + C.images.ogImage);
      });
    }
  }

  /* ------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    var desktop = window.matchMedia('(min-width: 75em)');
    var onChange = function () { if (desktop.matches) setOpen(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
  }

  function initLanguageToggle() {
    $all('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLanguage(btn.getAttribute('data-lang'), true);
      });
    });
  }

  /* ------------------------------------------------------------------
     Class filters (All / Telugu / English)
     ------------------------------------------------------------------ */
  function applyClassFilter() {
    $all('.version[data-language]').forEach(function (row) {
      var lang = row.getAttribute('data-language');
      row.hidden = !(state.classFilter === 'all' || state.classFilter === lang);
    });
    $all('.filter-btn').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-filter') === state.classFilter));
    });
  }

  function initClassFilters() {
    $all('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.classFilter = btn.getAttribute('data-filter');
        applyClassFilter();
      });
    });
  }

  /* ------------------------------------------------------------------
     FAQ accordion. Panels are open in the HTML so they work without JS.
     ------------------------------------------------------------------ */
  function initAccordions() {
    $all('.accordion-trigger').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      btn.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        panel.hidden = open;
      });
    });
  }

  /* ------------------------------------------------------------------
     Donate dialog. Without JS (or <dialog> support) the trigger is a
     normal link to the Contact page with "Donate" preselected.
     ------------------------------------------------------------------ */
  function initDialogs() {
    $all('[data-open-dialog]').forEach(function (trigger) {
      var dialog = document.getElementById(trigger.getAttribute('data-open-dialog'));
      if (!dialog || typeof dialog.showModal !== 'function') return;

      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        dialog.showModal();
        var first = dialog.querySelector('input:not([type="hidden"]):not([name="_gotcha"]), textarea, select');
        if (first && !first.closest('[hidden]')) first.focus();
      });

      // Return focus to the trigger, unless the user has already moved it elsewhere.
      dialog.addEventListener('close', function () {
        var active = document.activeElement;
        if (!active || active === document.body || dialog.contains(active)) trigger.focus();
      });

      dialog.addEventListener('click', function (event) {
        if (event.target === dialog) dialog.close();
      });

      $all('[data-close-dialog]', dialog).forEach(function (btn) {
        btn.addEventListener('click', function () { dialog.close(); });
      });
    });
  }

  /* ------------------------------------------------------------------
     URL parameter preselects (?class= on Join, ?reason= on Contact)
     ------------------------------------------------------------------ */
  function getParam(name) {
    var match = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search);
    return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
  }

  function preselectFromUrl() {
    var classId = getParam('class');
    var classSelect = document.querySelector('[data-render="class-options"]');
    if (classId && classSelect) {
      $all('option', classSelect).forEach(function (opt) {
        if (opt.getAttribute('data-class-id') === classId && !opt.disabled) classSelect.value = opt.value;
      });
    }
    var reason = getParam('reason');
    var reasonSelect = document.querySelector('select[data-preselect="reason"]');
    if (reason && reasonSelect) {
      $all('option', reasonSelect).forEach(function (opt) {
        if (opt.getAttribute('data-reason') === reason) reasonSelect.value = opt.value;
      });
    }
  }

  /* ------------------------------------------------------------------
     Forms
     ------------------------------------------------------------------ */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function errorElFor(target) {
    return document.getElementById(target.id + '-error');
  }

  function setError(target, key) {
    var errorEl = errorElFor(target);
    var controls = target.tagName === 'FIELDSET' ? $all('input', target) : [target];
    controls.forEach(function (c) {
      if (key) c.setAttribute('aria-invalid', 'true');
      else c.removeAttribute('aria-invalid');
    });
    target.classList.toggle('has-error', !!key);
    if (!errorEl) return;
    if (key) {
      errorEl.setAttribute('data-error-key', key);
      errorEl.textContent = t(key);
      errorEl.hidden = false;
    } else {
      errorEl.removeAttribute('data-error-key');
      errorEl.textContent = '';
      errorEl.hidden = true;
    }
  }

  function retranslateFormMessages() {
    $all('[data-error-key]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-error-key'));
    });
  }

  function validateTarget(target) {
    if (target.tagName === 'FIELDSET') {
      var inputs = $all('input', target);
      var anyChecked = inputs.some(function (i) { return i.checked; });
      if (!anyChecked) return target.getAttribute('data-required-group') === 'checkbox' ? 'form.error.chooseOne' : 'form.error.choose';
      return null;
    }
    if (target.type === 'checkbox') {
      return target.required && !target.checked ? 'form.error.consent' : null;
    }
    var value = (target.value || '').trim();
    if (target.required && !value) {
      return target.tagName === 'SELECT' ? 'form.error.choose' : 'form.error.required';
    }
    if (value && target.type === 'email' && !EMAIL_RE.test(value)) return 'form.error.email';
    if (value && target.getAttribute('data-validate') === 'phone') {
      var digits = value.replace(/\D/g, '');
      if (!/^[+\d\s()\-.]+$/.test(value) || digits.length < 7 || digits.length > 15) return 'form.error.phone';
    }
    return null;
  }

  function validationTargets(form) {
    var targets = $all('fieldset[data-required-group]', form);
    $all('input, select, textarea', form).forEach(function (el) {
      if (el.type === 'hidden' || el.name === '_gotcha') return;
      if (el.type === 'radio' || (el.type === 'checkbox' && el.closest('fieldset[data-required-group]'))) return;
      if (el.required || el.type === 'email' || el.getAttribute('data-validate')) targets.push(el);
    });
    // Keep document order so focus goes to the first problem.
    return targets.sort(function (a, b) {
      return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
  }

  function validateForm(form) {
    var firstInvalid = null;
    validationTargets(form).forEach(function (target) {
      var key = validateTarget(target);
      setError(target, key);
      if (key && !firstInvalid) firstInvalid = target;
    });
    if (firstInvalid) {
      var focusable = firstInvalid.tagName === 'FIELDSET' ? firstInvalid.querySelector('input') : firstInvalid;
      if (focusable) focusable.focus();
      return false;
    }
    return true;
  }

  function formToObject(form) {
    var data = {};
    new FormData(form).forEach(function (value, key) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        data[key] = data[key] + ', ' + value;
      } else {
        data[key] = value;
      }
    });
    return data;
  }

  function setBusy(form, busy) {
    var btn = form.querySelector('[type="submit"]');
    if (!btn) return;
    var label = btn.querySelector('.btn-label') || btn;
    if (busy) {
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.classList.add('is-loading');
      label.setAttribute('data-label-key', label.getAttribute('data-i18n') || '');
      label.removeAttribute('data-i18n');
      label.textContent = t('form.sending');
    } else {
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      btn.classList.remove('is-loading');
      var key = label.getAttribute('data-label-key');
      if (key) {
        label.setAttribute('data-i18n', key);
        label.textContent = t(key);
      }
    }
  }

  function showSuccess(form) {
    var success = document.getElementById(form.getAttribute('data-success'));
    form.hidden = true;
    if (success) {
      success.hidden = false;
      success.focus();
    }
  }

  function showFailure(form, show) {
    var failure = form.querySelector('.form-failure');
    if (!failure) return;
    failure.hidden = !show;
  }

  function initForms() {
    $all('form[data-form]').forEach(function (form) {
      if (C.forms && C.forms.endpoint) form.setAttribute('action', C.forms.endpoint);
      form.setAttribute('novalidate', '');

      // Re-check a field once it has been marked invalid.
      form.addEventListener('input', function (event) { recheck(event.target); });
      form.addEventListener('change', function (event) { recheck(event.target); });

      function recheck(el) {
        var target = el.closest('fieldset[data-required-group]') || el;
        if (target.classList.contains('has-error') || target.getAttribute('aria-invalid') === 'true') {
          setError(target, validateTarget(target));
        }
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        showFailure(form, false);
        if (!validateForm(form)) return;

        // Honeypot: bots fill hidden fields. Quietly pretend it worked.
        var honeypot = form.querySelector('[name="_gotcha"]');
        if (honeypot && honeypot.value) {
          showSuccess(form);
          return;
        }

        setBusy(form, true);
        fetch(form.getAttribute('action'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(formToObject(form))
        }).then(function (response) {
          if (!response.ok) throw new Error('Request failed with status ' + response.status);
          setBusy(form, false);
          form.reset();
          showSuccess(form);
        }).catch(function () {
          setBusy(form, false);
          showFailure(form, true);
          var failure = form.querySelector('.form-failure');
          if (failure) failure.focus();
        });
      });
    });
  }

  /* ------------------------------------------------------------------
     Start
     ------------------------------------------------------------------ */
  function init() {
    document.documentElement.classList.add('js');
    var saved = storageGet(STORAGE_KEY);
    updateHeadUrls();
    initLanguageToggle();
    initNav();
    initClassFilters();
    initAccordions();
    initDialogs();
    initForms();
    setLanguage(LANGS.indexOf(saved) !== -1 ? saved : 'en', false);
    preselectFromUrl();
  }

  // Exposed for debugging and for the README's examples.
  window.LTG = { setLanguage: function (lang) { setLanguage(lang, true); }, t: t };

  init();
})();
