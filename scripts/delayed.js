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

function hex(bytes) {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
/**
 * Generates a cryptographically secure unique page view identifier.
 *
 * Produces a 64-character hexadecimal string compatible with
 * analytics correlation and tracking requirements.
 *
 * @returns {string} Unique pageView ID.
 */
function generatePageViewId() {
  const bytes = new Uint8Array(32); // 32 bytes = 64 hex chars
  crypto.getRandomValues(bytes);
  return hex(bytes);
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
function getLocaleData() {
  const { pathname, hostname, href } = window.location;

  const localeMatch = pathname.match(/^\/([a-z]{2})-([a-z]{2})(\/|$)/i);
  const pageLang = localeMatch ? localeMatch[1].toLowerCase() : '';
  const country = localeMatch ? localeMatch[2].toLowerCase() : '';

  const stripped = pathname
    .replace(/^\/[a-z]{2}-[a-z]{2}(\/|$)/i, '')
    .replace(/\/$/, '');

  const segments = stripped ? stripped.split('/').filter(Boolean) : [];

  const pageSection = 'madridistas';
  const pageLevel1 = segments[0] || 'home';
  const pageLevel2 = segments[1] || '';
  const pageLevel3 = segments[2] || '';
  const pageLevel4 = segments[3] || '';
  const pageType = getMetadata('page-type') || (segments.length ? segments[0] : 'home');
  const pageName = [pageSection, pageLevel1, pageLevel2, pageLevel3, pageLevel4]
    .filter(Boolean)
    .join(':');

  return {
    pageSection,
    pageName,
    pageLevel1,
    pageLevel2,
    pageLevel3,
    pageLevel4,
    pageType,
    country,
    pageLang,
    pagePath: pathname,
    pageURL: href,
    pageDomain: hostname,
    pageTopDomain: hostname.includes('.') ? `.${hostname.split('.').slice(-1)[0]}` : '',
    pageTitle: document.title || '',
  };
}
/**
 * Builds the complete Adobe Data Layer pageLoad payload.
 *
 * This method centralizes all analytics-related page context,
 * including:
 * - web page metadata
 * - environment details
 * - referrer information
 * - user placeholders
 * - campaign placeholders
 * - subscription placeholders
 * - generated pageView identifier
 *
 * The structure is aligned with the existing analytics schema
 * used in the migration project.
 *
 * @returns {Object} Adobe Data Layer pageLoad object.
 */
function buildPageLoadObject() {
  const {
    pageSection,
    pageName,
    pageLevel1,
    pageLevel2,
    pageLevel3,
    pageLevel4,
    pageType,
    country,
    pageLang,
    pagePath,
    pageURL,
    pageDomain,
    pageTopDomain,
    pageTitle,
  } = getLocaleData();

  return {
    webPageDetails: {
      pageName,
      pageChannel: 'web',
      pageURL,
      pageSection,
      pageLevel1,
      pageLevel2,
      pageLevel3,
      pageLevel4,
      pageType,
      pageAnchor: window.location.hash || '',
      pagePath,
      pageTopDomain,
      pageDomain,
      pageTitle,
      pageLoadType: 'sequential',
      cms: 'aem',
      pageLang,
      country,
      siteEnviroment: getMetadata('site-environment') || 'pro',
      viewName: pagePath,
      userAgent: navigator.userAgent || '',
    },
    environment: {
      acceptLanguage: navigator.language || navigator.languages?.[0] || '',
    },
    webReferrer: {
      previousPagePath: document.referrer ? new URL(document.referrer).pathname : '',
      previousName: document.referrer ? pageName : '',
      previousPageURL: document.referrer || '',
      referrer: document.referrer || '',
    },
    user: {
      userLoginStatus: 'not_authenticated',
      userLoyaltyStatus: '',
      userAge: '',
      userGender: '',
      userCategory: '',
      userSubType: '',
      userLoginType: '',
      teamPreferences: '',
      addressCountryCode: '',
      userNumber: '',
    },
    campaign: {
      campaignID: '',
      campaignSource: '',
      campaignMedium: '',
      campaignContent: '',
      intCampaign: '',
      behalfClientId: '',
    },
    funnelInfo: {
      funnelType: '',
      funnelSeat: '',
      funnelPlace: '',
      funnelArea: '',
      funnelVersion: '',
    },
    promotion: {
      promotionID: '',
    },
    identification: {
      idpID: '',
      hashedEmail: '',
      correlationIdpID: '',
    },
    subscription: {
      nextPaymentDate: '',
      nextPaymentDays: null,
      paymentMethod: '',
      creditCardExpirationDate: '',
      creditCardExpirationDays: null,
      creationDate: '',
      creationDays: null,
      status: '',
      billingCycle: '',
      planItem: '',
    },
    pageInfo: {
      pageViewID: generatePageViewId(),
    },
    event: 'pageLoad',
  };
}

/**
 * Pushes the pageLoad event to Adobe Data Layer.
 */
function pushPageLoadEvent() {
  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.push(buildPageLoadObject());
}

/**
 * Pushes the pageLoad event to the Adobe Data Layer.
 * adobeDataLayer is a queue — it is safe to push before Launch fully initializes;
 * Launch will drain the queue when it loads.
 */
function pushPageLoadEvent() {
  window.adobeDataLayer = window.adobeDataLayer || [];
  const {
    pageSection, pageName, pageLevel1, pageLevel2, pageLevel3, pageType, country,
  } = buildPageData();
  window.adobeDataLayer.push({
    event: 'pageLoad',
    webPageDetails: {
      pageName,
      pageSection,
      pageLevel1,
      pageLevel2,
      pageLevel3,
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
