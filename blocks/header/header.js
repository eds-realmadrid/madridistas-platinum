import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  const sections = [...nav.children].filter((child) => child.tagName !== 'HR');
  classes.forEach((c, i) => {
    if (sections[i]) sections[i].classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  // Language switcher
  const languages = [
    { code: 'en-us', label: 'EN' },
    { code: 'es-es', label: 'ES' },
  ];
  const currentPath = window.location.pathname;
  const currentLang = languages.find((l) => currentPath.includes(l.code)) || languages[1];

  const langSwitcher = document.createElement('div');
  langSwitcher.className = 'nav-lang-switcher';

  const currentBtn = document.createElement('button');
  currentBtn.type = 'button';
  currentBtn.className = 'nav-lang-current';
  currentBtn.setAttribute('aria-expanded', 'false');
  currentBtn.setAttribute('aria-label', 'Switch language');
  currentBtn.innerHTML = `<span>${currentLang.label}</span>`
    + '<svg width="12" height="12" viewBox="0 0 12 12" fill="none">'
    + '<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
    + '</svg>';

  const dropdown = document.createElement('div');
  dropdown.className = 'nav-lang-dropdown';
  languages.filter((l) => l.code !== currentLang.code).forEach((lang) => {
    const langPath = currentPath.includes(currentLang.code)
      ? currentPath.replace(currentLang.code, lang.code)
      : currentPath.replace(/\/?$/, `/${lang.code}`);
    const link = document.createElement('a');
    link.href = langPath;
    link.textContent = lang.label;
    dropdown.append(link);
  });

  currentBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const expanded = currentBtn.getAttribute('aria-expanded') === 'true';
    currentBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  });

  document.addEventListener('click', () => {
    currentBtn.setAttribute('aria-expanded', 'false');
  });

  langSwitcher.append(currentBtn, dropdown);
  nav.append(langSwitcher);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // Sticky bottom CTA banner — read content from nav tools section
  const navTools = nav.querySelector('.nav-tools');
  const bottomBanner = document.createElement('div');
  bottomBanner.className = 'nav-bottom-banner';
  const bannerText = navTools?.querySelector('p:not(:has(a))')?.textContent || '';
  const bannerLink = navTools?.querySelector('a');
  if (bannerText && bannerLink) {
    bottomBanner.innerHTML = `
      <span class="nav-bottom-banner-text">${bannerText}</span>
      <a href="${bannerLink.href}" class="nav-bottom-banner-cta">${bannerLink.textContent}</a>
    `;
    navTools.textContent = '';
  }
  block.append(bottomBanner);

  // Toggle solid background on scroll + show/hide bottom banner (throttled)
  let ticking = false;

  const updateScrollState = () => {
    navWrapper.classList.toggle('scrolled', window.scrollY > 50);

    const pricingSection = document.querySelector('.pricing-plans-container');
    if (pricingSection) {
      const rect = pricingSection.getBoundingClientRect();
      bottomBanner.classList.toggle('visible', rect.top < window.innerHeight);
    }
  };

  const onScroll = () => {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(() => {
      updateScrollState();
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  updateScrollState();
}
