(function () {
  var s = localStorage.getItem('aiborne_theme_preference');
  var l = s === 'light' || (s !== 'dark' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
  if (l) document.documentElement.setAttribute('data-theme', 'light');
})();
