const gaTracker = 'GatewayPropertyTracker';

const loadGA = () => {
  (function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    (i[r] =
      i[r] ||
      function () {
        // eslint-disable-next-line prefer-rest-params
        (i[r].q = i[r].q || []).push(arguments);
      }),
      (i[r].l = 1 * new Date());
    (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
  })(
    window,
    document,
    'script',
    'https://www.google-analytics.com/analytics.js',
    'ga',
  );
};

const buildGoogleAnalyticsEvent = (event) => ({
  eventCategory: 'identity',
  eventAction: event.name,
  eventLabel: event.type,
  dimension3: 'profile.theguardian.com',
  dimension4: navigator.userAgent,
  dimension5: window.location.href,
  forceSSL: true,
});

export const init = () => {
  loadGA();
  window.ga('create', window.gaUID, 'auto', gaTracker);
  window.ga(gaTracker + '.send', 'pageview');
};

export const customMetric = (event) => {
  window.ga(gaTracker + '.send', 'event', buildGoogleAnalyticsEvent(event));
};

export const fetchTracker = (callback) => {
  window.ga(function () {
    const tracker = window.ga.getByName(gaTracker);
    return callback(tracker);
  });
};

export const pageView = (path = location.pathname) => {
  window.ga(gaTracker + '.send', 'pageview', path);
};
