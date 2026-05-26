/**
 * Injects an external script tag into <head> with optional attributes.
 * Used for loading Launch and any other third-party scripts in the delayed phase.
 */
function loadScript(src, attrs = {}) {
  const script = document.createElement('script');
  script.src = src;
  Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v));
  document.head.appendChild(script);
}

function getMetadata(name) {
  const meta = document.head.querySelector(`meta[name="${name}"]`);
  return meta?.content?.trim() || '';
}

/**
 * Derives structured page data from the current URL pathname.
 *
 * Levels 1–3 are fixed for this site: landing / platinum / home.
 * Any path segments after the locale prefix populate pageLevel4 onward.
 *
 * Examples:
 *   /es-es                  → levels 1-3 fixed, no dynamic levels, pagePath=/es-es
 *   /es-es/beneficios       → levels 1-3 fixed, pageLevel4=beneficios, pagePath=/es-es/beneficios
 *   /es-es/foo/bar          → levels 1-3 fixed, pageLevel4=foo, pageLevel5=bar,
 *                             pagePath=/es-es/foo/bar
 *
 * pageUrl  — full URL, e.g. https://main--madridistas-platinum--eds-realmadrid.aem.page/es-es
 * pagePath — pathname only, e.g. /es-es or /es-es/sample
 */
function buildPageData() {
  const { pathname, href } = window.location;

  const localeMatch = pathname.match(/^\/([a-z]{2})-([a-z]{2})(\/|$)/);
  const country = localeMatch ? localeMatch[2] : 'es';

  // Fixed levels — always same
  const pageLevel1 = 'landing';
  const pageLevel2 = 'platinum';
  const pageLevel3 = 'home';

  // Dynamic levels — path segments after the locale prefix map to pageLevel4+
  const stripped = pathname
    .replace(/^\/[a-z]{2}-[a-z]{2}(\/|$)/, '')
    .replace(/\/$/, '');
  const segments = stripped ? stripped.split('/').filter(Boolean) : [];

  const dynamicLevels = {};
  segments.forEach((seg, i) => { dynamicLevels[`pageLevel${i + 4}`] = seg; });

  const pageSection = 'madridistas';
  const pageLevels = {
    pageLevel1, pageLevel2, pageLevel3, ...dynamicLevels,
  };
  const pageName = [pageSection, ...Object.values(pageLevels)].join(':');
  const pageType = getMetadata('page-type') || '';
  const pageUrl = href;
  const pagePath = pathname;

  return {
    pageSection, pageName, ...pageLevels, pageType, country, pageUrl, pagePath,
  };
}

/**
 * Pushes the pageLoad event to the Adobe Data Layer.
 * adobeDataLayer is a queue — it is safe to push before Launch fully initializes;
 * Launch will drain the queue when it loads.
 */
function pushPageLoadEvent() {
  window.adobeDataLayer = window.adobeDataLayer || [];
  const {
    pageSection, pageName, pageType, country, pageUrl, pagePath, ...pageLevels
  } = buildPageData();
  window.adobeDataLayer.push({
    event: 'pageLoad',
    webPageDetails: {
      pageName,
      pageSection,
      ...pageLevels,
      pageType,
      pageLoadType: 'sequential',
      cms: 'aem',
      country,
      pageUrl,
      pagePath,
    },
  });
}

/**
 * Loads the Adobe Launch (DTM) library and immediately pushes the pageLoad event.
 * Called only after OneTrust has signalled consent readiness via RMOneTrustLoaded,
 * ensuring consent state is available to Launch rules when they fire.
 */
function loadLaunch() {
  loadScript(
    'https://assets.adobedtm.com/ab05854e772b/386400a5741e/launch-938e6c931256-development.min.js',
    /* 'https://assets.adobedtm.com/ab05854e772b/386400a5741e/launch-19612895918c.min.js', */
    { async: '' },
  );
  pushPageLoadEvent();
}

// OneTrust fires the RMOneTrustLoaded event (via OptanonWrapper in head.html) once
// the consent banner has initialised and consent decisions are readable.
// We gate Launch loading on this event to prevent any tracking before consent.
// In practice OneTrust resolves well before the 3s delayed phase fires,
// so the guard below is effectively always true — but kept for safety.
if (window.RMOneTrustLoaded) {
  loadLaunch();
} else {
  window.addEventListener('RMOneTrustLoaded', loadLaunch, { once: true });
}
