/* =====================================================================
   MAIN SCRIPT
   ---------------------------------------------------------------------
   - Language toggle (English / Telugu) using data-i18n attributes
   - Fills values from js/site-config.js (data-config, data-mailto, ...)
   - Renders founders, classes, the weekly schedule, stats, social links,
     gallery, curriculum samples, testimonials and the feedback button
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

  /* A link from the config counts as real only when it starts with https://.
     Placeholders such as "[GOOGLE FORM URL]" never become live links. */
  function isRealUrl(value) {
    return typeof value === 'string' && /^https:\/\/\S+$/.test(value.trim());
  }

  /* Where a class's "Sign Up" button goes: the class's own form, then the
     shared Google Form, then contact.html while both are still placeholders. */
  function signupLink(cls) {
    var url = cls && isRealUrl(cls.signupUrl) ? cls.signupUrl : C.signupFormUrl;
    if (isRealUrl(url)) return { href: url.trim(), external: true };
    return { href: 'contact.html?reason=join', external: false };
  }

  /* Attributes and hidden note for a link that opens in a new tab. */
  function externalAttrs(external) {
    return external ? ' target="_blank" rel="noopener"' : '';
  }
  function newTabNote(external) {
    return external ? '<span class="visually-hidden"> ' + escapeHTML(t('common.newTab')) + '</span>' : '';
  }

  /* First word only, so testimonials never show a full name. */
  function firstName(name) {
    return String(name || '').trim().split(/\s+/)[0] || '';
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
    // With Discord turned off, a "<key>.noDiscord" variant replaces the text.
    if (!(C.discord && C.discord.enabled) && Object.prototype.hasOwnProperty.call(en, key + '.noDiscord')) {
      key = key + '.noDiscord';
    }
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
      lastUpdated: monthYear(d.lastUpdated),
      yearStart: tr('month', (C.schoolYear && C.schoolYear.start) || ''),
      yearEnd: tr('month', (C.schoolYear && C.schoolYear.end) || '')
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

  /* Config text that has a "config:<path>" Telugu entry in translations.js. */
  var TRANSLATABLE_CONFIG = ['tagline', 'mission', 'sadhana.description', 'fundraiseHowItWorks.text'];

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
      var translatable = TRANSLATABLE_CONFIG.indexOf(path) !== -1;
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
    $all('[data-hide-if]', root).forEach(function (el) {
      el.hidden = hasValue(getPath(C, el.getAttribute('data-hide-if')));
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
        { value: monthYear(s.startedMonthYear), key: 'stat.since', small: true },
        // Last, so on two-column phones it takes the full row (long city lists stay whole words).
        { value: citiesText(), key: 'stat.cities', small: true }
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
        // No photo: an initials circle instead of a broken image (break-ui).
        var photo = f.photo
          ? '<img class="founder-photo" src="' + escapeHTML(f.photo) + '" alt="' +
              escapeHTML(t('about.founderPhotoAlt', { name: f.name })) + '" width="160" height="160" loading="lazy" decoding="async"' +
              ' data-initials="' + escapeHTML(initials(f.name)) + '">'
          : initialsAvatar(f.name);
        return '<li class="founder-card card">' + photo +
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
        var name = className(cls);
        var headingId = 'class-' + cls.id + '-title';
        var topics = (cls.topics || []).map(function (topic) {
          var lang = trIsFallback('topic', topic) ? ' lang="en"' : '';
          return '<li' + lang + '>' + escapeHTML(tr('topic', topic)) + '</li>';
        }).join('');
        var versions = (cls.versions || []).map(function (v) {
          return '<li class="version" data-language="' + escapeHTML(v.language) + '">' +
            '<span class="version-lang">' + escapeHTML(t('classes.versionLabel', { language: tr('lang', v.language) })) + '</span>' +
            '<span class="version-day">' + dayHTML(v.day) + '</span>' +
            '<span class="version-time"><span lang="en">' + escapeHTML(timeText(v.timeIST)) + '</span> ' +
              '<abbr class="ist-badge" title="' + escapeHTML(t('common.istFull')) + '">' + escapeHTML(t('common.ist')) + '</abbr></span>' +
            '</li>';
        }).join('');
        var link = signupLink(cls);
        var action = cls.signupOpen
          ? '<a class="btn btn-primary btn-block" href="' + escapeHTML(link.href) + '"' + externalAttrs(link.external) +
              ' aria-label="' + escapeHTML(t('classes.signUpAria', { name: name }) + (link.external ? ' ' + t('common.newTab') : '')) + '">' +
              escapeHTML(t('classes.signUp')) + '</a>'
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
            focusHTML(cls) +
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

    /* Short class cards for the Join page. */
    'class-summary': function (el) {
      el.innerHTML = (C.classes || []).map(function (cls) {
        var icons = (C.images && C.images.classIcons) || {};
        var icon = icons[cls.id]
          ? '<img class="class-icon" src="' + escapeHTML(icons[cls.id]) + '" alt="" width="48" height="48" loading="lazy" decoding="async">'
          : '';
        return '<li class="card summary-card">' +
          '<div class="class-card-head">' + icon +
            '<div><h3 class="class-name">' + escapeHTML(className(cls)) + '</h3>' +
            '<p class="class-for">' + escapeHTML(t(cls.gradeKey)) + '</p></div>' +
          '</div>' +
          focusHTML(cls) +
          '</li>';
      }).join('');
    },

    /* "Weekly schedule at a glance": one row per class version, sorted by day and time. */
    schedule: function (el) {
      var rows = [];
      (C.classes || []).forEach(function (cls) {
        (cls.versions || []).forEach(function (v) {
          rows.push({ cls: cls, v: v, sort: dayIndex(v.day) * 10000 + startMinutes(v.timeIST) });
        });
      });
      rows.sort(function (a, b) { return a.sort - b.sort; });
      if (!rows.length) {
        el.innerHTML = '<p class="empty-note">' + escapeHTML(t('schedule.empty')) + '</p>';
        return;
      }
      el.innerHTML = '<table class="schedule-table">' +
        '<caption>' + escapeHTML(t('schedule.caption')) + '</caption>' +
        '<thead><tr>' +
          '<th scope="col">' + escapeHTML(t('schedule.day')) + '</th>' +
          '<th scope="col">' + escapeHTML(t('schedule.time')) + '</th>' +
          '<th scope="col">' + escapeHTML(t('schedule.class')) + '</th>' +
          '<th scope="col">' + escapeHTML(t('schedule.language')) + '</th>' +
        '</tr></thead><tbody>' +
        rows.map(function (r) {
          return '<tr data-language="' + escapeHTML(r.v.language) + '">' +
            '<td>' + dayHTML(r.v.day) + '</td>' +
            '<td class="schedule-time"><span lang="en">' + escapeHTML(timeText(r.v.timeIST)) + '</span></td>' +
            '<th scope="row">' + escapeHTML(className(r.cls)) + '</th>' +
            '<td><span class="lang-pill" data-language="' + escapeHTML(r.v.language) + '">' + escapeHTML(tr('lang', r.v.language)) + '</span></td>' +
            '</tr>';
        }).join('') +
        '</tbody></table>';
      applyClassFilter();
    },

    'class-list': function (el) {
      el.innerHTML = (C.classes || []).map(function (cls) {
        return '<li>' + escapeHTML(className(cls)) + '</li>';
      }).join('');
    },

    /* Every "Sign up" call to action outside the class cards. */
    'signup-link': function (el) {
      var link = signupLink(null);
      el.setAttribute('href', link.href);
      if (link.external) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      } else {
        el.removeAttribute('target');
        el.removeAttribute('rel');
      }
      var note = el.querySelector('.new-tab-note');
      if (note) note.hidden = !link.external;
    },

    social: function (el) {
      el.innerHTML = (C.socialLinks || []).map(function (link) {
        return '<li><a href="' + escapeHTML(link.url) + '" target="_blank" rel="noopener">' + escapeHTML(link.label) +
          '<span class="visually-hidden"> ' + escapeHTML(t('common.newTab')) + '</span></a></li>';
      }).join('');
    },

    /* Left out of the page completely unless flags.showTestimonials is true
       and there are real entries. First names only, never photos. */
    testimonials: function (el) {
      var list = C.testimonials || [];
      if (!(C.flags && C.flags.showTestimonials) || !list.length) {
        el.innerHTML = '';
        return;
      }
      el.innerHTML = '<section class="section" aria-labelledby="testimonials-title"><div class="container">' +
        '<h2 id="testimonials-title">' + escapeHTML(t('impact.testimonialsTitle')) + '</h2>' +
        '<ul class="testimonial-grid">' + list.map(function (item) {
          var role = item.role ? ', ' + escapeHTML(tr('role', item.role)) : '';
          return '<li class="card testimonial"><blockquote><p>' + escapeHTML(item.quote) + '</p></blockquote>' +
            '<p class="testimonial-name"><span lang="en">' + escapeHTML(firstName(item.name)) + '</span>' + role + '</p></li>';
        }).join('') + '</ul></div></section>';
    },

    /* "Share your experience" button. Only rendered when feedbackFormUrl is real. */
    feedback: function (el) {
      if (!isRealUrl(C.feedbackFormUrl)) {
        el.innerHTML = '';
        return;
      }
      el.innerHTML = '<section class="section section--tint" aria-labelledby="feedback-title"><div class="container">' +
        '<h2 id="feedback-title">' + escapeHTML(t('impact.feedbackTitle')) + '</h2>' +
        '<p class="section-intro">' + escapeHTML(t('impact.feedbackBody')) + '</p>' +
        '<a class="btn btn-primary" href="' + escapeHTML(C.feedbackFormUrl.trim()) + '"' + externalAttrs(true) + '>' +
          escapeHTML(t('impact.feedbackCta')) + newTabNote(true) + '</a>' +
        '</div></section>';
    },

    /* Photo gallery. Left out of the page while images.gallery is empty. */
    gallery: function (el) {
      var list = ((C.images && C.images.gallery) || []).filter(function (img) { return img && img.src; });
      if (!list.length) {
        el.innerHTML = '';
        return;
      }
      el.innerHTML = '<section class="section" aria-labelledby="gallery-title"><div class="container">' +
        '<h2 id="gallery-title">' + escapeHTML(t('classes.galleryTitle')) + '</h2>' +
        '<ul class="gallery-row">' + list.map(function (img) {
          return '<li class="gallery-item"><figure>' +
            '<img src="' + escapeHTML(img.src) + '" alt="' + escapeHTML(img.alt || '') + '" width="' + (Number(img.width) || 800) +
              '" height="' + (Number(img.height) || 600) + '" loading="lazy" decoding="async">' +
            (img.caption ? '<figcaption lang="en">' + escapeHTML(img.caption) + '</figcaption>' : '') +
            '</figure></li>';
        }).join('') + '</ul></div></section>';
    },

    /* "A look inside our curriculum packets". Left out while the list is empty. */
    samples: function (el) {
      var list = (C.curriculumSamples || []).filter(function (s) { return s && s.title; });
      if (!list.length) {
        el.innerHTML = '';
        return;
      }
      var names = {};
      (C.classes || []).forEach(function (cls) { names[cls.id] = className(cls); });
      el.innerHTML = '<section class="section" aria-labelledby="samples-title"><div class="container">' +
        '<h2 id="samples-title">' + escapeHTML(t('classes.samplesTitle')) + '</h2>' +
        '<p class="section-intro">' + escapeHTML(t('classes.samplesIntro')) + '</p>' +
        '<ul class="sample-grid">' + list.map(function (s) {
          var preview = s.previewImage
            ? '<img class="sample-preview" src="' + escapeHTML(s.previewImage) + '" alt="' +
                escapeHTML(t('classes.samplePreviewAlt', { title: s.title })) + '" width="600" height="776" loading="lazy" decoding="async">'
            : '';
          var link = s.fileUrl
            ? '<a class="link-arrow" href="' + escapeHTML(s.fileUrl) + '" target="_blank" rel="noopener">' +
                escapeHTML(t('classes.sampleLink')) + '<span class="visually-hidden">: ' + escapeHTML(s.title) + ' ' + escapeHTML(t('common.newTab')) + '</span></a>'
            : '';
          return '<li class="card sample-card">' + preview +
            (names[s.classId] ? '<p class="sample-class">' + escapeHTML(names[s.classId]) + '</p>' : '') +
            '<h3 class="sample-title" lang="en">' + escapeHTML(s.title) + '</h3>' +
            (s.description ? '<p lang="en">' + escapeHTML(s.description) + '</p>' : '') +
            link + '</li>';
        }).join('') + '</ul></div></section>';
    },

    /* Fundraise page ideas, from SITE_CONFIG.fundraiseIdeas. */
    'fundraise-ideas': function (el) {
      el.innerHTML = (C.fundraiseIdeas || []).map(function (idea) {
        var titleLang = trIsFallback('idea', idea.title) ? ' lang="en"' : '';
        var exLang = idea.examples && trIsFallback('idea', idea.examples) ? ' lang="en"' : '';
        return '<li class="card idea-card">' +
          '<h3' + titleLang + '>' + escapeHTML(tr('idea', idea.title)) + '</h3>' +
          (idea.examples ? '<p' + exLang + '>' + escapeHTML(tr('idea', idea.examples)) + '</p>' : '') +
          '</li>';
      }).join('');
    }
  };

  function focusHTML(cls) {
    if (!cls.focus) return '';
    var lang = trIsFallback('focus', cls.focus) ? ' lang="en"' : '';
    return '<p class="class-focus"><span class="class-focus-label">' + escapeHTML(t('classes.focus')) + '</span> ' +
      '<span' + lang + '>' + escapeHTML(tr('focus', cls.focus)) + '</span></p>';
  }

  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  function dayIndex(day) {
    var i = DAYS.indexOf(day);
    return i === -1 ? DAYS.length : i;
  }

  /* "6:00 PM to 7:00 PM" -> 1080 (minutes after midnight). */
  function startMinutes(timeIST) {
    var m = /(\d{1,2}):(\d{2})\s*([AP]M)/i.exec(String(timeIST || ''));
    if (!m) return 0;
    var h = Number(m[1]) % 12;
    if (m[3].toUpperCase() === 'PM') h += 12;
    return h * 60 + Number(m[2]);
  }

  /* Initials from the first and last word, counted in graphemes so accented
     letters and emoji stay whole. "Jo" -> "J", "Shreyas Jami" -> "SJ". */
  function initials(name) {
    var words = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '';
    var pick = words.length > 1 ? [words[0], words[words.length - 1]] : [words[0]];
    return pick.map(function (w) { return firstGrapheme(w).toLocaleUpperCase(); }).join('');
  }
  function firstGrapheme(word) {
    if (window.Intl && Intl.Segmenter) {
      var it = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(word)[Symbol.iterator]().next();
      return it.done ? '' : it.value.segment;
    }
    return Array.from(word)[0] || '';
  }
  function initialsAvatar(name) {
    return '<span class="founder-photo founder-initials" role="img" aria-label="' +
      escapeHTML(t('about.founderPhotoAlt', { name: name })) + '"><span aria-hidden="true" lang="en">' + escapeHTML(initials(name)) + '</span></span>';
  }

  /* Keeps "7:00 PM" on one line: a no-break space before AM/PM. */
  function timeText(timeIST) {
    return String(timeIST || '').replace(/\s+(AM|PM)\b/gi, '\u00a0$1');
  }

  /* A class's display name. Falls back to its id rather than a raw translation key. */
  function className(cls) {
    return lookup(cls.nameKey) ? t(cls.nameKey) : (cls.name || cls.id);
  }

  /* A weekday from the config, marked lang="en" when it has no Telugu entry. */
  function dayHTML(day) {
    var lang = trIsFallback('day', day) ? ' lang="en"' : '';
    return '<span' + lang + '>' + escapeHTML(tr('day', day)) + '</span>';
  }

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
    $all('.version[data-language], .schedule-table tr[data-language]').forEach(function (row) {
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
     URL parameter preselect (?reason= on Contact)
     ------------------------------------------------------------------ */
  function getParam(name) {
    var match = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search);
    return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
  }

  function preselectFromUrl() {
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
  /* A founder photo that fails to load is swapped for its initials circle. */
  function initImageFallbacks() {
    document.addEventListener('error', function (event) {
      var img = event.target;
      if (!img || img.tagName !== 'IMG' || !img.classList.contains('founder-photo')) return;
      var span = document.createElement('span');
      span.className = 'founder-photo founder-initials';
      span.setAttribute('role', 'img');
      span.setAttribute('aria-label', img.getAttribute('alt') || '');
      span.innerHTML = '<span aria-hidden="true" lang="en">' + escapeHTML(img.getAttribute('data-initials') || '') + '</span>';
      img.replaceWith(span);
    }, true);
  }

  function init() {
    document.documentElement.classList.add('js');
    initImageFallbacks();
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
  window.LTG = { setLanguage: function (lang) { setLanguage(lang, true); }, t: t, isRealUrl: isRealUrl, rerender: function () { setLanguage(state.lang, false); } };

  init();
})();
