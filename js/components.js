/* =====================================================================
   SHARED HEADER AND FOOTER
   ---------------------------------------------------------------------
   Defined once here and injected into <header id="site-header"> and
   <footer id="site-footer"> on every page. The English text below is the
   default; js/main.js swaps it for Telugu and fills in values from
   js/site-config.js (organization name, tagline, email, Sadhana's name).
   Each page sets <body data-page="..."> so the current link is marked.
   ===================================================================== */

(function () {
  'use strict';

  /* Header navigation, in order. `page` matches <body data-page>. */
  var NAV = [
    { page: 'home', href: 'index.html', key: 'nav.home', label: 'Home' },
    { page: 'about', href: 'about.html', key: 'nav.about', label: 'About' },
    { page: 'classes', href: 'classes.html', key: 'nav.classes', label: 'Classes' },
    { page: 'volunteer', href: 'volunteer.html', key: 'nav.volunteer', label: 'Volunteer' },
    { page: 'impact', href: 'impact.html', key: 'nav.impact', label: 'Impact' },
    { page: 'donate', href: 'donate.html', key: 'nav.donate', label: 'Donate' },
    { page: 'contact', href: 'contact.html', key: 'nav.contact', label: 'Contact' }
  ];

  /* Footer links: every page except 404. */
  var FOOTER_LINKS = NAV.slice(0, 3).concat(
    [{ page: 'join', href: 'join.html', key: 'nav.join', label: 'Join a Class' }],
    NAV.slice(3)
  );

  /* Pages that live under a nav section without being in the nav. */
  var SECTION_OF = { join: 'classes' };

  function navLinks(items, currentPage) {
    var section = SECTION_OF[currentPage];
    return items.map(function (item) {
      var current = '';
      if (item.page === currentPage) {
        current = ' aria-current="page"';
      } else if (item.page === section) {
        current = ' aria-current="true"';
      }
      return '<li><a href="' + item.href + '"' + current + ' data-i18n="' + item.key + '">' + item.label + '</a></li>';
    }).join('');
  }

  function headerTemplate(currentPage) {
    return '' +
      '<div class="header-bar">' +
        '<div class="container header-inner">' +
          '<a class="wordmark" href="index.html" lang="en" data-config="orgName" data-i18n-attr="aria-label:nav.homeLabel">Learn To Give</a>' +
          '<div class="header-actions">' +
            '<div class="lang-toggle" role="group" aria-label="Choose language" data-i18n-attr="aria-label:lang.groupLabel">' +
              '<button type="button" class="lang-btn" data-lang="en" lang="en" aria-pressed="true">English</button>' +
              '<button type="button" class="lang-btn" data-lang="te" lang="te" aria-pressed="false">తెలుగు</button>' +
            '</div>' +
            '<button type="button" class="nav-toggle" aria-expanded="false" aria-controls="primary-nav">' +
              '<span class="nav-toggle-icon" aria-hidden="true"><span></span><span></span><span></span></span>' +
              '<span class="nav-toggle-label" data-i18n="nav.menu">Menu</span>' +
            '</button>' +
          '</div>' +
          '<nav id="primary-nav" class="primary-nav" aria-label="Main" data-i18n-attr="aria-label:nav.primaryLabel">' +
            '<ul>' + navLinks(NAV, currentPage) + '</ul>' +
          '</nav>' +
        '</div>' +
      '</div>' +
      '<div class="te-notice" role="note" data-show-lang="te" data-flag="showTeluguReviewNotice" hidden>' +
        '<div class="container"><p data-i18n="notice.teluguReview">This Telugu translation is still being reviewed and may contain mistakes.</p></div>' +
      '</div>';
  }

  function footerTemplate(currentPage) {
    return '' +
      '<div class="container footer-inner">' +
        '<div class="footer-brand">' +
          '<p class="footer-name" lang="en" data-config="orgName">Learn To Give</p>' +
          '<p class="footer-tagline" data-config="tagline">Learning that gives back.</p>' +
          '<p class="footer-email"><span data-i18n="footer.emailLabel">Email us:</span> <a data-mailto lang="en"></a></p>' +
        '</div>' +
        '<nav class="footer-nav" aria-labelledby="footer-pages-heading">' +
          '<h2 id="footer-pages-heading" class="footer-heading" data-i18n="footer.pages">Pages</h2>' +
          '<ul>' + navLinks(FOOTER_LINKS, currentPage) + '</ul>' +
        '</nav>' +
        '<div class="footer-social" data-show-if="socialLinks" hidden>' +
          '<h2 class="footer-heading" data-i18n="footer.follow">Follow us</h2>' +
          '<ul data-render="social"></ul>' +
        '</div>' +
        '<p class="footer-disclaimer" data-i18n="footer.disclaimer">We are a student-run group partnering with Sadhana Society for the Mentally Handicapped. We are not a registered charity and cannot offer tax receipts.</p>' +
      '</div>';
  }

  window.LTG_COMPONENTS = {
    nav: NAV,
    header: headerTemplate,
    footer: footerTemplate
  };

  var page = document.body ? document.body.getAttribute('data-page') : '';
  var headerEl = document.getElementById('site-header');
  var footerEl = document.getElementById('site-footer');
  if (headerEl) headerEl.innerHTML = headerTemplate(page);
  if (footerEl) footerEl.innerHTML = footerTemplate(page);
})();
