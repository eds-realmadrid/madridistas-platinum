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
 * URL format: /{language}-{country}/{level1}/{level2}/{level3}
 * Examples:
 *   /es-es                        → country=es, level1=home
 *   /en-us/landing/platinum/home  → country=us, level1=landing, level2=platinum, level3=home
 *
 * The locale prefix encodes both language (first part) and country (second part),
 * e.g. "en-us" → language=en, country=us. We only need the country for the datalayer.
 */
function buildPageData() {
  const { pathname } = window.location;

  // Match the locale prefix at the start of the path: /xx-xx/ or /xx-xx (end of string)
  // Group 1 = language code (e.g. "es"), Group 2 = country code (e.g. "es" or "us")
  const localeMatch = pathname.match(/^\/([a-z]{2})-([a-z]{2})(\/|$)/);
  const country = localeMatch ? localeMatch[2] : 'es';

  // Strip the locale prefix (e.g. "/es-es" or "/es-es/") to get the remaining path,
  // then remove any trailing slash before splitting into segments.
  // e.g. "/es-es/landing/platinum/home" → "landing/platinum/home" → ['landing','platinum','home']
  // e.g. "/es-es" or "/es-es/" → "" → [] (treated as home)
  const stripped = pathname
    .replace(/^\/[a-z]{2}-[a-z]{2}(\/|$)/, '')
    .replace(/\/$/, '');
  const segments = stripped ? stripped.split('/').filter(Boolean) : [];

  const pageSection = 'madridistas';
  const pageLevels = {};
  segments.forEach((seg, i) => { pageLevels[`pageLevel${i + 1}`] = seg; });
  if (!pageLevels.pageLevel1) pageLevels.pageLevel1 = 'home';

  const authoredPageType = getMetadata('page-type');
  const pageType = authoredPageType || '';

  const pageName = [pageSection, ...Object.values(pageLevels)].join(':');

  return {
    pageSection, pageName, ...pageLevels, pageType, country,
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
    pageSection, pageName, pageType, country, ...pageLevels
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
