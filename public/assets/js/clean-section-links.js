(function () {
  var sectionIds = ['gallery', 'pricing', 'services', 'testimonials', 'access'];

  function isHomePath() {
    return window.location.pathname === '/' || window.location.pathname === '/index.html';
  }

  function cleanHomeUrl() {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, document.title, '/');
    }
  }

  function scrollToHomeSection(sectionId) {
    var target = document.getElementById(sectionId);
    if (!target) return false;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    cleanHomeUrl();
    return true;
  }

  function scrollToHomeSectionWhenStable(sectionId) {
    scrollToHomeSection(sectionId);
    window.setTimeout(function () { scrollToHomeSection(sectionId); }, 450);
    window.setTimeout(function () { scrollToHomeSection(sectionId); }, 1100);
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[data-home-section]');
    if (!link) return;

    var sectionId = link.getAttribute('data-home-section');
    if (sectionIds.indexOf(sectionId) === -1) return;

    event.preventDefault();
    try {
      window.sessionStorage.setItem('golynHomeSection', sectionId);
    } catch (error) {}

    if (isHomePath()) {
      scrollToHomeSectionWhenStable(sectionId);
      return;
    }

    window.location.assign('/?section=' + encodeURIComponent(sectionId));
  });

  document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var requestedSection = params.get('section');
    var storedSection = null;

    try {
      storedSection = window.sessionStorage.getItem('golynHomeSection');
      window.sessionStorage.removeItem('golynHomeSection');
    } catch (error) {}

    var sectionId = requestedSection || storedSection || window.location.hash.replace('#', '');
    if (sectionIds.indexOf(sectionId) === -1) return;

    window.setTimeout(function () {
      scrollToHomeSectionWhenStable(sectionId);
    }, 80);
  });
})();
