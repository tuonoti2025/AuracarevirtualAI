(function () {
  'use strict';
  var language = 'fi';
  try { language = localStorage.getItem('auracare-language') === 'en' ? 'en' : 'fi'; } catch (_) {}
  window.AuraCareLanguage = {
    get: function () { return language; },
    set: function (value) {
      language = value === 'en' ? 'en' : 'fi';
      document.documentElement.lang = language;
      try { localStorage.setItem('auracare-language', language); } catch (_) {}
      window.dispatchEvent(new Event('auracare-language'));
    }
  };
  document.documentElement.lang = language;
})();
