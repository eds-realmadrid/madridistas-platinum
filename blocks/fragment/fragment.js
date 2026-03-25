/*
 * Fragment Block
 * Include content on a page as a fragment.
 * https://www.aem.live/developer/block-collection/fragment
 */

// eslint-disable-next-line import/no-cycle
import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadSections,
} from '../../scripts/aem.js';

/**
 * Returns same-origin candidate base paths (code base, then pathname prefixes).
 */
function getSameOriginBaseCandidates() {
  const candidates = [];
  if (window.hlx && window.hlx.codeBasePath) {
    candidates.push(window.hlx.codeBasePath.replace(/\/$/, ''));
  }

  const { pathname } = window.location;
  const segments = pathname.split('/').filter(Boolean);
  const prefixes = segments.reduce((acc, segment) => {
    const previousPrefix = acc[acc.length - 1] || '';
    const nextPrefix = `${previousPrefix}/${segment}`;
    if (!candidates.includes(nextPrefix) && !acc.includes(nextPrefix)) {
      acc.push(nextPrefix);
    }
    return acc;
  }, []);

  const allCandidates = candidates.concat(prefixes);
  if (!allCandidates.includes('')) allCandidates.push('');
  return allCandidates;
}

/**
 * Returns the content source base URL when running on EDS (e.g. *.aem.page).
 * Derived from hostname main--vodafone-poc--jmanuelbr.aem.page
 * -> https://content.da.live/jmanuelbr/vodafone-poc
 * or from meta name="content-source" if set.
 */
function getContentSourceBaseUrl() {
  const meta = document.querySelector('meta[name="content-source"]');
  if (meta?.content) return meta.content.replace(/\/$/, '');
  const host = window.location.hostname;
  if (!host.endsWith('.aem.page')) return null;
  const parts = host.split('--');
  if (parts.length < 3) return null;
  const owner = parts[parts.length - 1].replace(/\.aem\.page$/i, '');
  const repo = parts[parts.length - 2];
  return `https://content.da.live/${owner}/${repo}`;
}

/**
 * Returns true when running on EDS (preview or live).
 */
function isEDSHost() {
  const host = window.location.hostname;
  return host.endsWith('.aem.page') || host.endsWith('.aem.live');
}

/**
 * Returns raw GitHub base URL for the repo (branch from hostname, e.g. main).
 * Used when content.da.live returns 401; raw GitHub is public.
 * Supports both *.aem.page (preview) and *.aem.live (live).
 */
