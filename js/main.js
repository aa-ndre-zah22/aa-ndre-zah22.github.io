(function () {
  var Router = window.Router;
  Router.registerScreen('tv-intro', window.Screens.tvIntro);
  Router.registerScreen('landing', window.Screens.landing);
  Router.registerScreen('signin', window.Screens.signin);
  Router.registerScreen('mixer', window.Screens.mixer);
  Router.registerScreen('listen', window.Screens.listen);
  Router.registerScreen('draw', window.Screens.draw);
  Router.registerScreen('save', window.Screens.save);
  Router.registerScreen('pinmap', window.Screens.pinmap);
  Router.registerScreen('memorypin', window.Screens.memorypin);
  Router.registerScreen('exploremap', window.Screens.exploremap);
  Router.registerScreen('share', window.Screens.share);
  Router.registerScreen('search', window.Screens.search);
  Router.registerScreen('profile', window.Screens.profile);

  var startAt = window.location.hash.replace('#', '') || 'tv-intro';
  Router.navigate(startAt);
})();