function getGitHubContentBaseUrl() {
  const host = window.location.hostname;
  if (!isEDSHost()) return null;
  const parts = host.split('--');
  if (parts.length < 3) return null;
  const ref = parts[0] || 'main';
  const repo = parts[parts.length - 2];
  const owner = parts[parts.length - 1].replace(/\.aem\.(page|live)$/i, '');
  return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}`;
}

function getSameOriginUrl(baseUrl, plainUrl) {
  if (baseUrl) return `${baseUrl}${plainUrl}`;
  return plainUrl;
}

function getRemoteUrl(baseUrl, plainName) {
  return `${baseUrl.replace(/\/$/, '')}/${plainName}`;
}

function getFragmentBaseUrl(fragmentPath, contentBaseUrl) {
  if (!contentBaseUrl) {
    return new URL(fragmentPath, window.location.origin);
  }

  const normalizedPath = fragmentPath.startsWith('/')
    ? fragmentPath.slice(1)
    : fragmentPath;
  const normalizedBaseUrl = `${contentBaseUrl.replace(/\/$/, '')}/`;
  return new URL(normalizedPath || '.', normalizedBaseUrl);
}

function getCachedFragmentRequest(cachedBase, path, plainUrl, plainName) {
  const isRemoteBase = cachedBase.startsWith('http');
  const url = isRemoteBase
    ? getRemoteUrl(cachedBase, plainName)
    : getSameOriginUrl(cachedBase, plainUrl);
  let fragmentPath = path;
  if (!isRemoteBase && cachedBase) {
    fragmentPath = `${cachedBase}${path}`;
  }

  return {
    url,
    fragmentPath,
    contentBaseUrl: isRemoteBase ? cachedBase : null,
  };
}

/**
 * BACKTRACK: recursion keeps same-origin probing sequential while avoiding
 * no-restricted-syntax and no-await-in-loop lint errors.
 */
async function findSameOriginFragment(baseUrls, tryFetch, path, index = 0) {
  if (index >= baseUrls.length) return null;

  const baseUrl = baseUrls[index];
  const resp = await tryFetch(baseUrl, true);
  if (resp.ok) {
    return {
      resp,
      baseUrl,
      fragmentPath: baseUrl ? `${baseUrl}${path}` : path,
    };
  }

  return findSameOriginFragment(baseUrls, tryFetch, path, index + 1);
}

/**
 * Loads a fragment: tries same-origin paths first, then content source
 * (content.da.live).
 * EDS preview often does not serve nav/footer from the page origin; they exist
 * at the content source.
 * @param {string} path The path to the fragment (e.g. /nav or /footer)
 * @returns {HTMLElement} The root element of the fragment
 */
export async function loadFragment(path) {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return null;

  const plainUrl = `${path}.plain.html`;
  const pathNoLead = path.replace(/^\//, '');
  const plainName = `${pathNoLead}.plain.html`;

  const tryFetch = (baseUrl, isSameOrigin) => {
    const url = isSameOrigin
      ? getSameOriginUrl(baseUrl, plainUrl)
      : getRemoteUrl(baseUrl, plainName);
    return fetch(url);
  };

  const processResponse = async (resp, fragmentPath, contentBaseUrl) => {
    if (!resp.ok) return null;
    const main = document.createElement('main');
    main.innerHTML = await resp.text();
    const fragmentBaseUrl = getFragmentBaseUrl(fragmentPath, contentBaseUrl);
    const resetAttributeBase = (tag, attr) => {
      main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
        elem[attr] = new URL(elem.getAttribute(attr), fragmentBaseUrl).href;
      });
    };
    resetAttributeBase('img', 'src');
    resetAttributeBase('source', 'srcset');
    decorateMain(main);
    await loadSections(main);
    return main;
  };

  const isEDS = isEDSHost();

  const tryRemoteBase = async (baseUrl) => {
    if (!baseUrl) return null;
    const resp = await fetch(getRemoteUrl(baseUrl, plainName));
    if (!resp.ok) return null;
    return resp;
  };

  // 1) Use cached base if we already found one that works.
  const cached = window.hlx?.fragmentBasePath;
  if (cached != null) {
    const cachedRequest = getCachedFragmentRequest(cached, path, plainUrl, plainName);
    const { url, fragmentPath, contentBaseUrl } = cachedRequest;
    const resp = await fetch(url);
    if (resp.ok) {
      return processResponse(resp, fragmentPath, contentBaseUrl);
    }
  }

  // 2) On EDS: only raw GitHub (e.g. raw.githubusercontent.com/owner/repo/main).
  if (isEDS) {
    const gh = getGitHubContentBaseUrl();
    const resp = gh ? await tryRemoteBase(gh) : null;
    if (resp) {
      if (window.hlx) window.hlx.fragmentBasePath = gh;
      return processResponse(resp, path, gh);
    }
    return null;
  }

  // 3) Local / non-EDS: same-origin path candidates, then content source, then raw GitHub.
  const sameOriginBases = getSameOriginBaseCandidates();
  const sameOriginMatch = await findSameOriginFragment(sameOriginBases, tryFetch, path);
  if (sameOriginMatch) {
    if (window.hlx) window.hlx.fragmentBasePath = sameOriginMatch.baseUrl;
    return processResponse(sameOriginMatch.resp, sameOriginMatch.fragmentPath, null);
  }

  const contentBase = getContentSourceBaseUrl();
  if (contentBase) {
    const resp = await tryRemoteBase(contentBase);
    if (resp) {
      if (window.hlx) window.hlx.fragmentBasePath = contentBase;
      return processResponse(resp, path, contentBase);
    }
  }

  const gh = getGitHubContentBaseUrl();
  if (gh) {
    const resp = await tryRemoteBase(gh);
    if (resp) {
      if (window.hlx) window.hlx.fragmentBasePath = gh;
      return processResponse(resp, path, gh);
    }
  }

  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) block.replaceChildren(...fragment.childNodes);
}
